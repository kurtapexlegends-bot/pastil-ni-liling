<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Display a listing of the user's orders.
     */
    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with('items.product')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'nullable|string|in:retail,wholesale',
            'hub_id' => 'nullable|exists:hubs,id',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'total_amount' => 'required|numeric',
            'shipping_address' => 'required|string',
            'contact_number' => 'required|string',
            'payment_method' => 'required|string|in:gcash,paymaya,cod',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            return DB::transaction(function () use ($request) {
                $type = $request->input('type', 'retail');
                $hubId = $request->input('hub_id');
                $customerLat = $request->input('latitude');
                $customerLng = $request->input('longitude');

                if ($type === 'wholesale') {
                    if (!$request->user()->hasRole('Franchisee')) {
                        throw new \Exception('Access denied. Wholesale orders are restricted to registered Franchise partners.');
                    }
                    $hub = \App\Models\Hub::where('franchisee_id', $request->user()->id)->first();
                    if (!$hub) {
                        throw new \Exception('No active franchise branch associated with this account.');
                    }
                    $hubId = $hub->id;
                } else {
                    // Try to auto-route nearest hub if coordinates are provided
                    if (!is_null($customerLat) && !is_null($customerLng)) {
                        $geoService = app(\App\Services\GeoRoutingService::class);
                        $matchedHub = $geoService->findNearestHubWithStock((float) $customerLat, (float) $customerLng, $request->items);
                        if ($matchedHub) {
                            $hubId = $matchedHub->id;
                        }
                    }

                    if (!$hubId) {
                        throw new \Exception('Could not determine nearest branch hub with sufficient inventory. Please select branch manually.');
                    }
                    
                    $hub = \App\Models\Hub::where('id', $hubId)->where('status', 'active')->first();
                    if (!$hub) {
                        throw new \Exception('The selected branch is currently unavailable.');
                    }
                }

                // Verify stock for retail B2C orders
                if ($type === 'retail') {
                    foreach ($request->items as $item) {
                        $product = \App\Models\Product::findOrFail($item['product_id']);
                        $inventory = \App\Models\HubInventory::where('hub_id', $hubId)
                            ->where('product_id', $item['product_id'])
                            ->first();

                        if (!$inventory || $inventory->stock_quantity < $item['quantity']) {
                            $available = $inventory ? $inventory->stock_quantity : 0;
                            throw new \Exception("Sorry, {$product->name} is out of stock at this branch. (Available: {$available} units)");
                        }
                    }
                    
                    // Deduct stock using FIFO batches
                    $batchService = app(\App\Services\InventoryBatchService::class);
                    foreach ($request->items as $item) {
                        $batchService->deductStockFIFO($item['product_id'], $hubId, $item['quantity']);
                    }
                }

                $order = Order::create([
                    'user_id' => $request->user()?->id,
                    'hub_id' => $hubId,
                    'type' => $type,
                    'total_amount' => $request->total_amount,
                    'status' => 'pending',
                    'shipping_address' => $request->shipping_address,
                    'latitude' => $customerLat,
                    'longitude' => $customerLng,
                    'contact_number' => $request->contact_number,
                    'payment_method' => $request->payment_method,
                    'notes' => $request->notes,
                ]);

                foreach ($request->items as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'price' => $item['price'],
                    ]);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Order placed successfully!',
                    'data' => $order->load('items.product')
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to place order.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Synchronize offline POS orders taken at the franchisee stall/booth.
     */
    public function syncPOSOrders(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'orders' => 'required|array',
            'orders.*.offline_id' => 'required|string',
            'orders.*.total_amount' => 'required|numeric',
            'orders.*.payment_method' => 'required|string|in:gcash,paymaya,cod,cash',
            'orders.*.items' => 'required|array',
            'orders.*.items.*.product_id' => 'required|exists:products,id',
            'orders.*.items.*.quantity' => 'required|integer|min:1',
            'orders.*.items.*.price' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Get the active hub belonging to the logged-in franchisee user
        $hub = \App\Models\Hub::where('franchisee_id', $request->user()->id)->first();
        if (!$hub) {
            return response()->json([
                'success' => false,
                'message' => 'No active franchise branch associated with this operator account.'
            ], 403);
        }

        $hubId = $hub->id;
        $syncedOrders = [];

        try {
            DB::transaction(function () use ($request, $hubId, &$syncedOrders) {
                $batchService = app(\App\Services\InventoryBatchService::class);

                foreach ($request->orders as $orderData) {
                    // Check if order was already synced using notes containing the offline_id prefix
                    $existingOrder = Order::where('hub_id', $hubId)
                        ->where('notes', 'LIKE', "POS-OFFLINE-ID: {$orderData['offline_id']}%")
                        ->first();

                    if ($existingOrder) {
                        // Already synced, skip to prevent double-deduction of inventory
                        continue;
                    }

                    // Deduct stock using FIFO batches
                    foreach ($orderData['items'] as $item) {
                        $product = \App\Models\Product::findOrFail($item['product_id']);
                        $inventory = \App\Models\HubInventory::where('hub_id', $hubId)
                            ->where('product_id', $item['product_id'])
                            ->first();

                        if (!$inventory || $inventory->stock_quantity < $item['quantity']) {
                            $available = $inventory ? $inventory->stock_quantity : 0;
                            throw new \Exception("Failed syncing order {$orderData['offline_id']}: {$product->name} is out of stock. (Available: {$available} units)");
                        }
                    }

                    // Perform depletion
                    foreach ($orderData['items'] as $item) {
                        $batchService->deductStockFIFO($item['product_id'], $hubId, $item['quantity']);
                    }

                    // Create the POS order
                    $order = Order::create([
                        'user_id' => $request->user()->id, // franchisee acting as cashier
                        'hub_id' => $hubId,
                        'type' => 'pos', // Walk-in sale
                        'total_amount' => $orderData['total_amount'],
                        'status' => 'completed', // POS sales are instant/completed
                        'shipping_address' => 'Walk-in Stall Customer',
                        'contact_number' => 'N/A',
                        'payment_method' => $orderData['payment_method'],
                        'notes' => "POS-OFFLINE-ID: {$orderData['offline_id']}",
                    ]);

                    // Add items
                    foreach ($orderData['items'] as $item) {
                        OrderItem::create([
                            'order_id' => $order->id,
                            'product_id' => $item['product_id'],
                            'quantity' => $item['quantity'],
                            'price' => $item['price'],
                        ]);
                    }

                    $syncedOrders[] = [
                        'offline_id' => $orderData['offline_id'],
                        'online_id' => $order->id
                    ];
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'POS orders synchronized successfully.',
                'synced' => $syncedOrders
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync offline POS orders.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
