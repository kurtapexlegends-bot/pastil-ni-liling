<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Hub;
use App\Models\HubInventory;
use App\Models\Payout;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdversarialMultiTenantTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $franchiseeA;

    protected User $franchiseeB;

    protected User $cashierA;

    protected User $cashierB;

    protected User $unassignedCashier;

    protected Hub $hubA;

    protected Hub $hubB;

    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $franchiseeRole = Role::firstOrCreate(['name' => 'Franchisee']);
        $cashierRole = Role::firstOrCreate(['name' => 'Branch Cashier']);

        $this->admin = User::factory()->create(['name' => 'HQ Admin']);
        $this->admin->assignRole($adminRole);

        $this->franchiseeA = User::factory()->create(['name' => 'Owner A']);
        $this->franchiseeA->assignRole($franchiseeRole);

        $this->franchiseeB = User::factory()->create(['name' => 'Owner B']);
        $this->franchiseeB->assignRole($franchiseeRole);

        $this->hubA = Hub::create([
            'franchisee_id' => $this->franchiseeA->id,
            'name' => 'Branch A Manila',
            'address' => 'Manila',
            'status' => 'active',
        ]);

        $this->hubB = Hub::create([
            'franchisee_id' => $this->franchiseeB->id,
            'name' => 'Branch B Cebu',
            'address' => 'Cebu',
            'status' => 'active',
        ]);

        $this->cashierA = User::factory()->create([
            'name' => 'Cashier A',
            'hub_id' => $this->hubA->id,
        ]);
        $this->cashierA->assignRole($cashierRole);

        $this->cashierB = User::factory()->create([
            'name' => 'Cashier B',
            'hub_id' => $this->hubB->id,
        ]);
        $this->cashierB->assignRole($cashierRole);

        $this->unassignedCashier = User::factory()->create([
            'name' => 'Rogue Unassigned Cashier',
            'hub_id' => null,
        ]);
        $this->unassignedCashier->assignRole($cashierRole);

        $this->product = Product::create([
            'name' => 'Pastil de Manila',
            'slug' => 'pastil-de-manila',
            'description' => 'Mindanao Pastil',
            'price' => 50.00,
            'category' => 'pastil',
            'stock' => 100,
        ]);

        HubInventory::create([
            'hub_id' => $this->hubA->id,
            'product_id' => $this->product->id,
            'stock_quantity' => 150,
        ]);

        HubInventory::create([
            'hub_id' => $this->hubB->id,
            'product_id' => $this->product->id,
            'stock_quantity' => 80,
        ]);
    }

    /**
     * 1. Unassigned cashier (no shift, no hub_id) cannot access franchise inventory or orders.
     * Must return 403, NEVER Hub 1 data.
     */
    public function test_unassigned_cashier_strictly_forbidden_and_never_leaks_hub_data()
    {
        // Inventory
        $invResp = $this->actingAs($this->unassignedCashier, 'sanctum')->getJson('/api/franchise/inventory');
        $invResp->assertStatus(403);
        $this->assertStringNotContainsString('Branch A Manila', $invResp->getContent());

        // Orders
        $orderResp = $this->actingAs($this->unassignedCashier, 'sanctum')->getJson('/api/franchise/orders');
        $orderResp->assertStatus(403);
        $this->assertStringNotContainsString('Branch A Manila', $orderResp->getContent());

        // Patch Order
        $patchResp = $this->actingAs($this->unassignedCashier, 'sanctum')->patchJson('/api/franchise/orders/1', [
            'status' => 'preparing',
        ]);
        $patchResp->assertStatus(403);

        // POS Sync
        $syncResp = $this->actingAs($this->unassignedCashier, 'sanctum')->postJson('/api/pos/sync', [
            'orders' => [
                [
                    'offline_id' => 'ROGUE-OFFLINE-001',
                    'total_amount' => 100.00,
                    'payment_method' => 'cash',
                    'channel' => 'walk_in',
                    'items' => [
                        [
                            'product_id' => $this->product->id,
                            'quantity' => 2,
                            'price' => 50.00,
                        ],
                    ],
                ],
            ],
        ]);
        $syncResp->assertStatus(403);
    }

    /**
     * 2. Franchisee A cannot inspect or list cashiers of Franchisee B via /api/admin/employees.
     */
    public function test_franchisee_a_cannot_list_cashiers_of_franchisee_b()
    {
        $response = $this->actingAs($this->franchiseeA, 'sanctum')->getJson('/api/admin/employees');
        $response->assertStatus(200);

        $employees = $response->json('data');
        $employeeIds = collect($employees)->pluck('id')->all();

        $this->assertContains($this->cashierA->id, $employeeIds);
        $this->assertNotContains($this->cashierB->id, $employeeIds);
        $this->assertNotContains($this->unassignedCashier->id, $employeeIds);
    }

    /**
     * 3. Franchisee A cannot inspect branches of Franchisee B via /api/admin/hubs.
     */
    public function test_franchisee_a_cannot_inspect_branches_of_franchisee_b()
    {
        $response = $this->actingAs($this->franchiseeA, 'sanctum')->getJson('/api/admin/hubs');
        $response->assertStatus(200);

        $hubs = $response->json('data');
        $hubIds = collect($hubs)->pluck('id')->all();

        $this->assertContains($this->hubA->id, $hubIds);
        $this->assertNotContains($this->hubB->id, $hubIds);

        // Franchisee cannot mutate Hub B
        $updateResp = $this->actingAs($this->franchiseeA, 'sanctum')->putJson("/api/admin/hubs/{$this->hubB->id}", [
            'name' => 'Hostile Takeover Hub',
            'address' => 'Hacked',
            'status' => 'inactive',
            'franchisee_id' => $this->franchiseeA->id,
        ]);
        $updateResp->assertStatus(403);

        $deleteResp = $this->actingAs($this->franchiseeA, 'sanctum')->deleteJson("/api/admin/hubs/{$this->hubB->id}");
        $deleteResp->assertStatus(403);
    }

    /**
     * 4. Franchisee A cannot submit compliance audits for Hub B via /api/compliance/audits.
     */
    public function test_franchisee_a_cannot_submit_compliance_audit_for_hub_b()
    {
        $response = $this->actingAs($this->franchiseeA, 'sanctum')->postJson('/api/compliance/audits', [
            'hub_id' => $this->hubB->id,
            'hygiene_score' => 50,
            'recipe_adherence_score' => 40,
            'notes' => 'Malicious fake audit report for competitor branch.',
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'message' => 'Unauthorized. You do not own this franchise branch.',
        ]);

        $this->assertDatabaseMissing('compliance_audits', [
            'hub_id' => $this->hubB->id,
            'notes' => 'Malicious fake audit report for competitor branch.',
        ]);
    }

    /**
     * 5a. Franchisee A cannot calculate payroll for Franchisee B's employees.
     */
    public function test_franchisee_a_cannot_calculate_payroll_for_franchisee_b_employee()
    {
        $response = $this->actingAs($this->franchiseeA, 'sanctum')->getJson('/api/payroll/payouts/calculate?'.http_build_query([
            'user_id' => $this->cashierB->id,
            'start_date' => now()->subDays(7)->toDateString(),
            'end_date' => now()->toDateString(),
        ]));

        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'message' => 'Unauthorized. Employee does not belong to your branch.',
        ]);
    }

    /**
     * 5b. Franchisee A cannot disburse payroll for Hub B.
     */
    public function test_franchisee_a_cannot_disburse_payroll_for_hub_b()
    {
        $response = $this->actingAs($this->franchiseeA, 'sanctum')->postJson('/api/payroll/payouts', [
            'user_id' => $this->cashierB->id,
            'hub_id' => $this->hubB->id,
            'start_date' => now()->subDays(7)->toDateString(),
            'end_date' => now()->toDateString(),
            'base_pay' => 500,
            'commission_pay' => 0,
            'total_pay' => 500,
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'message' => 'Unauthorized payout action for this franchise hub.',
        ]);
    }

    /**
     * 5c. Franchisee A cannot bypass employee validation to disburse payroll for Cashier B (Franchisee B's employee)
     * even by specifying their own hub_id (Hub A). Returns HTTP 403.
     */
    public function test_franchisee_a_disbursing_payroll_for_cashier_b_using_own_hub_id()
    {
        $response = $this->actingAs($this->franchiseeA, 'sanctum')->postJson('/api/payroll/payouts', [
            'user_id' => $this->cashierB->id,
            'hub_id' => $this->hubA->id,
            'start_date' => now()->subDays(7)->toDateString(),
            'end_date' => now()->toDateString(),
            'base_pay' => 500,
            'commission_pay' => 0,
            'total_pay' => 500,
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'message' => 'Unauthorized. Employee does not belong to your branch.',
        ]);
        $this->assertDatabaseMissing('payouts', [
            'user_id' => $this->cashierB->id,
            'hub_id' => $this->hubA->id,
        ]);
    }

    /**
     * 5d. Cashier A (assigned to Hub A) cannot clock into Hub B without authorization.
     */
    public function test_cashier_assigned_to_hub_a_clocking_into_hub_b()
    {
        $response = $this->actingAs($this->cashierA, 'sanctum')->postJson('/api/payroll/shifts/clock-in', [
            'hub_id' => $this->hubB->id,
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'message' => 'Unauthorized. You are not assigned to this branch.',
        ]);
        $this->assertDatabaseMissing('work_shifts', [
            'user_id' => $this->cashierA->id,
            'hub_id' => $this->hubB->id,
            'status' => 'active',
        ]);
    }

    /**
     * 5e. Unassigned cashier cannot clock into Hub A or access Hub A's inventory.
     */
    public function test_unassigned_cashier_clocking_into_hub_a_and_accessing_inventory()
    {
        $clockInResp = $this->actingAs($this->unassignedCashier, 'sanctum')->postJson('/api/payroll/shifts/clock-in', [
            'hub_id' => $this->hubA->id,
        ]);

        $clockInResp->assertStatus(403);
        $clockInResp->assertJson([
            'success' => false,
            'message' => 'Unauthorized. You are not assigned to this branch.',
        ]);

        // Unassigned cashier without active shift remains forbidden from resolving Hub A
        $invResp = $this->actingAs($this->unassignedCashier, 'sanctum')->getJson('/api/franchise/inventory');
        $invResp->assertStatus(403);
    }

    /**
     * 5f. Cashier A can clock into their assigned branch (Hub A).
     */
    public function test_cashier_assigned_to_hub_a_can_clock_into_hub_a()
    {
        $response = $this->actingAs($this->cashierA, 'sanctum')->postJson('/api/payroll/shifts/clock-in', [
            'hub_id' => $this->hubA->id,
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $this->assertDatabaseHas('work_shifts', [
            'user_id' => $this->cashierA->id,
            'hub_id' => $this->hubA->id,
            'status' => 'active',
        ]);
    }

    /**
     * 5g. Franchisee A can disburse payroll for their own employee (Cashier A).
     */
    public function test_franchisee_a_can_disburse_payroll_for_own_cashier_a()
    {
        $response = $this->actingAs($this->franchiseeA, 'sanctum')->postJson('/api/payroll/payouts', [
            'user_id' => $this->cashierA->id,
            'hub_id' => $this->hubA->id,
            'start_date' => now()->subDays(7)->toDateString(),
            'end_date' => now()->toDateString(),
            'base_pay' => 500,
            'commission_pay' => 0,
            'total_pay' => 500,
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $this->assertDatabaseHas('payouts', [
            'user_id' => $this->cashierA->id,
            'hub_id' => $this->hubA->id,
            'status' => 'paid',
        ]);
    }

    /**
     * 6. Cashier A cannot view Cashier B's payouts.
     */
    public function test_cashier_a_cannot_view_cashier_b_payouts()
    {
        // Create payout for Cashier B
        Payout::create([
            'user_id' => $this->cashierB->id,
            'hub_id' => $this->hubB->id,
            'start_date' => now()->subDays(7)->toDateString(),
            'end_date' => now()->toDateString(),
            'base_pay' => 1000,
            'commission_pay' => 50,
            'total_pay' => 1050,
            'status' => 'paid',
        ]);

        $response = $this->actingAs($this->cashierA, 'sanctum')->getJson('/api/payroll/payouts');
        $response->assertStatus(200);

        $payouts = $response->json('data');
        $this->assertCount(0, $payouts);
    }

    /**
     * 7. Franchisee A cannot view or delete Hub B expenses.
     */
    public function test_franchisee_a_cannot_view_or_delete_hub_b_expenses()
    {
        $expenseB = Expense::create([
            'hub_id' => $this->hubB->id,
            'category' => 'utilities',
            'amount' => 1200,
            'date' => now()->toDateString(),
            'description' => 'Cebu Electric bill',
        ]);

        // View expenses
        $indexResp = $this->actingAs($this->franchiseeA, 'sanctum')->getJson('/api/expenses');
        $indexResp->assertStatus(200);
        $expenseIds = collect($indexResp->json('data'))->pluck('id')->all();
        $this->assertNotContains($expenseB->id, $expenseIds);

        // Delete expense of Hub B
        $deleteResp = $this->actingAs($this->franchiseeA, 'sanctum')->deleteJson("/api/expenses/{$expenseB->id}");
        $deleteResp->assertStatus(403);
    }
}
