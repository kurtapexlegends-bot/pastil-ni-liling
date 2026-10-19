<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class WebsiteSettingTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $hqOps;

    protected User $franchisee;

    protected User $cashier;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $hqOpsRole = Role::firstOrCreate(['name' => 'HQ operations']);
        $franchiseeRole = Role::firstOrCreate(['name' => 'Franchisee']);
        $cashierRole = Role::firstOrCreate(['name' => 'Branch Cashier']);

        $this->admin = User::factory()->create(['name' => 'HQ Super Admin']);
        $this->admin->assignRole($adminRole);

        $this->hqOps = User::factory()->create(['name' => 'HQ Operations Exec']);
        $this->hqOps->assignRole($hqOpsRole);

        $this->franchisee = User::factory()->create(['name' => 'Franchise Partner']);
        $this->franchisee->assignRole($franchiseeRole);

        $this->cashier = User::factory()->create(['name' => 'Branch Cashier']);
        $this->cashier->assignRole($cashierRole);
    }

    public function test_public_can_retrieve_website_settings_with_defaults(): void
    {
        $response = $this->getJson('/api/website-settings');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.hero_badge', 'Sarap na Babalik-balikan')
            ->assertJsonPath('data.stats_branches', '50+')
            ->assertJsonPath('data.announcement_enabled', false)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'hero_badge',
                    'hero_title_white',
                    'hero_title_green',
                    'hero_subtitle',
                    'stats_branches',
                    'hero',
                    'about',
                    'features',
                    'testimonials',
                    'faqs',
                    'contact',
                    'brand',
                ],
            ]);
    }

    public function test_admin_can_update_website_settings_batch(): void
    {
        $payload = [
            'settings' => [
                'hero_badge' => 'Bagong Timpla at Sarap',
                'announcement_enabled' => true,
                'announcement_text' => 'Grand Opening Promo: Buy 1 Take 1!',
                'stats_branches' => '100+',
            ],
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson('/api/admin/website-settings', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.hero_badge', 'Bagong Timpla at Sarap')
            ->assertJsonPath('data.announcement_enabled', true)
            ->assertJsonPath('data.stats_branches', '100+');

        $this->assertDatabaseHas('website_settings', [
            'key' => 'hero_badge',
            'value' => 'Bagong Timpla at Sarap',
        ]);

        $this->assertDatabaseHas('website_settings', [
            'key' => 'announcement_enabled',
            'value' => '1',
        ]);
    }

    public function test_admin_can_update_structured_section_settings(): void
    {
        $customTestimonials = [
            [
                'name' => 'Juan Dela Cruz',
                'role' => 'Food Blogger',
                'comment' => 'The best spicy kagikit chicken pastil in town!',
                'rating' => 5,
            ],
        ];

        $payload = [
            'settings' => [
                'testimonials' => $customTestimonials,
            ],
        ];

        $response = $this->actingAs($this->hqOps, 'sanctum')
            ->putJson('/api/admin/website-settings', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.testimonials.0.name', 'Juan Dela Cruz');

        // Confirm public GET reflects the decoded structure
        $publicRes = $this->getJson('/api/website-settings');
        $publicRes->assertStatus(200)
            ->assertJsonPath('data.testimonials.0.name', 'Juan Dela Cruz');
    }

    public function test_unauthorized_roles_cannot_update_website_settings(): void
    {
        $payload = [
            'settings' => [
                'hero_badge' => 'Hacked Badge',
            ],
        ];

        // Franchisee is forbidden
        $response = $this->actingAs($this->franchisee, 'sanctum')
            ->putJson('/api/admin/website-settings', $payload);
        $response->assertStatus(403);

        // Branch Cashier is forbidden
        $response = $this->actingAs($this->cashier, 'sanctum')
            ->putJson('/api/admin/website-settings', $payload);
        $response->assertStatus(403);
    }

    public function test_unauthenticated_requests_are_rejected(): void
    {
        $response = $this->putJson('/api/admin/website-settings', [
            'settings' => ['hero_badge' => 'Unauthenticated Update'],
        ]);

        $response->assertStatus(401);
    }

    public function test_disallowed_keys_are_filtered_and_not_persisted(): void
    {
        $payload = [
            'settings' => [
                'malicious_key' => '<script>alert("xss")</script>',
                'hero_badge' => 'Legitimate Badge',
            ],
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson('/api/admin/website-settings', $payload);

        $response->assertStatus(200);

        $this->assertDatabaseMissing('website_settings', [
            'key' => 'malicious_key',
        ]);

        $this->assertDatabaseHas('website_settings', [
            'key' => 'hero_badge',
            'value' => 'Legitimate Badge',
        ]);
    }

    public function test_validation_fails_if_settings_is_missing_or_not_array(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson('/api/admin/website-settings', [
                'settings' => 'not-an-array',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['settings']);
    }
}
