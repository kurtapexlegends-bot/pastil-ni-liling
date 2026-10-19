<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Hub;
use App\Models\HubInventory;
use App\Models\InventoryBatch;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Services\OrderFulfillmentService;
use App\Services\PayrollService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ChallengerM2StressTest extends TestCase
{
    use RefreshDatabase;

    protected User $cashierA;

    protected User $cashierB;

    protected Hub $hubA;

    protected Hub $hubB;

    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $cashierRole = Role::firstOrCreate(['name' => 'Branch Cashier']);
        $franchiseeRole = Role::firstOrCreate(['name' => 'Franchisee']);

        $franchiseeA = User::factory()->create(['name' => 'Franchisee A']);
        $franchiseeA->assignRole($franchiseeRole);

        $franchiseeB = User::factory()->create(['name' => 'Franchisee B']);
        $franchiseeB->assignRole($franchiseeRole);

        $this->hubA = Hub::create([
            'franchisee_id' => $franchiseeA->id,
            'name' => 'Branch Manila',
            'address' => 'Manila',
            'status' => 'active',
        ]);

        $this->hubB = Hub::create([
            'franchisee_id' => $franchiseeB->id,
            'name' => 'Branch Cebu',
            'address' => 'Cebu',
            'status' => 'active',
        ]);

        $this->cashierA = User::factory()->create([
            'name' => 'Cashier Manila',
            'hub_id' => $this->hubA->id,
        ]);
        $this->cashierA->assignRole($cashierRole);

        $this->cashierB = User::factory()->create([
            'name' => 'Cashier Cebu',
            'hub_id' => $this->hubB->id,
        ]);
        $this->cashierB->assignRole($cashierRole);

        $this->product = Product::create([
            'name' => 'Original Chicken Pastil',
            'slug' => 'original-chicken-pastil',
            'description' => 'Mindanao style chicken pastil',
            'price' => 30.00,
            'category' => 'pastil',
            'stock' => 100,
        ]);

        HubInventory::create([
            'hub_id' => $this->hubA->id,
            'product_id' => $this->product->id,
            'stock_quantity' => 100,
        ]);

        HubInventory::create([
            'hub_id' => $this->hubB->id,
            'product_id' => $this->product->id,
            'stock_quantity' => 100,
        ]);
    }

    /**
     * Requirement 1:
     * Test POS offline sync with a `Branch Cashier` user: verify HTTP 200, verify order created with `cashier_id = cashier.id`,
     * verify `PayrollService::calculateUserPayout` computes 5% commission.
     */
    public function test_pos_offline_sync_with_branch_cashier_and_commission()
    {
        $response = $this->actingAs($this->cashierA, 'sanctum')->postJson('/api/pos/sync', [
            'orders' => [
                [
                    'offline_id' => 'OFFLINE-REQ1-001',
                    'total_amount' => 1000.00,
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

        $response->assertStatus(200);
        $this->assertTrue($response->json('success'));

        $order = Order::where('idempotency_key', 'OFFLINE-REQ1-001')->first();
        $this->assertNotNull($order);
        $this->assertEquals($this->cashierA->id, $order->cashier_id);
        $this->assertEquals($this->hubA->id, $order->hub_id);

        $payrollService = new PayrollService;
        $payout = $payrollService->calculateUserPayout(
            $this->cashierA->id,
            Carbon::now()->startOfDay(),
            Carbon::now()->endOfDay()
        );

        // 5% of 1000.00 PHP = 50.00 PHP
        $this->assertEquals(50.00, $payout['commission_pay']);
    }

    /**
     * Test overdraft anomaly logging when offline POS order exceeds hub stock.
     */
    public function test_pos_offline_sync_overdraft_records_anomaly()
    {
        // Hub A only has 100 in stock. We request 150 items.
        $response = $this->actingAs($this->cashierA, 'sanctum')->postJson('/api/pos/sync', [
            'orders' => [
                [
                    'offline_id' => 'OFFLINE-OVERDRAFT-001',
                    'total_amount' => 4500.00,
                    'payment_method' => 'cash',
                    'channel' => 'walk_in',
                    'items' => [
                        [
                            'product_id' => $this->product->id,
                            'quantity' => 150,
                            'price' => 30.00,
                        ],
                    ],
                ],
            ],
        ]);

        $response->assertStatus(200);

        // Verify anomaly was recorded
        $this->assertDatabaseHas('pos_sync_anomalies', [
            'hub_id' => $this->hubA->id,
            'offline_order_id' => 'OFFLINE-OVERDRAFT-001',
            'product_id' => $this->product->id,
            'requested_quantity' => 150,
            'available_quantity' => 100,
            'status' => 'pending',
        ]);
    }

    /**
     * Test intra-hub idempotency: duplicate submission from same hub is ignored without creating duplicate orders.
     */
    public function test_intra_hub_idempotency_duplicate_submission_ignored()
    {
        $payload = [
            'orders' => [
                [
                    'offline_id' => 'OFFLINE-INTRA-001',
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
        ];

        // First sync
        $res1 = $this->actingAs($this->cashierA, 'sanctum')->postJson('/api/pos/sync', $payload);
        $res1->assertStatus(200);

        // Second sync with identical offline ID
        $res2 = $this->actingAs($this->cashierA, 'sanctum')->postJson('/api/pos/sync', $payload);
        $res2->assertStatus(200);

        // Only 1 order should exist for Hub A
        $this->assertEquals(1, Order::where('hub_id', $this->hubA->id)->where('idempotency_key', 'OFFLINE-INTRA-001')->count());
    }

    /**
     * Requirement 2:
     * Test cross-hub idempotency collision: If Hub A and Hub B submit the same offline transaction ID,
     * verify both are accepted into their respective hubs because idempotency is scoped by hub_id.
     */
    public function test_cross_hub_idempotency_collision_both_accepted()
    {
        $offlineId = 'OFFLINE-SHARED-KEY-999';

        // Hub A syncs offline transaction ID
        $responseA = $this->actingAs($this->cashierA, 'sanctum')->postJson('/api/pos/sync', [
            'orders' => [
                [
                    'offline_id' => $offlineId,
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
        $responseA->assertStatus(200);

        // Hub B syncs same offline transaction ID
        $responseB = $this->actingAs($this->cashierB, 'sanctum')->postJson('/api/pos/sync', [
            'orders' => [
                [
                    'offline_id' => $offlineId,
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
        if ($responseB->status() !== 200) {
            fwrite(STDERR, "\nResponse B Error: ".$responseB->getContent()."\n");
        }
        $responseB->assertStatus(200);

        // Both orders should exist in the database, one for Hub A and one for Hub B
        $orders = Order::where('idempotency_key', $offlineId)->get();
        $this->assertCount(2, $orders);
        $this->assertTrue($orders->contains('hub_id', $this->hubA->id));
        $this->assertTrue($orders->contains('hub_id', $this->hubB->id));
    }

    /**
     * Requirement 3:
     * Test transactional rollback: Verify that if OrderFulfillmentService::fulfillOrder encounters an inventory failure or exception,
     * neither the order status nor any inventory batch/spoke records are partially committed.
     */
    public function test_order_fulfillment_transactional_rollback_on_failure()
    {
        // Create a wholesale product
        $wholesaleProduct = Product::create([
            'name' => 'Wholesale Pastil Bulk',
            'slug' => 'wholesale-pastil-jar-bulk',
            'description' => 'Bulk packs',
            'price' => 500.00,
            'category' => 'wholesale',
            'stock' => 10,
        ]);

        // Hub inventory before fulfillment
        $initialSpokeInventory = HubInventory::where('hub_id', $this->hubA->id)
            ->where('product_id', $this->product->id)
            ->value('stock_quantity') ?? 0;

        // Create an order in 'out_for_delivery' state
        $order = Order::create([
            'hub_id' => $this->hubA->id,
            'user_id' => $this->cashierA->id,
            'type' => 'wholesale',
            'channel' => 'walk_in',
            'status' => 'out_for_delivery',
            'total_amount' => 500.00,
            'payment_method' => 'cash',
            'shipping_address' => 'Stall',
            'contact_number' => 'N/A',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $wholesaleProduct->id,
            'quantity' => 5,
            'price' => 500.00,
        ]);

        // Note: No InventoryBatch exists for HQ commissary (hub_id null),
        // so InventoryBatchService::deductStockFIFO will fail and throw an Exception.
        $service = app(OrderFulfillmentService::class);

        $exceptionThrown = false;
        try {
            $service->fulfillOrder($order, 'delivered');
        } catch (\Exception $e) {
            $exceptionThrown = true;
        }

        $this->assertTrue($exceptionThrown, 'Expected fulfillment to throw exception due to missing commissary batch stock');

        // Verify order status is NOT partially committed to 'delivered'
        $order->refresh();
        $this->assertEquals('out_for_delivery', $order->status);

        // Verify spoke inventory was NOT incremented
        $spokeInventoryAfter = HubInventory::where('hub_id', $this->hubA->id)
            ->where('product_id', $this->product->id)
            ->value('stock_quantity') ?? 0;
        $this->assertEquals($initialSpokeInventory, $spokeInventoryAfter);

        // Sub-scenario: Multi-item order where item 1 has batch inventory, but item 2 fails.
        // Verify item 1 batch depletion is rolled back atomically!
        $wholesaleProduct2 = Product::create([
            'name' => 'Wholesale Chili Oil Bulk',
            'slug' => 'wholesale-chili-oil-bulk',
            'description' => 'Bulk chili oil',
            'price' => 300.00,
            'category' => 'wholesale',
            'stock' => 10,
        ]);

        // Create HQ commissary batch for wholesaleProduct (item 1)
        $batchItem1 = InventoryBatch::create([
            'batch_number' => 'BATCH-HQ-001',
            'product_id' => $wholesaleProduct->id,
            'hub_id' => null, // HQ commissary
            'quantity' => 10,
            'initial_quantity' => 10,
            'manufacture_date' => now()->subDay()->toDateString(),
            'expiry_date' => now()->addDays(30)->toDateString(),
        ]);

        // Multi-item order: item 1 (has stock), item 2 (has NO stock)
        $multiOrder = Order::create([
            'hub_id' => $this->hubA->id,
            'user_id' => $this->cashierA->id,
            'type' => 'wholesale',
            'channel' => 'walk_in',
            'status' => 'out_for_delivery',
            'total_amount' => 800.00,
            'payment_method' => 'cash',
            'shipping_address' => 'Stall',
            'contact_number' => 'N/A',
        ]);

        OrderItem::create([
            'order_id' => $multiOrder->id,
            'product_id' => $wholesaleProduct->id,
            'quantity' => 2,
            'price' => 500.00,
        ]);

        OrderItem::create([
            'order_id' => $multiOrder->id,
            'product_id' => $wholesaleProduct2->id,
            'quantity' => 5,
            'price' => 300.00,
        ]);

        $multiExceptionThrown = false;
        try {
            $service->fulfillOrder($multiOrder, 'delivered');
        } catch (\Exception $e) {
            $multiExceptionThrown = true;
        }

        $this->assertTrue($multiExceptionThrown);

        // Verify batch for item 1 was NOT depleted (must remain 10)
        $batchItem1->refresh();
        $this->assertEquals(10, $batchItem1->quantity, 'Item 1 batch was partially depleted despite exception on item 2!');

        // Verify order status remained out_for_delivery
        $multiOrder->refresh();
        $this->assertEquals('out_for_delivery', $multiOrder->status);
    }

    /**
     * Requirement 4:
     * Test soft deletes: Verify that deleting a Product or Hub does not execute hard SQL DELETE or cascade-delete order_items or expenses.
     * Verify withTrashed() retrieves the soft-deleted model.
     */
    public function test_soft_deletes_preserve_order_items_and_expenses()
    {
        $order = Order::create([
            'hub_id' => $this->hubA->id,
            'user_id' => $this->cashierA->id,
            'type' => 'pos',
            'channel' => 'walk_in',
            'status' => 'completed',
            'total_amount' => 150.00,
            'payment_method' => 'cash',
            'shipping_address' => 'Stall',
            'contact_number' => 'N/A',
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $this->product->id,
            'quantity' => 5,
            'price' => 30.00,
        ]);

        $expense = Expense::create([
            'hub_id' => $this->hubA->id,
            'category' => 'utilities',
            'amount' => 250.00,
            'date' => now()->toDateString(),
            'description' => 'Electricity bill',
        ]);

        // Soft delete the product
        $this->product->delete();

        // Soft delete the hub
        $this->hubA->delete();

        // 1. Verify product and hub are soft deleted, not hard deleted
        $this->assertNull(Product::find($this->product->id));
        $this->assertNotNull(Product::withTrashed()->find($this->product->id));
        $this->assertNotNull(Product::withTrashed()->find($this->product->id)->deleted_at);

        $this->assertNull(Hub::find($this->hubA->id));
        $this->assertNotNull(Hub::withTrashed()->find($this->hubA->id));
        $this->assertNotNull(Hub::withTrashed()->find($this->hubA->id)->deleted_at);

        // 2. Verify order_item was NOT cascade-deleted
        $this->assertDatabaseHas('order_items', [
            'id' => $orderItem->id,
            'product_id' => $this->product->id,
        ]);

        // 3. Verify expense was NOT cascade-deleted
        $this->assertDatabaseHas('expenses', [
            'id' => $expense->id,
            'hub_id' => $this->hubA->id,
        ]);
    }
}
