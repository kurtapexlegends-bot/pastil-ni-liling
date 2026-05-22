<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    private ProductService $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    /**
     * Get all products in catalog.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Product::latest()->get()
        ]);
    }

    /**
     * Store a new product.
     */
    public function store(Request $request)
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

        $product = $this->productService->storeProduct($data);

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully!',
            'data' => $product
        ], 201);
    }

    /**
     * Update an existing product.
     */
    public function update(Request $request, int $id)
    {
        $product = Product::findOrFail($id);
        
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

        $product = $this->productService->updateProduct($product, $data);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully!',
            'data' => $product
        ]);
    }

    /**
     * Delete a product.
     */
    public function destroy(int $id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully!'
        ]);
    }
}
