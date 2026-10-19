<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreHubRequest;
use App\Http\Requests\Admin\UpdateHubRequest;
use App\Models\Hub;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HubController extends Controller
{
    /**
     * Get all franchise hubs (scoped for Franchisee, global for Admin/HQ).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user && $user->hasRole('Franchisee')) {
            $hubs = Hub::where('franchisee_id', $user->id)
                ->with('franchisee')
                ->latest()
                ->get();
        } else {
            $hubs = Hub::with('franchisee')->latest()->get();
        }

        return response()->json([
            'success' => true,
            'data' => $hubs,
        ]);
    }

    /**
     * Create a new franchise hub.
     */
    public function store(StoreHubRequest $request): JsonResponse
    {
        $hub = Hub::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Franchise branch created successfully!',
            'data' => $hub->load('franchisee'),
        ], 201);
    }

    /**
     * Update a franchise hub.
     */
    public function update(UpdateHubRequest $request, int $id): JsonResponse
    {
        $hub = Hub::findOrFail($id);
        $hub->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Franchise branch updated successfully!',
            'data' => $hub->load('franchisee'),
        ]);
    }

    /**
     * Delete a franchise hub.
     */
    public function destroy(int $id): JsonResponse
    {
        $hub = Hub::findOrFail($id);
        $hub->delete();

        return response()->json([
            'success' => true,
            'message' => 'Franchise branch deleted successfully!',
        ]);
    }
}
