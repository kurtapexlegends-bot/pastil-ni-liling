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
                'image_url' => 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=800&auto=format&fit=crop',
            ],
            [
                'name' => 'Spicy Chicken Pastil',
                'description' => 'Our original chicken pastil with an extra kick of local chili.',
                'price' => 30.00,
                'category' => 'pastil',
                'stock' => 100,
                'image_url' => 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop',
            ],
            [
                'name' => 'Beef Pastil',
                'description' => 'Premium shredded beef toppings on perfectly steamed rice.',
                'price' => 45.00,
                'category' => 'pastil',
                'stock' => 50,
                'image_url' => 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?q=80&w=800&auto=format&fit=crop',
            ],
            // Bagoong
            [
                'name' => 'Premium Shrimp Bagoong (Regular)',
                'description' => 'Authentic shrimp paste, perfectly sautéed for the ultimate umami flavor.',
                'price' => 120.00,
                'category' => 'bagoong',
                'stock' => 30,
                'image_url' => 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=800&auto=format&fit=crop',
            ],
            [
                'name' => 'Premium Shrimp Bagoong (Spicy)',
                'description' => 'Our premium bagoong with a balanced spicy blend.',
                'price' => 130.00,
                'category' => 'bagoong',
                'stock' => 30,
                'image_url' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
            ],
            // Chili Oil
            [
                'name' => 'Liling\'s Signature Chili Garlic Oil',
                'description' => 'Toasted garlic and premium chili flakes infused in high-quality oil.',
                'price' => 99.00,
                'category' => 'chili_oil',
                'stock' => 40,
                'image_url' => 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=800&auto=format&fit=crop',
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
                    'image_url' => $product['image_url'],
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
                'image_url' => 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=800&auto=format&fit=crop',
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
                'image_url' => 'https://images.unsplash.com/photo-1618413998877-4c3116df7325?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ]
        );
    }
}
