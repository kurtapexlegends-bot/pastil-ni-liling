<?php

namespace App\Http\Controllers;

use App\Models\FranchiseApplication;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Get all franchise applications.
     */
    public function getFranchiseApplications()
    {
        return response()->json([
            'success' => true,
            'data' => FranchiseApplication::latest()->get()
        ]);
    }

    public function getOrders()
    {
        return response()->json([
            'success' => true,
            'data' => \App\Models\Order::with(['items.product', 'user'])->latest()->get()
        ]);
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $order = \App\Models\Order::with('items.product')->findOrFail($id);
        $oldStatus = $order->status;
        $order->update(['status' => $request->status]);

        if ($order->type === 'wholesale' && $request->status === 'delivered' && $oldStatus !== 'delivered') {
            if ($order->hub_id) {
                foreach ($order->items as $item) {
                    $product = $item->product;
                    if (!$product) continue;

                    $targetProductSlug = null;
                    $multiplier = 1;

                    if ($product->slug === 'wholesale-pastil-jar-bulk') {
                        $targetProductSlug = 'original-chicken-pastil';
                        $multiplier = 24;
                    } elseif ($product->slug === 'wholesale-chili-oil-bulk') {
                        $targetProductSlug = 'lilings-signature-chili-garlic-oil';
                        $multiplier = 12;
                    }

                    $targetProductId = null;
                    if ($targetProductSlug) {
                        $retailProduct = \App\Models\Product::where('slug', $targetProductSlug)->first();
                        if ($retailProduct) {
                            $targetProductId = $retailProduct->id;
                        }
                    } else {
                        $targetProductId = $product->id;
                    }

                    if ($targetProductId) {
                        $inventory = \App\Models\HubInventory::firstOrNew([
                            'hub_id' => $order->hub_id,
                            'product_id' => $targetProductId,
                        ]);
                        $inventory->stock_quantity += ($item->quantity * $multiplier);
                        $inventory->save();
                    }
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully!',
            'data' => $order
        ]);
    }

    /**
     * Update the status of a franchise application.
     */
    public function updateFranchiseApplicationStatus(Request $request, FranchiseApplication $application)
    {
        $request->validate([
            'status' => 'required|string|in:pending,reviewed,approved,rejected'
        ]);

        $application->update([
            'status' => $request->status
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
            'data' => $application
        ]);
    }
}
