<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\WebsiteSetting;
use Illuminate\Database\Seeder;

class WebsiteSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Hero Section Settings
        WebsiteSetting::setByKey('hero_badge', 'Sarap na Babalik-balikan');
        WebsiteSetting::setByKey('hero_title_white', "Mindanao's finest\ndelivered to your");
        WebsiteSetting::setByKey('hero_title_green', 'doorstep.');
        WebsiteSetting::setByKey('hero_subtitle', 'Experience authentic flavors crafted with tradition. From our signature chicken pastil to premium bottled sauces, we bring the heart of Mindanao to every meal.');
        WebsiteSetting::setByKey('hero_cta_text', 'Explore Catalog');
        WebsiteSetting::setByKey('hero_cta_link', '/menu');

        // 2. Trust Statistics Settings
        WebsiteSetting::setByKey('stats_branches', '50+');
        WebsiteSetting::setByKey('stats_orders', '5,000+');
        WebsiteSetting::setByKey('stats_cities', '20+');
        WebsiteSetting::setByKey('stats_applications', '200+');

        // 3. Announcement Bar Settings
        WebsiteSetting::setByKey('announcement_enabled', false);
        WebsiteSetting::setByKey('announcement_text', '✨ Promo Code: LILING10 - Get 10% discount on all bottled products this weekend! ✨');

        // 4. Featured Showcase Products Settings
        // Pick the first 3 products from the database to showcase
        $productIds = Product::where('is_active', true)->take(3)->pluck('id')->toArray();
        WebsiteSetting::setByKey('featured_products', $productIds);
    }
}
