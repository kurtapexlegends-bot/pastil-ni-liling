<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderFulfillmentService;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    /**
     * Get all global orders.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Order::with(['items.product', 'user', 'hub'])->latest()->get()
        ]);
    }

    /**
     * Update order status globally.
     */
    public function updateStatus(Request $request, int $id, OrderFulfillmentService $fulfillmentService)
    {
        $request->validate(['status' => 'required|string']);
        $order = Order::with('items.product')->findOrFail($id);

        try {
            $order = $fulfillmentService->fulfillOrder($order, $request->status);
            
            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully!',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }
}
