<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use App\Http\Requests\StoreCustomerOrderRequest;
use App\Http\Requests\SyncPOSOrdersRequest;

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
            ->with(['items.product', 'hub'])
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
    public function store(StoreCustomerOrderRequest $request)
    {

        $idempotencyKey = $request->header('X-Idempotency-Key');
        if ($idempotencyKey) {
            $existingOrder = Order::where('idempotency_key', $idempotencyKey)->with('items.product')->first();
            if ($existingOrder) {
                return response()->json([
                    'success' => true,
                    'message' => 'Order was already processed (Idempotency Check).',
                    'data' => $existingOrder
                ], 200); // 200 OK since it's already created
            }
        }

        try {
            $orderData = $request->all();
            $orderData['idempotency_key'] = $idempotencyKey;
            $order = $this->orderService->createCustomerOrder($orderData, $request->user());

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
    public function syncPOSOrders(SyncPOSOrdersRequest $request)
    {

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
