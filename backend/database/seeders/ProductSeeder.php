<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds with authentic Pastil ni Liling menu & real photography.
     */
    public function run(): void
    {
        $products = [
            // Traditional Banana Leaf Wrapped Solo Pastil
            [
                'name' => 'Original Chicken Pastil',
                'description' => 'Authentic Mindanao-style steamed rice topped with savory shredded chicken adobo wrapped in banana leaf.',
                'price' => 25.00,
                'category' => 'pastil',
                'stock' => 150,
                'image_url' => '/products/real_dish_4.webp',
            ],
            [
                'name' => 'Spicy Chicken Pastil',
                'description' => 'Original shredded chicken pastil spiced with local siling labuyo and aromatic garlic oil wrapped in banana leaf.',
                'price' => 30.00,
                'category' => 'pastil',
                'stock' => 150,
                'image_url' => '/products/real_dish_2.webp',
            ],
            [
                'name' => 'Beef Pastil',
                'description' => 'Premium tender shredded beef toppings slow-cooked in Mindanao spices on hot steamed rice wrapped in banana leaf.',
                'price' => 45.00,
                'category' => 'pastil',
                'stock' => 100,
                'image_url' => '/products/real_dish_4.webp',
            ],

            // Budbod & Pastilog Meals (Served with Eggs & Toasted Garlic)
            [
                'name' => 'Chicken Budbod Meal',
                'description' => 'Savory shredded chicken pastil served over warm rice with fluffy scrambled egg and crispy toasted garlic.',
                'price' => 59.00,
                'category' => 'pastil',
                'stock' => 120,
                'image_url' => '/products/real_dish_4.webp',
            ],
            [
                'name' => 'Beef Budbod Meal',
                'description' => 'Flavorful beef kagikit served over warm rice with fluffy scrambled egg and crispy toasted garlic.',
                'price' => 69.00,
                'category' => 'pastil',
                'stock' => 100,
                'image_url' => '/products/real_dish_4.webp',
            ],
            [
                'name' => 'Chicken Pastilog',
                'description' => 'Classic chicken pastil paired with fried egg and steamed rice.',
                'price' => 55.00,
                'category' => 'pastil',
                'stock' => 100,
                'image_url' => '/products/real_dish_4.webp',
            ],
            [
                'name' => 'Beef Pastilog',
                'description' => 'Savory beef pastil paired with fried egg and steamed rice.',
                'price' => 70.00,
                'category' => 'pastil',
                'stock' => 90,
                'image_url' => '/products/real_dish_4.webp',
            ],

            // Overload Feasts (All-in-One Best Sellers with Talong, Salted Egg & Sides)
            [
                'name' => 'Chicken Pastil Overload',
                'description' => 'All-in-one feast with chicken kagikit, salted egg (itlog na pula), fried eggplant (talong), scrambled egg, fresh tomatoes, and toasted garlic on banana leaf.',
                'price' => 80.00,
                'category' => 'pastil',
                'stock' => 100,
                'image_url' => '/products/real_dish_3.webp',
            ],
            [
                'name' => 'Beef Pastil Overload',
                'description' => 'Heavy feast featuring shredded beef pastil, salted egg, golden fried talong, scrambled egg, fresh tomatoes, and toasted garlic on fresh banana leaf.',
                'price' => 95.00,
                'category' => 'pastil',
                'stock' => 100,
                'image_url' => '/products/real_dish_3.webp',
            ],
            [
                'name' => 'Pastil with Fried Eggplant (Talong)',
                'description' => 'Classic savory chicken pastil served with golden fried talong and spiced chicken oil.',
                'price' => 40.00,
                'category' => 'pastil',
                'stock' => 100,
                'image_url' => '/products/real_dish_3.webp',
            ],

            // Bottled Specialty Jars
            [
                'name' => 'Bottled Beef Pastil in Corn Oil (220g)',
                'description' => 'Official 220g sealed glass jar of Pastil ni Liling ready-to-eat shredded beef pastil flakes in seasoned pure corn oil.',
                'price' => 160.00,
                'category' => 'pastil_jar',
                'stock' => 80,
                'image_url' => '/products/real_dish_1.webp',
            ],
            [
                'name' => 'Bottled Chicken Pastil Flakes (Original)',
                'description' => '220g sealed glass jar of authentic ready-to-eat shredded chicken pastil flakes in seasoned pure corn oil.',
                'price' => 150.00,
                'category' => 'pastil_jar',
                'stock' => 80,
                'image_url' => '/products/hero_stall.webp',
            ],

            // Bagoong & Condiments
            [
                'name' => 'Premium Shrimp Bagoong (Regular)',
                'description' => 'Authentic sautéed shrimp paste, slow-cooked for rich umami flavor and balanced sweetness.',
                'price' => 120.00,
                'category' => 'bagoong',
                'stock' => 60,
                'image_url' => '/products/real_dish_1.webp',
            ],
            [
                'name' => 'Premium Shrimp Bagoong (Spicy)',
                'description' => 'Our premium sautéed shrimp bagoong infused with fiery chili peppers.',
                'price' => 130.00,
                'category' => 'bagoong',
                'stock' => 60,
                'image_url' => '/products/real_dish_2.webp',
            ],
            [
                'name' => 'Liling\'s Signature Chili Garlic Oil',
                'description' => 'Toasted crunchy garlic bits and crushed chili flakes in aromatic savory oil infusion.',
                'price' => 85.00,
                'category' => 'chili_oil',
                'stock' => 75,
                'image_url' => '/products/real_dish_2.webp',
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

        // Wholesale Supplies (Franchisee & Bulk Distribution)
        Product::updateOrCreate(
            ['slug' => 'wholesale-pastil-jar-bulk'],
            [
                'name' => 'Wholesale Pastil Jar (Bulk 24pcs)',
                'description' => 'A bulk pack of 24 premium sealed pastil jars for franchisee distribution.',
                'price' => '3600.00',
                'wholesale_price' => '2800.00',
                'category' => 'wholesale',
                'is_wholesale' => true,
                'image_url' => '/products/real_dish_1.webp',
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
                'image_url' => '/products/real_dish_2.webp',
                'is_active' => true,
            ]
        );
    }
}
