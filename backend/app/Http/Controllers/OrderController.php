<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    protected OrderService $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

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
     * Store a newly created order in storage.
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
            $order = $this->orderService->createCustomerOrder($request->all(), $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully!',
                'data' => $order
            ], 201);
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

        try {
            $syncedOrders = $this->orderService->syncPOSOrders($request->orders, $request->user());

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
