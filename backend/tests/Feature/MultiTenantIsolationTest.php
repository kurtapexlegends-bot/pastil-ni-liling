<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Hub;
use App\Models\HubInventory;
use App\Models\Ingredient;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payout;
use App\Models\Product;
use App\Models\ProductIngredient;
use App\Models\User;
use App\Services\PayrollService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class MultiTenantIsolationTest extends TestCase
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
            'name' => 'Branch A',
            'address' => 'Manila',
            'status' => 'active',
        ]);

        $this->hubB = Hub::create([
            'franchisee_id' => $this->franchiseeB->id,
            'name' => 'Branch B',
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

        $this->unassignedCashier = User::factory()->create(['name' => 'Unassigned Cashier']);
        $this->unassignedCashier->assignRole($cashierRole);

        $this->product = Product::create([
            'name' => 'Original Chicken Pastil',
            'slug' => 'original-chicken-pastil',
            'description' => 'Mindanao style chicken pastil',
            'price' => 30.00,
            'category' => 'pastil',
            'stock' => 100,
        ]);
    }

    public function test_cashier_without_shift_or_hub_is_forbidden_from_franchise_endpoints()
    {
        $response = $this->actingAs($this->unassignedCashier, 'sanctum')->getJson('/api/franchise/inventory');
        $response->assertStatus(403);

        $response = $this->actingAs($this->unassignedCashier, 'sanctum')->getJson('/api/franchise/orders');
        $response->assertStatus(403);

        $response = $this->actingAs($this->unassignedCashier, 'sanctum')->patchJson('/api/franchise/orders/1', ['status' => 'preparing']);
        $response->assertStatus(403);
    }

    public function test_assigned_cashier_can_access_own_hub_inventory()
    {
        HubInventory::create([
            'hub_id' => $this->hubA->id,
            'product_id' => $this->product->id,
            'stock_quantity' => 50,
        ]);

        $response = $this->actingAs($this->cashierA, 'sanctum')->getJson('/api/franchise/inventory');
        $response->assertStatus(200);
        $this->assertEquals($this->hubA->id, $response->json('hub.id'));
    }

    public function test_franchisee_only_sees_cashiers_assigned_to_their_own_hub()
    {
        $response = $this->actingAs($this->franchiseeA, 'sanctum')->getJson('/api/admin/employees');
        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals($this->cashierA->id, $data[0]['id']);
    }

    public function test_franchisee_only_sees_their_own_branch_in_hubs_index()
    {
        $response = $this->actingAs($this->franchiseeA, 'sanctum')->getJson('/api/admin/hubs');
        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals($this->hubA->id, $data[0]['id']);

        // Admin sees all hubs
        $adminResp = $this->actingAs($this->admin, 'sanctum')->getJson('/api/admin/hubs');
        $adminResp->assertStatus(200);
        $this->assertCount(2, $adminResp->json('data'));
    }

    public function test_franchisee_cannot_calculate_or_store_payout_for_another_branch()
    {
        // 1. Calculate payout for Cashier B (fails 403)
        $response = $this->actingAs($this->franchiseeA, 'sanctum')->getJson('/api/payroll/payouts/calculate?'.http_build_query([
            'user_id' => $this->cashierB->id,
            'start_date' => now()->subDay()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
        ]));
        $response->assertStatus(403);

        // 2. Store payout for Hub B (fails 403)
        $response = $this->actingAs($this->franchiseeA, 'sanctum')->postJson('/api/payroll/payouts', [
            'user_id' => $this->cashierB->id,
            'hub_id' => $this->hubB->id,
            'start_date' => now()->subDay()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
            'base_pay' => 100,
            'commission_pay' => 0,
            'total_pay' => 100,
        ]);
        $response->assertStatus(403);
    }

    public function test_franchisee_cannot_submit_compliance_audit_for_another_hub()
    {
        $response = $this->actingAs($this->franchiseeA, 'sanctum')->postJson('/api/compliance/audits', [
            'hub_id' => $this->hubB->id,
            'hygiene_score' => 90,
            'recipe_adherence_score' => 95,
            'notes' => 'Unauthorized audit submission',
        ]);
        $response->assertStatus(403);
    }

    public function test_analytics_summary_includes_completed_pos_revenue_and_cogs()
    {
        $ingredient = Ingredient::create([
            'name' => 'Chicken Flakes',
            'unit' => 'g',
            'stock' => 500,
            'min_stock' => 50,
            'unit_cost' => 0.50,
        ]);

        ProductIngredient::create([
            'product_id' => $this->product->id,
            'ingredient_id' => $ingredient->id,
            'quantity_required' => 20, // 20g * 0.50 = 10 PHP COGS
        ]);

        $order = Order::create([
            'hub_id' => $this->hubA->id,
            'user_id' => $this->franchiseeA->id,
            'type' => 'pos',
            'channel' => 'walk_in',
            'status' => 'completed',
            'total_amount' => 300.00,
            'payment_method' => 'cash',
            'shipping_address' => 'Stall',
            'contact_number' => 'N/A',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $this->product->id,
            'quantity' => 10,
            'price' => 30.00,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/analytics/summary');
        $response->assertStatus(200);

        $grossMargins = $response->json('data.gross_margins');
        $this->assertEquals(300.00, $grossMargins['total_revenue']);
        $this->assertEquals(100.00, $grossMargins['cogs']); // 10 units * 10 PHP recipe cost
    }

    public function test_cashier_sync_pos_orders_succeeds_and_enables_commission_calculation()
    {
        HubInventory::create([
            'hub_id' => $this->hubA->id,
            'product_id' => $this->product->id,
            'stock_quantity' => 50,
        ]);

        $response = $this->actingAs($this->cashierA, 'sanctum')->postJson('/api/pos/sync', [
            'orders' => [
                [
                    'offline_id' => 'OFFLINE-CASHIER-A1',
                    'total_amount' => 600.00,
                    'payment_method' => 'cash',
                    'channel' => 'walk_in',
                    'items' => [
                        [
                            'product_id' => $this->product->id,
                            'quantity' => 20,
                            'price' => 30.00,
                        ],
                    ],
                ],
            ],
        ]);

        $response->assertStatus(200);
        $this->assertTrue($response->json('success'));

        $order = Order::where('idempotency_key', 'OFFLINE-CASHIER-A1')->first();
        $this->assertNotNull($order);
        $this->assertEquals($this->cashierA->id, $order->cashier_id);
        $this->assertEquals($this->hubA->id, $order->hub_id);

        // Check commission pay via PayrollService
        $payrollService = new PayrollService;
        $payout = $payrollService->calculateUserPayout(
            $this->cashierA->id,
            Carbon::now()->startOfDay(),
            Carbon::now()->endOfDay()
        );

        // 5% of 600.00 PHP = 30.00 PHP
        $this->assertEquals(30.00, $payout['commission_pay']);
    }

    public function test_unassigned_cashier_cannot_sync_pos_orders()
    {
        $response = $this->actingAs($this->unassignedCashier, 'sanctum')->postJson('/api/pos/sync', [
            'orders' => [
                [
                    'offline_id' => 'OFFLINE-UNASSIGNED-1',
                    'total_amount' => 300.00,
                    'payment_method' => 'cash',
                    'channel' => 'walk_in',
                    'items' => [
                        [
                            'product_id' => $this->product->id,
                            'quantity' => 10,
                            'price' => 30.00,
                        ],
                    ],
                ],
            ],
        ]);

        $response->assertStatus(403);
    }

    public function test_storing_payout_creates_salary_expense_entry_inside_acid_transaction()
    {
        $response = $this->actingAs($this->franchiseeA, 'sanctum')->postJson('/api/payroll/payouts', [
            'user_id' => $this->cashierA->id,
            'hub_id' => $this->hubA->id,
            'start_date' => now()->subDays(7)->toDateString(),
            'end_date' => now()->toDateString(),
            'base_pay' => 1200.00,
            'commission_pay' => 30.00,
            'total_pay' => 1230.00,
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('payouts', [
            'user_id' => $this->cashierA->id,
            'hub_id' => $this->hubA->id,
            'total_pay' => 1230.00,
            'status' => 'paid',
        ]);

        $this->assertDatabaseHas('expenses', [
            'hub_id' => $this->hubA->id,
            'category' => 'salary',
            'amount' => 1230.00,
        ]);
    }

    public function test_core_business_entities_use_soft_deletes()
    {
        $order = Order::create([
            'hub_id' => $this->hubA->id,
            'user_id' => $this->franchiseeA->id,
            'type' => 'pos',
            'channel' => 'walk_in',
            'status' => 'completed',
            'total_amount' => 100.00,
            'payment_method' => 'cash',
            'shipping_address' => 'Stall',
            'contact_number' => 'N/A',
        ]);

        $expense = Expense::create([
            'hub_id' => $this->hubA->id,
            'category' => 'utilities',
            'amount' => 500.00,
            'date' => now()->toDateString(),
            'description' => 'Water bill',
        ]);

        // Soft delete all 4
        $order->delete();
        $this->product->delete();
        $expense->delete();
        $this->hubB->delete();

        // Normal query should not find them
        $this->assertNull(Order::find($order->id));
        $this->assertNull(Product::find($this->product->id));
        $this->assertNull(Expense::find($expense->id));
        $this->assertNull(Hub::find($this->hubB->id));

        // withTrashed should find them
        $this->assertNotNull(Order::withTrashed()->find($order->id));
        $this->assertNotNull(Product::withTrashed()->find($this->product->id));
        $this->assertNotNull(Expense::withTrashed()->find($expense->id));
        $this->assertNotNull(Hub::withTrashed()->find($this->hubB->id));

        $this->assertNotNull(Order::withTrashed()->find($order->id)->deleted_at);
        $this->assertNotNull(Product::withTrashed()->find($this->product->id)->deleted_at);
        $this->assertNotNull(Expense::withTrashed()->find($expense->id)->deleted_at);
        $this->assertNotNull(Hub::withTrashed()->find($this->hubB->id)->deleted_at);
    }
}
