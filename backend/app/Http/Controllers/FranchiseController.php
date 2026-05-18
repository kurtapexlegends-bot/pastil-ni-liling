<?php

namespace App\Http\Controllers;

use App\Models\Hub;
use App\Models\HubInventory;
use Illuminate\Http\Request;

class FranchiseController extends Controller
{
    /**
     * Get the active franchisee's hub details and current stock levels.
     */
    public function getInventory(Request $request)
    {
        $hub = Hub::where('franchisee_id', $request->user()->id)->first();

        if (!$hub) {
            return response()->json([
                'success' => false,
                'message' => 'No active franchise branch associated with this account.'
            ], 404);
        }

        $inventory = HubInventory::where('hub_id', $hub->id)
            ->with('product')
            ->get();

        return response()->json([
            'success' => true,
            'hub' => $hub,
            'data' => $inventory
        ]);
    }

    /**
     * Get retail orders routed to the franchisee's hub.
     */
    public function getHubOrders(Request $request)
    {
        $hub = Hub::where('franchisee_id', $request->user()->id)->first();

        if (!$hub) {
            return response()->json([
                'success' => false,
                'message' => 'No active franchise branch associated with this account.'
            ], 404);
        }

        $orders = \App\Models\Order::where('hub_id', $hub->id)
            ->where('type', 'retail')
            ->with(['items.product', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Update status of a retail order routed to the franchisee's hub.
     */
    public function updateHubOrderStatus(Request $request, int $id)
    {
        $hub = Hub::where('franchisee_id', $request->user()->id)->first();

        if (!$hub) {
            return response()->json([
                'success' => false,
                'message' => 'No active franchise branch associated with this account.'
            ], 404);
        }

        $order = \App\Models\Order::where('id', $id)
            ->where('hub_id', $hub->id)
            ->where('type', 'retail')
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found or not routed to your branch.'
            ], 404);
        }

        $request->validate([
            'status' => 'required|in:pending,preparing,out_for_delivery,delivered,cancelled'
        ]);

        $order->status = $request->input('status');
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully.',
            'data' => $order->load(['items.product', 'user'])
        ]);
    }
}
