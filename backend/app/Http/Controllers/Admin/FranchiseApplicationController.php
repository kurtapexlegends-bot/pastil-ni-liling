<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FranchiseApplication;
use Illuminate\Http\Request;

class FranchiseApplicationController extends Controller
{
    /**
     * Get all franchise applications.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => FranchiseApplication::latest()->get()
        ]);
    }

    /**
     * Update the status of a franchise application.
     */
    public function updateStatus(Request $request, int $id)
    {
        $application = FranchiseApplication::findOrFail($id);
        
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
