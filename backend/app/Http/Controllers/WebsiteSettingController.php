<?php

namespace App\Http\Controllers;

use App\Models\WebsiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebsiteSettingController extends Controller
{
    /**
     * Fetch all website configuration settings in a flat key-value mapping.
     * Accessible by public public-facing routes.
     */
    public function index(): JsonResponse
    {
        $settings = WebsiteSetting::all()->pluck('value', 'key')->toArray();

        // Decode JSON values (like arrays of product IDs) automatically for the client response
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

        // Return default values for missing keys to ensure absolute UI stability
        $defaults = [
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
            'trust_subtitle' => 'Join our mission to bring Mindanao\'s finest to every Filipino table through our expanding franchise network.',
            'footer_desc' => 'Bringing authentic Mindanao flavors to the mainstream. Quality you can trust, prices you can afford.',
            'footer_copyright' => '&copy; 2026 Pastil ni Liling. Swak sa Bulsa, Sarap na Babalik-balikan.',
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
            'franchise_footer_copyright' => '&copy; 2026 Pastil ni Liling Franchise Program. Swak sa Bulsa, Sarap na Babalik-balikan.'
        ];

        $mergedSettings = array_merge($defaults, $settings);

        return response()->json([
            'success' => true,
            'data' => $mergedSettings
        ], 200);
    }

    /**
     * Save/Update a batch of website settings.
     * Restricts endpoint to authorized HQ and Admin roles.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access credentials.'
            ], 401);
        }

        if (!$user->hasRole('Admin') && !$user->hasRole('HQ operations')) {
            return response()->json([
                'success' => false,
                'message' => 'Restricted personnel access locks triggered.'
            ], 403);
        }

        // Validate batch inputs
        $request->validate([
            'settings' => 'required|array'
        ]);

        $settingsToSave = $request->input('settings');

        try {
            foreach ($settingsToSave as $key => $value) {
                // Safeguard keys to prevent malicious entries or random data bloat
                $allowedKeys = [
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
                    'franchise_footer_copyright'
                ];

                if (in_array($key, $allowedKeys)) {
                    WebsiteSetting::setByKey($key, $value);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Website content settings updated successfully.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to apply site configuration settings.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
