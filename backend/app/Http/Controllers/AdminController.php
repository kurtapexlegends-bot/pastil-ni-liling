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
            'data' => \App\Models\Order::with(['items.product', 'user', 'hub'])->latest()->get()
        ]);
    }

    public function updateOrderStatus(Request $request, $id, \App\Services\OrderFulfillmentService $fulfillmentService)
    {
        $order = \App\Models\Order::with('items.product')->findOrFail($id);
        $order = $fulfillmentService->fulfillOrder($order, $request->status);
        
        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully!',
            'data' => $order
        ]);
    }

    /**
     * Update the status of a franchise application.
     */
    public function updateApplicationStatus(Request $request, $id)
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

    /**
     * Get all products in catalog.
     */
    public function getProducts()
    {
        return response()->json([
            'success' => true,
            'data' => \App\Models\Product::latest()->get()
        ]);
    }

    /**
     * Store a new product.
     */
    public function storeProduct(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:255',
            'stock' => 'required|integer|min:0',
            'is_active' => 'required|boolean',
            'is_wholesale' => 'required|boolean',
            'wholesale_price' => 'nullable|numeric|min:0',
            'image_url' => 'nullable|string',
        ]);

        $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        
        $originalSlug = $data['slug'];
        $count = 1;
        while (\App\Models\Product::where('slug', $data['slug'])->exists()) {
            $data['slug'] = $originalSlug . '-' . $count++;
        }

        $product = \App\Models\Product::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully!',
            'data' => $product
        ], 201);
    }

    /**
     * Update an existing product.
     */
    public function updateProduct(Request $request, $id)
    {
        $product = \App\Models\Product::findOrFail($id);
        
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:255',
            'stock' => 'required|integer|min:0',
            'is_active' => 'required|boolean',
            'is_wholesale' => 'required|boolean',
            'wholesale_price' => 'nullable|numeric|min:0',
            'image_url' => 'nullable|string',
        ]);

        $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        $originalSlug = $data['slug'];
        $count = 1;
        while (\App\Models\Product::where('slug', $data['slug'])->where('id', '!=', $id)->exists()) {
            $data['slug'] = $originalSlug . '-' . $count++;
        }

        $product->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully!',
            'data' => $product
        ]);
    }

    /**
     * Delete a product.
     */
    public function destroyProduct($id)
    {
        $product = \App\Models\Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully!'
        ]);
    }

    /**
     * Get all franchise hubs.
     */
    public function getHubs()
    {
        return response()->json([
            'success' => true,
            'data' => \App\Models\Hub::with('franchisee')->latest()->get()
        ]);
    }

    /**
     * Create a new franchise hub.
     */
    public function storeHub(Request $request)
    {
        $data = $request->validate([
            'franchisee_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'status' => 'required|string|in:active,inactive'
        ]);

        $hub = \App\Models\Hub::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Franchise branch created successfully!',
            'data' => $hub->load('franchisee')
        ], 201);
    }

    /**
     * Update a franchise hub.
     */
    public function updateHub(Request $request, $id)
    {
        $hub = \App\Models\Hub::findOrFail($id);

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
    public function destroyHub($id)
    {
        $hub = \App\Models\Hub::findOrFail($id);
        $hub->delete();

        return response()->json([
            'success' => true,
            'message' => 'Franchise branch deleted successfully!'
        ]);
    }

    /**
     * Get all users holding the Franchisee role.
     */
    public function getFranchisees()
    {
        $franchisees = \App\Models\User::role('Franchisee')->get();
        return response()->json([
            'success' => true,
            'data' => $franchisees
        ]);
    }
}
