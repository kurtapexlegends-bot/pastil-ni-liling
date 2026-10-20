<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;

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
                'name' => 'Original Chicken Pastil (Solo Wrap)',
                'slug' => 'original-chicken-pastil',
                'description' => 'Authentic traditional Mindanao-style steamed rice topped with savory shredded chicken adobo wrapped in banana leaf.',
                'price' => 25.00,
                'category' => 'pastil',
                'stock' => 150,
                'image_url' => '/products/original_chicken_pastil.webp',
            ],
            [
                'name' => 'Spicy Chicken Pastil (Solo Wrap)',
                'slug' => 'spicy-chicken-pastil',
                'description' => 'Original shredded chicken pastil spiced with local siling labuyo and aromatic garlic oil wrapped in banana leaf.',
                'price' => 30.00,
                'category' => 'pastil',
                'stock' => 150,
                'image_url' => '/products/spicy_chicken_pastil.webp',
            ],
            [
                'name' => 'Beef Pastil (Solo Wrap)',
                'slug' => 'beef-pastil',
                'description' => 'Premium tender shredded beef toppings slow-cooked in Mindanao spices on hot steamed rice wrapped in banana leaf.',
                'price' => 45.00,
                'category' => 'pastil',
                'stock' => 100,
                'image_url' => '/products/beef_pastilog.webp',
            ],

            // Budbod & Pastilog Meals (Served with Eggs & Toasted Garlic)
            [
                'name' => 'Chicken Budbod Meal',
                'slug' => 'chicken-budbod-meal',
                'description' => 'Savory shredded chicken pastil served over warm rice with fluffy scrambled egg, fresh tomatoes, and crispy toasted garlic.',
                'price' => 59.00,
                'category' => 'pastil',
                'stock' => 120,
                'image_url' => '/products/chicken_budbod_meal.webp',
            ],
            [
                'name' => 'Beef Budbod Meal',
                'slug' => 'beef-budbod-meal',
                'description' => 'Flavorful beef kagikit served over warm rice with fluffy scrambled egg, fresh tomatoes, and crispy toasted garlic.',
                'price' => 69.00,
                'category' => 'pastil',
                'stock' => 100,
                'image_url' => '/products/beef_budbod_meal.webp',
            ],
            [
                'name' => 'Chicken Pastilog',
                'slug' => 'chicken-pastilog',
                'description' => 'Classic chicken pastil paired with fried egg and warm steamed rice.',
                'price' => 55.00,
                'category' => 'pastil',
                'stock' => 100,
                'image_url' => '/products/chicken_pastilog.webp',
            ],
            [
                'name' => 'Beef Pastilog',
                'slug' => 'beef-pastilog',
                'description' => 'Savory beef pastil paired with fried egg and warm steamed rice.',
                'price' => 70.00,
                'category' => 'pastil',
                'stock' => 90,
                'image_url' => '/products/beef_pastilog.webp',
            ],

            // Overload Feasts (All-in-One Best Sellers with Talong, Salted Egg & Sides)
            [
                'name' => 'Chicken Pastil Overload',
                'slug' => 'chicken-pastil-overload',
                'description' => 'All-in-one feast with chicken kagikit, salted egg (itlog na pula), golden fried eggplant (talong), scrambled egg, fresh tomatoes, and toasted garlic on banana leaf.',
                'price' => 75.00,
                'category' => 'pastil',
                'stock' => 100,
                'image_url' => '/products/chicken_pastil_overload.webp',
            ],
            [
                'name' => 'Beef Pastil Overload',
                'slug' => 'beef-pastil-overload',
                'description' => 'Heavy feast featuring shredded beef pastil, salted egg, golden fried talong, scrambled egg, fresh tomatoes, and toasted garlic on fresh banana leaf.',
                'price' => 90.00,
                'category' => 'pastil',
                'stock' => 100,
                'image_url' => '/products/beef_pastil_overload.webp',
            ],

            // Official Bottled Specialty Jars (Sealed 220g in Pure Corn Oil)
            [
                'name' => 'Bottled Beef Pastil in Pure Corn Oil (220g Jar)',
                'slug' => 'bottled-beef-pastil-in-corn-oil-220g',
                'description' => 'Official 220g sealed glass jar of Pastil ni Liling ready-to-eat shredded beef pastil flakes in seasoned pure corn oil.',
                'price' => 160.00,
                'category' => 'pastil_jar',
                'stock' => 80,
                'image_url' => '/products/bottled_pastil_jar_crop.webp',
            ],
            [
                'name' => 'Bottled Chicken Pastil in Pure Corn Oil (220g Jar)',
                'slug' => 'bottled-chicken-pastil-flakes-original',
                'description' => 'Official 220g sealed glass jar of Pastil ni Liling ready-to-eat shredded chicken pastil flakes in seasoned pure corn oil.',
                'price' => 150.00,
                'category' => 'pastil_jar',
                'stock' => 80,
                'image_url' => '/products/bottled_chicken_pastil.webp',
            ],

            // Condiments & Extras
            [
                'name' => 'Liling\'s Signature Chili Garlic Oil (120ml)',
                'slug' => 'lilings-signature-chili-garlic-oil',
                'description' => 'Toasted crunchy garlic bits and crushed chili flakes in aromatic savory oil infusion.',
                'price' => 85.00,
                'category' => 'chili_oil',
                'stock' => 75,
                'image_url' => '/products/spicy_chicken_pastil.webp',
            ],
        ];

        $validSlugs = [];

        foreach ($products as $product) {
            $slug = $product['slug'];
            $validSlugs[] = $slug;

            Product::updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $product['name'],
                    'description' => $product['description'],
                    'price' => $product['price'],
                    'category' => $product['category'],
                    'stock' => $product['stock'],
                    'image_url' => $product['image_url'],
                    'is_active' => true,
                    'is_wholesale' => false,
                ]
            );
        }

        // Wholesale Supplies (Franchisee & Bulk Distribution)
        $wholesalePastil = Product::updateOrCreate(
            ['slug' => 'wholesale-pastil-jar-bulk'],
            [
                'name' => 'Wholesale Pastil Jar (Bulk 24pcs)',
                'description' => 'A bulk pack of 24 premium sealed pastil jars for franchisee distribution.',
                'price' => 3600.00,
                'wholesale_price' => 2800.00,
                'category' => 'wholesale',
                'is_wholesale' => true,
                'image_url' => '/products/bottled_pastil_jar_crop.webp',
                'is_active' => true,
            ]
        );
        $validSlugs[] = $wholesalePastil->slug;

        $wholesaleChili = Product::updateOrCreate(
            ['slug' => 'wholesale-chili-oil-bulk'],
            [
                'name' => 'Premium Chili Oil (Bulk 12pcs)',
                'description' => '12 jars of our signature spicy chili oil for wholesale distribution.',
                'price' => 1800.00,
                'wholesale_price' => 1400.00,
                'category' => 'wholesale',
                'is_wholesale' => true,
                'image_url' => '/products/spicy_chicken_pastil.webp',
                'is_active' => true,
            ]
        );
        $validSlugs[] = $wholesaleChili->slug;

        // Strictly deactivate and soft-delete all non-true products not in the official catalog
        Product::whereNotIn('slug', $validSlugs)->update(['is_active' => false]);
        Product::whereNotIn('slug', $validSlugs)->delete();

        // Flush catalog cache so frontend instantly reflects the true catalog
        Cache::forget('active_catalog');
    }
}
