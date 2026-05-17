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
        $order = \App\Models\Order::findOrFail($id);
        $order->update(['status' => $request->status]);

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
