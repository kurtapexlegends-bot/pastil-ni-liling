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
                    if (!$hubId) {
                        throw new \Exception('Please select a branch to fulfill your order.');
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
                    
                    // Deduct stock
                    foreach ($request->items as $item) {
                        $inventory = \App\Models\HubInventory::where('hub_id', $hubId)
                            ->where('product_id', $item['product_id'])
                            ->first();
                        $inventory->stock_quantity -= $item['quantity'];
                        $inventory->save();
                    }
                }

                $order = Order::create([
                    'user_id' => $request->user()?->id,
                    'hub_id' => $hubId,
                    'type' => $type,
                    'total_amount' => $request->total_amount,
                    'status' => 'pending',
                    'shipping_address' => $request->shipping_address,
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
}
