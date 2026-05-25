<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Cache::rememberForever('active_catalog', function() {
            return Product::where('is_active', true)
                ->orderBy('category')
                ->orderBy('name')
                ->get()
                ->toArray();
        });

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }
}
