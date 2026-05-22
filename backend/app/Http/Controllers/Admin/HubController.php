<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Hub;
use Illuminate\Http\Request;

class HubController extends Controller
{
    /**
     * Get all franchise hubs.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Hub::with('franchisee')->latest()->get()
        ]);
    }

    /**
     * Create a new franchise hub.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'franchisee_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'status' => 'required|string|in:active,inactive'
        ]);

        $hub = Hub::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Franchise branch created successfully!',
            'data' => $hub->load('franchisee')
        ], 201);
    }

    /**
     * Update a franchise hub.
     */
    public function update(Request $request, int $id)
    {
        $hub = Hub::findOrFail($id);

        $data = $request->validate([
            'franchisee_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'status' => 'required|string|in:active,inactive'
        ]);

        $hub->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Franchise branch updated successfully!',
            'data' => $hub->load('franchisee')
        ]);
    }

    /**
     * Delete a franchise hub.
     */
    public function destroy(int $id)
    {
        $hub = Hub::findOrFail($id);
        $hub->delete();

        return response()->json([
            'success' => true,
            'message' => 'Franchise branch deleted successfully!'
        ]);
    }
}
