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
        WebsiteSetting::setByKey('hero_subtitle', 'Authentic Mindanao-style Chicken & Beef Pastil wrapped in fresh banana leaves. Affordable, flavorful, at sarap na babalik-balikan!');
        WebsiteSetting::setByKey('hero_cta_text', 'Explore Catalog');
        WebsiteSetting::setByKey('hero_cta_link', '/menu');

        // 2. Trust Statistics Settings
        WebsiteSetting::setByKey('stats_branches', '2 Hubs (QC & Caloocan)');
        WebsiteSetting::setByKey('stats_orders', '10,000+');
        WebsiteSetting::setByKey('stats_cities', 'Metro Manila');
        WebsiteSetting::setByKey('stats_applications', '100+');

        // 3. Announcement Bar Settings (FB Promotion Source of Truth)
        WebsiteSetting::setByKey('announcement_enabled', true);
        WebsiteSetting::setByKey('announcement_text', 'Free Delivery on Bulk & Catering Orders (100 pcs and up)! Contact 0970 156 9881 / 0954 261 9188.');

        // 4. Footer & Socials (Official Facebook Page Details)
        WebsiteSetting::setByKey('footer_desc', 'Authentic Mindanao-style Chicken & Beef Pastil wrapped in fresh banana leaves. Mura, masarap, at babalik-balikan!');
        WebsiteSetting::setByKey('footer_copyright', '&copy; 2026 Pastil ni Liling. Mura, Masarap, at Babalik-balikan.');
        WebsiteSetting::setByKey('footer_social_fb', 'https://www.facebook.com/PastilNiLiling');
        WebsiteSetting::setByKey('footer_contact_phone', '+63 966 142 3992 / 0927 572 3661');
        WebsiteSetting::setByKey('footer_contact_email', 'pastilnililing@gmail.com');
        WebsiteSetting::setByKey('footer_contact_address', 'Cubao (Arayat Market, QC) & Bagong Silang (Langit Road, Caloocan)');

        // 5. Featured Showcase Products Settings
        // Pick the top 3 products from the database to showcase
        $productIds = Product::where('is_active', true)->take(3)->pluck('id')->toArray();
        WebsiteSetting::setByKey('featured_products', $productIds);
    }
}
