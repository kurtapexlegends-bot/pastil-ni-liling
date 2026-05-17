<?php

namespace Tests\Feature;

use App\Models\Hub;
use App\Models\Order;
use App\Models\User;
use App\Models\WorkShift;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class HQControlsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $hqOps;
    protected User $franchisee;
    protected User $cashier;
    protected Hub $hub;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Create standard Spatie roles
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $hqOpsRole = Role::firstOrCreate(['name' => 'HQ operations']);
        $franchiseeRole = Role::firstOrCreate(['name' => 'Franchisee']);
        $cashierRole = Role::firstOrCreate(['name' => 'Branch Cashier']);

        // 2. Create users and assign roles
        $this->admin = User::factory()->create(['name' => 'HQ Super Admin']);
        $this->admin->assignRole($adminRole);

        $this->hqOps = User::factory()->create(['name' => 'HQ Ops Executive']);
        $this->hqOps->assignRole($hqOpsRole);

        $this->franchisee = User::factory()->create(['name' => 'Liling Diliman Franchise Owner']);
        $this->franchisee->assignRole($franchiseeRole);

        $this->cashier = User::factory()->create(['name' => 'Liling Diliman Lead Cashier']);
        $this->cashier->assignRole($cashierRole);

        // 3. Create active branch hub
        $this->hub = Hub::create([
            'franchisee_id' => $this->franchisee->id,
            'name' => 'Diliman Hub Spoke',
            'address' => 'UP Diliman, Quezon City',
            'status' => 'active'
        ]);
    }

    /** @test */
    public function only_admins_and_hq_ops_can_manage_employees()
    {
        // 1. Admin lists employees (Authorized)
        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/admin/employees');
        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);

        // 2. Franchisee attempts to register new cashier globally via HQ endpoints (Forbidden)
        $response = $this->actingAs($this->franchisee, 'sanctum')->postJson('/api/admin/employees', [
            'name' => 'Undercover Cashier',
            'email' => 'undercover@liling.com',
            'password' => 'password123',
            'role' => 'Branch Cashier'
        ]);
        $response->assertStatus(403);

        // 3. Admin successfully creates an employee
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/admin/employees', [
            'name' => 'New Regional Cashier',
            'email' => 'newcashier@liling.com',
            'password' => 'password123',
            'role' => 'Branch Cashier'
        ]);
        $response->assertStatus(201)
            ->assertJsonPath('success', true);
    }

    /** @test */
    public function test_digital_compliance_qc_audit_submission_and_governance()
    {
        // 1. Submit a weekly compliance hygiene audit (Franchisee / Partner)
        $response = $this->actingAs($this->franchisee, 'sanctum')->postJson('/api/compliance/audits', [
            'hub_id' => $this->hub->id,
            'hygiene_score' => 95,
            'recipe_adherence_score' => 100,
            'notes' => 'Weekly deep kitchen hygiene scan completed successfully.',
            'kitchen_photo' => '/photos/kitchen_diliman.jpg'
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'pending');

        $auditId = $response->json('data.id');

        // 2. HQ Ops reviews and flags the audit as approved or rejected/flagged
        $response = $this->actingAs($this->hqOps, 'sanctum')->patchJson("/api/compliance/audits/{$auditId}", [
            'status' => 'approved',
            'notes' => 'Passed kitchen validation with high scores.'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'approved');
    }

    /** @test */
    public function test_cashier_shift_session_clock_in_clock_out_and_commission_payout_calculation()
    {
        // 1. Clock in cashier shift
        $response = $this->actingAs($this->cashier, 'sanctum')->postJson('/api/payroll/shifts/clock-in', [
            'hub_id' => $this->hub->id
        ]);
        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        // 2. Add a walk-in POS order processed by this cashier
        $order = Order::create([
            'user_id' => $this->franchisee->id, // customer reference
            'hub_id' => $this->hub->id,
            'cashier_id' => $this->cashier->id,
            'type' => 'retail',
            'payment_method' => 'cash',
            'payment_status' => 'completed',
            'status' => 'delivered',
            'total_amount' => 5000.00, // 5,000 PHP cashier walk-in sales
            'shipping_address' => 'Walk-in POS',
            'contact_number' => '09123456789',
        ]);

        // Mock 4 hours shift duration (we can simulate by setting custom clock_in timestamp in database)
        $activeShift = WorkShift::where('user_id', $this->cashier->id)
            ->where('status', 'active')
            ->first();
        
        $activeShift->clock_in = now()->subHours(4);
        $activeShift->save();

        // 3. Clock out from cashier shift
        $response = $this->actingAs($this->cashier, 'sanctum')->postJson('/api/payroll/shifts/clock-out');
        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        // 4. Calculate Payout (Direct Calculator)
        // Base Pay = 4 hours * 60 PHP = 240 PHP
        // Commissions = 5,000 PHP sales * 5% = 250 PHP
        // Total Payout = 490 PHP
        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/payroll/payouts/calculate?' . http_build_query([
            'user_id' => $this->cashier->id,
            'start_date' => now()->subDay()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
        ]));

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.base_pay', 240)
            ->assertJsonPath('data.commission_pay', 250)
            ->assertJsonPath('data.total_pay', 490);

        // 5. Submit Payout Ledger record
        $response = $this->actingAs($this->franchisee, 'sanctum')->postJson('/api/payroll/payouts', [
            'user_id' => $this->cashier->id,
            'hub_id' => $this->hub->id,
            'start_date' => now()->subDay()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
            'base_pay' => 240,
            'commission_pay' => 250,
            'total_pay' => 490,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'paid');
    }
}
