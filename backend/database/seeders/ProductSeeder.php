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
            // Traditional Banana Leaf Wrapped Pastil Meals
            [
                'name' => 'Original Chicken Pastil',
                'description' => 'Authentic Mindanao-style steamed rice topped with savory shredded chicken adobo wrapped in banana leaf.',
                'price' => 25.00,
                'category' => 'pastil',
                'stock' => 150,
                'image_url' => 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=800&auto=format&fit=crop',
            ],
            [
                'name' => 'Spicy Chicken Pastil',
                'description' => 'Original shredded chicken pastil spiced with local siling labuyo and aromatic garlic oil.',
                'price' => 30.00,
                'category' => 'pastil',
                'stock' => 150,
                'image_url' => 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop',
            ],
            [
                'name' => 'Beef Pastil',
                'description' => 'Premium tender shredded beef toppings slow-cooked in Mindanao spices on hot steamed rice.',
                'price' => 45.00,
                'category' => 'pastil',
                'stock' => 100,
                'image_url' => 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?q=80&w=800&auto=format&fit=crop',
            ],
            // Overload & Combo Meals (FB / Delivery App Best Sellers)
            [
                'name' => 'Chicken Pastil Overload',
                'description' => 'Heavy pastil meal topped with authentic itlog na pula (salted egg), fresh tomatoes, and fried eggplant.',
                'price' => 55.00,
                'category' => 'pastil',
                'stock' => 100,
                'image_url' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
            ],
            [
                'name' => 'Pastil with Fried Eggplant (Talong)',
                'description' => 'Classic savory chicken pastil served with crispy golden fried talong and spiced chicken oil.',
                'price' => 40.00,
                'category' => 'pastil',
                'stock' => 100,
                'image_url' => 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop',
            ],
            [
                'name' => 'Pastil Combo with Shanghai',
                'description' => 'Chicken pastil paired with crispy golden lumpiang shanghai and free dipping sauce.',
                'price' => 50.00,
                'category' => 'pastil',
                'stock' => 100,
                'image_url' => 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=800&auto=format&fit=crop',
            ],
            // Bottled Specialty Jars
            [
                'name' => 'Bottled Chicken Pastil Flakes (Original)',
                'description' => '220g sealed glass jar of ready-to-eat shredded chicken pastil flakes in seasoned oil.',
                'price' => 150.00,
                'category' => 'pastil_jar',
                'stock' => 80,
                'image_url' => 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=800&auto=format&fit=crop',
            ],
            [
                'name' => 'Bottled Chicken Pastil Flakes (Spicy)',
                'description' => '220g sealed glass jar of toasted spicy chicken pastil flakes infused with chili and toasted garlic.',
                'price' => 160.00,
                'category' => 'pastil_jar',
                'stock' => 80,
                'image_url' => 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=800&auto=format&fit=crop',
            ],
            // Bagoong & Sauces
            [
                'name' => 'Premium Shrimp Bagoong (Regular)',
                'description' => 'Authentic sautéed shrimp paste, slow-cooked for rich umami flavor and balanced sweetness.',
                'price' => 120.00,
                'category' => 'bagoong',
                'stock' => 60,
                'image_url' => 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=800&auto=format&fit=crop',
            ],
            [
                'name' => 'Premium Shrimp Bagoong (Spicy)',
                'description' => 'Our premium sautéed shrimp bagoong infused with fiery chili peppers.',
                'price' => 130.00,
                'category' => 'bagoong',
                'stock' => 60,
                'image_url' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
            ],
            // Chili Oil
            [
                'name' => 'Liling\'s Signature Chili Garlic Oil',
                'description' => 'Toasted crunchy garlic bits and crushed chili flakes in aromatic savory oil infusion.',
                'price' => 99.00,
                'category' => 'chili_oil',
                'stock' => 75,
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
