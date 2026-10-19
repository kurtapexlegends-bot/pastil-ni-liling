<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Hub;
use App\Models\User;
use App\Models\WorkShift;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ExpenseManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $franchiseeA;

    protected User $franchiseeB;

    protected User $cashierA;

    protected User $unassignedCashier;

    protected Hub $hubA;

    protected Hub $hubB;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $franchiseeRole = Role::firstOrCreate(['name' => 'Franchisee']);
        $cashierRole = Role::firstOrCreate(['name' => 'Branch Cashier']);
        Role::firstOrCreate(['name' => 'Customer']);

        $this->admin = User::factory()->create(['name' => 'HQ Admin']);
        $this->admin->assignRole($adminRole);

        $this->franchiseeA = User::factory()->create(['name' => 'Franchisee A']);
        $this->franchiseeA->assignRole($franchiseeRole);

        $this->franchiseeB = User::factory()->create(['name' => 'Franchisee B']);
        $this->franchiseeB->assignRole($franchiseeRole);

        $this->hubA = Hub::create([
            'franchisee_id' => $this->franchiseeA->id,
            'name' => 'Manila Hub',
            'address' => 'Manila',
            'status' => 'active',
        ]);

        $this->hubB = Hub::create([
            'franchisee_id' => $this->franchiseeB->id,
            'name' => 'Cebu Hub',
            'address' => 'Cebu',
            'status' => 'active',
        ]);

        $this->cashierA = User::factory()->create([
            'name' => 'Cashier A',
            'hub_id' => $this->hubA->id,
        ]);
        $this->cashierA->assignRole($cashierRole);

        $this->unassignedCashier = User::factory()->create([
            'name' => 'Unassigned Cashier',
            'hub_id' => null,
        ]);
        $this->unassignedCashier->assignRole($cashierRole);
    }

    public function test_admin_can_list_all_expenses_or_filter_by_hub_and_category(): void
    {
        Expense::create([
            'hub_id' => $this->hubA->id,
            'category' => 'utilities',
            'amount' => 500.00,
            'date' => now()->toDateString(),
            'description' => 'Hub A electricity',
        ]);

        Expense::create([
            'hub_id' => $this->hubB->id,
            'category' => 'rent',
            'amount' => 15000.00,
            'date' => now()->toDateString(),
            'description' => 'Hub B rent',
        ]);

        Expense::create([
            'hub_id' => null,
            'category' => 'marketing',
            'amount' => 2000.00,
            'date' => now()->toDateString(),
            'description' => 'HQ digital ads',
        ]);

        // 1. Admin lists all
        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/expenses');
        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data'));

        // 2. Admin filters by hub_id
        $filteredResp = $this->actingAs($this->admin, 'sanctum')->getJson('/api/expenses?hub_id='.$this->hubA->id);
        $filteredResp->assertStatus(200);
        $this->assertCount(1, $filteredResp->json('data'));
        $this->assertEquals($this->hubA->id, $filteredResp->json('data.0.hub_id'));

        // 3. Admin filters by category
        $catResp = $this->actingAs($this->admin, 'sanctum')->getJson('/api/expenses?category=marketing');
        $catResp->assertStatus(200);
        $this->assertCount(1, $catResp->json('data'));
        $this->assertEquals('marketing', $catResp->json('data.0.category'));
    }

    public function test_franchisee_only_sees_expenses_belonging_to_their_hub(): void
    {
        $expenseA = Expense::create([
            'hub_id' => $this->hubA->id,
            'category' => 'utilities',
            'amount' => 450.00,
            'date' => now()->toDateString(),
            'description' => 'Hub A water bill',
        ]);

        $expenseB = Expense::create([
            'hub_id' => $this->hubB->id,
            'category' => 'utilities',
            'amount' => 600.00,
            'date' => now()->toDateString(),
            'description' => 'Hub B water bill',
        ]);

        $response = $this->actingAs($this->franchiseeA, 'sanctum')->getJson('/api/expenses');
        $response->assertStatus(200);

        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertContains($expenseA->id, $ids);
        $this->assertNotContains($expenseB->id, $ids);
    }

    public function test_cashier_with_active_shift_sees_hub_expenses_while_unassigned_is_rejected(): void
    {
        Expense::create([
            'hub_id' => $this->hubA->id,
            'category' => 'materials',
            'amount' => 120.00,
            'date' => now()->toDateString(),
            'description' => 'Ice and packaging',
        ]);

        // Clock in Cashier A
        WorkShift::create([
            'user_id' => $this->cashierA->id,
            'hub_id' => $this->hubA->id,
            'clock_in' => now(),
            'status' => 'active',
            'hourly_rate' => 60.00,
        ]);

        $response = $this->actingAs($this->cashierA, 'sanctum')->getJson('/api/expenses');
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));

        // Unassigned cashier with no active shift
        $unassignedResp = $this->actingAs($this->unassignedCashier, 'sanctum')->getJson('/api/expenses');
        $unassignedResp->assertStatus(400);
    }

    public function test_creating_expense_enforces_tenant_scoping_and_invalidates_analytics_cache(): void
    {
        Cache::put('analytics_summary', ['mock' => true], 3600);

        // Franchisee creates expense (spoofing hub_id to hub B)
        $response = $this->actingAs($this->franchiseeA, 'sanctum')->postJson('/api/expenses', [
            'hub_id' => $this->hubB->id,
            'category' => 'materials',
            'amount' => 250.00,
            'date' => now()->toDateString(),
            'description' => 'Packaging tape and markers',
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);

        // Verified: forced to Franchisee A's hub, ignoring spoofed hub_id
        $this->assertEquals($this->hubA->id, $response->json('data.hub_id'));
        $this->assertDatabaseHas('expenses', [
            'hub_id' => $this->hubA->id,
            'category' => 'materials',
            'amount' => 250.00,
        ]);

        // Verified: cache flushed
        $this->assertFalse(Cache::has('analytics_summary'));
    }

    public function test_franchisee_cannot_update_or_delete_another_hubs_expense(): void
    {
        $expenseB = Expense::create([
            'hub_id' => $this->hubB->id,
            'category' => 'utilities',
            'amount' => 1000.00,
            'date' => now()->toDateString(),
            'description' => 'Hub B power',
        ]);

        // Update attempt (Forbidden)
        $updateResp = $this->actingAs($this->franchiseeA, 'sanctum')->putJson("/api/expenses/{$expenseB->id}", [
            'amount' => 10.00,
        ]);
        $updateResp->assertStatus(403);

        // Delete attempt (Forbidden)
        $deleteResp = $this->actingAs($this->franchiseeA, 'sanctum')->deleteJson("/api/expenses/{$expenseB->id}");
        $deleteResp->assertStatus(403);

        // Expense B remains intact
        $this->assertDatabaseHas('expenses', [
            'id' => $expenseB->id,
            'amount' => 1000.00,
            'deleted_at' => null,
        ]);
    }

    public function test_franchisee_can_update_and_soft_delete_own_hub_expense(): void
    {
        $expenseA = Expense::create([
            'hub_id' => $this->hubA->id,
            'category' => 'materials',
            'amount' => 300.00,
            'date' => now()->toDateString(),
            'description' => 'Original description',
        ]);

        // Update own expense
        $updateResp = $this->actingAs($this->franchiseeA, 'sanctum')->putJson("/api/expenses/{$expenseA->id}", [
            'amount' => 350.00,
            'description' => 'Updated description',
        ]);
        $updateResp->assertStatus(200);
        $this->assertEquals(350.00, $updateResp->json('data.amount'));

        // Soft delete own expense
        $deleteResp = $this->actingAs($this->franchiseeA, 'sanctum')->deleteJson("/api/expenses/{$expenseA->id}");
        $deleteResp->assertStatus(200);

        // Soft deleted
        $this->assertNull(Expense::find($expenseA->id));
        $this->assertNotNull(Expense::withTrashed()->find($expenseA->id));
    }
}
