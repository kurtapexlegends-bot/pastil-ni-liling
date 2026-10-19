<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateFranchiseApplicationStatusRequest;
use App\Models\FranchiseApplication;
use Illuminate\Http\JsonResponse;

class FranchiseApplicationController extends Controller
{
    /**
     * Get all franchise applications.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => FranchiseApplication::latest()->get(),
        ]);
    }

    /**
     * Update the status of a franchise application.
     */
    public function updateStatus(UpdateFranchiseApplicationStatusRequest $request, int $id): JsonResponse
    {
        $application = FranchiseApplication::findOrFail($id);

        $application->update([
            'status' => $request->validated('status'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
            'data' => $application,
        ]);
    }
}
