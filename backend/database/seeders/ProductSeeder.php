<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            // Pastil Variants
            [
                'name' => 'Original Chicken Pastil',
                'description' => 'Traditional steamed rice topped with savory shredded chicken adobo.',
                'price' => 25.00,
                'category' => 'pastil',
                'stock' => 100,
            ],
            [
                'name' => 'Spicy Chicken Pastil',
                'description' => 'Our original chicken pastil with an extra kick of local chili.',
                'price' => 30.00,
                'category' => 'pastil',
                'stock' => 100,
            ],
            [
                'name' => 'Beef Pastil',
                'description' => 'Premium shredded beef toppings on perfectly steamed rice.',
                'price' => 45.00,
                'category' => 'pastil',
                'stock' => 50,
            ],
            // Bagoong
            [
                'name' => 'Premium Shrimp Bagoong (Regular)',
                'description' => 'Authentic shrimp paste, perfectly sautéed for the ultimate umami flavor.',
                'price' => 120.00,
                'category' => 'bagoong',
                'stock' => 30,
            ],
            [
                'name' => 'Premium Shrimp Bagoong (Spicy)',
                'description' => 'Our premium bagoong with a balanced spicy blend.',
                'price' => 130.00,
                'category' => 'bagoong',
                'stock' => 30,
            ],
            // Chili Oil
            [
                'name' => 'Liling\'s Signature Chili Garlic Oil',
                'description' => 'Toasted garlic and premium chili flakes infused in high-quality oil.',
                'price' => 99.00,
                'category' => 'chili_oil',
                'stock' => 40,
            ],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(
                ['slug' => Str::slug($product['name'])],
                [
                    'name' => $product['name'],
                    'description' => $product['description'],
                    'price' => $product['price'],
                    'category' => $product['category'],
                    'stock' => $product['stock'],
                    'image_url' => 'https://images.unsplash.com/photo-1582294158564-925249492167?q=80&w=800&auto=format&fit=crop',
                    'is_active' => true,
                ]
            );
        }

        // Wholesale Supplies
        Product::updateOrCreate(
            ['slug' => 'wholesale-pastil-jar-bulk'],
            [
                'name' => 'Wholesale Pastil Jar (Bulk 24pcs)',
                'description' => 'A bulk pack of 24 premium pastil jars for franchisee distribution.',
                'price' => '3600.00',
                'wholesale_price' => '2800.00',
                'category' => 'wholesale',
                'is_wholesale' => true,
                'image_url' => 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'wholesale-chili-oil-bulk'],
            [
                'name' => 'Premium Chili Oil (Bulk 12pcs)',
                'description' => '12 jars of our signature spicy chili oil for wholesale distribution.',
                'price' => '1800.00',
                'wholesale_price' => '1400.00',
                'category' => 'wholesale',
                'is_wholesale' => true,
                'image_url' => 'https://images.unsplash.com/photo-1512485600893-b08ec1d59b1c?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ]
        );
    }
}
