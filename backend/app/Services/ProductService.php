<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Str;

class ProductService
{
    /**
     * Generate a unique slug for a product name.
     * 
     * @param string $name
     * @param int|null $ignoreId
     * @return string
     */
    public function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        $query = Product::where('slug', $slug);
        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        while ((clone $query)->where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }

        return $slug;
    }

    /**
     * Store a new product safely.
     * 
     * @param array $data
     * @return Product
     */
    public function storeProduct(array $data): Product
    {
        $data['slug'] = $this->generateUniqueSlug($data['name']);
        return Product::create($data);
    }

    /**
     * Update an existing product safely.
     * 
     * @param Product $product
     * @param array $data
     * @return Product
     */
    public function updateProduct(Product $product, array $data): Product
    {
        $data['slug'] = $this->generateUniqueSlug($data['name'], $product->id);
        $product->update($data);
        return $product;
    }
}
