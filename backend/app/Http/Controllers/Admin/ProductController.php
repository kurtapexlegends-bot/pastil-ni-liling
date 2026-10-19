<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Requests\Admin\UploadProductImageRequest;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function __construct(
        protected ProductService $productService
    ) {}

    /**
     * Get all products in catalog.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => Product::latest()->get(),
        ]);
    }

    /**
     * Upload product image.
     */
    public function uploadImage(UploadProductImageRequest $request): JsonResponse
    {
        $path = $request->file('image')->store('products', 'public');

        return response()->json([
            'success' => true,
            'url' => asset('storage/'.$path),
        ]);
    }

    /**
     * Store a new product.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->productService->storeProduct($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully!',
            'data' => $product,
        ], 201);
    }

    /**
     * Update an existing product.
     */
    public function update(UpdateProductRequest $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product = $this->productService->updateProduct($product, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully!',
            'data' => $product,
        ]);
    }

    /**
     * Delete a product.
     */
    public function destroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully!',
        ]);
    }
}
