<?php

namespace App\Services;

use App\Models\WebsiteSetting;
use Illuminate\Support\Facades\DB;

class WebsiteSettingService
{
    /**
     * Permitted setting keys allowed to be stored in the database.
     * Supports both structured section keys and granular legacy keys.
     */
    public const ALLOWED_KEYS = [
        // Structured Landing Page Section Keys
        'hero',
        'about',
        'features',
        'testimonials',
        'faqs',
        'contact',
        'brand',

        // Granular Frontend Keys (Full Backward Compatibility)
        'hero_badge',
        'hero_title_white',
        'hero_title_green',
        'hero_subtitle',
        'hero_cta_text',
        'hero_cta_link',
        'stats_branches',
        'stats_orders',
        'stats_cities',
        'stats_applications',
        'announcement_enabled',
        'announcement_text',
        'featured_products',
        'trust_title',
        'trust_subtitle',
        'footer_desc',
        'footer_copyright',
        'franchise_badge',
        'franchise_title_white',
        'franchise_title_green',
        'franchise_subtitle',
        'franchise_benefit1_title',
        'franchise_benefit1_desc',
        'franchise_benefit2_title',
        'franchise_benefit2_desc',
        'franchise_benefit3_title',
        'franchise_benefit3_desc',
        'franchise_benefit4_title',
        'franchise_benefit4_desc',
        'franchise_milestone_title',
        'franchise_milestone_desc',
        'franchise_footer_copyright',
        'footer_social_fb',
        'footer_social_ig',
        'footer_social_tw',
        'footer_contact_phone',
        'footer_contact_email',
        'footer_contact_address',
    ];

    /**
     * Retrieve default landing page and branding configurations.
     */
    public function getDefaults(): array
    {
        return [
            // Structured Section Configurations
            'hero' => [
                'badge' => 'Sarap na Babalik-balikan',
                'title_white' => "Mindanao's finest\ndelivered to your",
                'title_green' => 'doorstep.',
                'subtitle' => 'Experience authentic flavors crafted with tradition. From our signature chicken pastil to premium bottled sauces, we bring the heart of Mindanao to every meal.',
                'cta_text' => 'Explore Catalog',
                'cta_link' => '/menu',
            ],
            'about' => [
                'title' => 'Bringing Mindanao to Every Table',
                'subtitle' => 'Quality you can trust, prices you can afford.',
                'story' => 'Authentic pastil culinary heritage originating from Mindanao, crafted with traditional kagikit recipe.',
            ],
            'features' => [
                'branches' => '50+',
                'orders' => '5,000+',
                'cities' => '20+',
                'applications' => '200+',
                'trust_title' => 'The Fastest Growing Pastil Brand.',
                'trust_subtitle' => "Join our mission to bring Mindanao's finest to every Filipino table through our expanding franchise network.",
            ],
            'testimonials' => [
                [
                    'name' => 'Maria Santos',
                    'role' => 'Loyal Customer',
                    'comment' => 'The spicy chicken pastil reminds me of home in Cotabato. Authentic and deeply flavorful!',
                    'rating' => 5,
                ],
                [
                    'name' => 'Roberto Tan',
                    'role' => 'Franchise Partner - Diliman',
                    'comment' => 'Fast ROI and exceptional commissary supply support. Best investment decision of 2025.',
                    'rating' => 5,
                ],
            ],
            'faqs' => [
                [
                    'question' => 'What is Pastil?',
                    'answer' => 'Pastil is a traditional Filipino packed rice dish topped with shredded seasoned meat (kagikit) wrapped in wilted banana leaf.',
                ],
                [
                    'question' => 'How can I apply for a franchise?',
                    'answer' => 'Submit your application via our Franchise Inquiry portal with your target location and financial capacity.',
                ],
            ],
            'contact' => [
                'phone' => '+63 917 123 4567',
                'email' => 'hello@pastilnililing.com',
                'address' => 'General Santos City, Philippines',
            ],
            'brand' => [
                'name' => 'Pastil ni Liling',
                'tagline' => 'Sarap na Babalik-balikan',
                'primary_color' => '#7ca33a',
                'accent_color' => '#d1a340',
                'dark_color' => '#1b2d16',
            ],

            // Granular Keys (100% Backward Compatibility with Current Next.js Views)
            'hero_badge' => 'Sarap na Babalik-balikan',
            'hero_title_white' => "Mindanao's finest\ndelivered to your",
            'hero_title_green' => 'doorstep.',
            'hero_subtitle' => 'Experience authentic flavors crafted with tradition. From our signature chicken pastil to premium bottled sauces, we bring the heart of Mindanao to every meal.',
            'hero_cta_text' => 'Explore Catalog',
            'hero_cta_link' => '/menu',
            'stats_branches' => '50+',
            'stats_orders' => '5,000+',
            'stats_cities' => '20+',
            'stats_applications' => '200+',
            'announcement_enabled' => false,
            'announcement_text' => '',
            'featured_products' => [],
            'trust_title' => 'The Fastest Growing Pastil Brand.',
            'trust_subtitle' => "Join our mission to bring Mindanao's finest to every Filipino table through our expanding franchise network.",
            'footer_desc' => 'Bringing authentic Mindanao flavors to the mainstream. Quality you can trust, prices you can afford.',
            'footer_copyright' => '&copy; 2026 Pastil ni Liling. Swak sa Bulsa, Sarap na Babalik-balikan.',
            'footer_social_fb' => 'https://facebook.com',
            'footer_social_ig' => 'https://instagram.com',
            'footer_social_tw' => 'https://twitter.com',
            'footer_contact_phone' => '+63 917 123 4567',
            'footer_contact_email' => 'hello@pastilnililing.com',
            'footer_contact_address' => 'General Santos City, Philippines',
            'franchise_badge' => 'Business Opportunity',
            'franchise_title_white' => 'Grow with',
            'franchise_title_green' => 'Pastil ni Liling.',
            'franchise_subtitle' => "Be part of the Philippines' fastest-growing pastil brand. Low investment, high returns, and a product Filipinos love.",
            'franchise_benefit1_title' => 'Low Capital',
            'franchise_benefit1_desc' => 'Start your business journey with minimal overhead and rapid startup times.',
            'franchise_benefit2_title' => 'Proven System',
            'franchise_benefit2_desc' => 'Complete operational training, kitchen blueprints, and staff management support.',
            'franchise_benefit3_title' => 'High Demand',
            'franchise_benefit3_desc' => 'Pastil is a beloved staple food favorite that sells consistently 24/7.',
            'franchise_benefit4_title' => 'Marketing Power',
            'franchise_benefit4_desc' => 'National brand awareness campaigns and localized digital marketing support.',
            'franchise_milestone_title' => '50+ Branches',
            'franchise_milestone_desc' => 'And growing rapidly nationwide.',
            'franchise_footer_copyright' => '&copy; 2026 Pastil ni Liling Franchise Program. Swak sa Bulsa, Sarap na Babalik-balikan.',
        ];
    }

    /**
     * Fetch all website configuration settings, decode JSON values,
     * and merge with system defaults.
     */
    public function getSettings(): array
    {
        $settings = WebsiteSetting::all()->pluck('value', 'key')->toArray();

        foreach ($settings as $key => $value) {
            if (is_string($value) && (
                (str_starts_with($value, '[') && str_ends_with($value, ']')) ||
                (str_starts_with($value, '{') && str_ends_with($value, '}'))
            )) {
                $decoded = json_decode($value, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $settings[$key] = $decoded;
                }
            }
        }

        if (isset($settings['announcement_enabled'])) {
            $settings['announcement_enabled'] = filter_var($settings['announcement_enabled'], FILTER_VALIDATE_BOOLEAN);
        }

        return array_merge($this->getDefaults(), $settings);
    }

    /**
     * Save/Update a batch of website settings, filtering by allowed keys.
     * Encodes array/object values to JSON, persists via updateOrCreate within a transaction,
     * and returns refreshed settings.
     */
    public function updateSettings(array $settings): array
    {
        $allowed = array_flip(self::ALLOWED_KEYS);

        DB::transaction(function () use ($settings, $allowed) {
            foreach ($settings as $key => $value) {
                if (! isset($allowed[$key])) {
                    continue;
                }

                if ($key === 'announcement_enabled') {
                    $valueToStore = filter_var($value, FILTER_VALIDATE_BOOLEAN) ? '1' : '0';
                } elseif (is_array($value) || is_object($value)) {
                    $valueToStore = json_encode($value, JSON_UNESCAPED_UNICODE);
                } else {
                    $valueToStore = (string) $value;
                }

                WebsiteSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $valueToStore]
                );
            }
        });

        return $this->getSettings();
    }

    /**
     * Retrieve a specific setting by key with an optional fallback.
     */
    public function getSetting(string $key, mixed $default = null): mixed
    {
        $settings = $this->getSettings();

        return $settings[$key] ?? $default;
    }

    /**
     * Retrieve all allowed keys.
     */
    public function getAllowedKeys(): array
    {
        return self::ALLOWED_KEYS;
    }
}
