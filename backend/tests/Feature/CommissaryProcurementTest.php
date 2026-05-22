<?php

namespace Tests\Feature;

use App\Models\Hub;
use App\Models\HubInventory;
use App\Models\Product;
use App\Models\User;
use App\Models\InventoryBatch;
use App\Models\CommissaryOrder;
use App\Models\CommissaryOrderItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CommissaryProcurementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $franchisee;
    protected User $customer;
    protected Hub $hub;
    protected Product $productWholesale;
    protected Product $productRetailOnly;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Create standard Spatie roles
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $franchiseeRole = Role::firstOrCreate(['name' => 'Franchisee']);

        // 2. Create users and assign roles
        $this->admin = User::factory()->create(['name' => 'HQ Admin Executive']);
        $this->admin->assignRole($adminRole);

        $this->franchisee = User::factory()->create(['name' => 'Franchise Partner']);
        $this->franchisee->assignRole($franchiseeRole);

        $this->customer = User::factory()->create(['name' => 'Standard Customer']);

        // 3. Create active branch hub for the franchisee
        $this->hub = Hub::create([
            'franchisee_id' => $this->franchisee->id,
            'name' => 'Quezon City Spoke Hub',
            'address' => 'Katipunan Avenue, Quezon City',
            'status' => 'active'
        ]);

        // 4. Create products
        $this->productWholesale = Product::create([
            'name' => 'Original Chicken Pastil (Wholesale)',
            'slug' => 'original-chicken-pastil-wholesale',
            'description' => 'Classic Chicken Pastil in B2B bulk',
            'price' => 25.00,
            'wholesale_price' => 18.00,
            'category' => 'pastil',
            'stock' => 100,
            'is_active' => true,
            'is_wholesale' => true
        ]);

        $this->productRetailOnly = Product::create([
            'name' => 'Spicy Beef Pastil (Retail Only)',
            'slug' => 'spicy-beef-pastil-retail-only',
            'description' => 'Retail only pack',
            'price' => 35.00,
            'category' => 'pastil',
            'stock' => 50,
            'is_active' => true,
            'is_wholesale' => false
        ]);
    }

    /** @test */
    public function test_franchisee_can_place_commissary_restock_order_successfully()
    {
        $this->withoutExceptionHandling();

        $response = $this->actingAs($this->franchisee, 'sanctum')->postJson('/api/franchise/commissary-orders', [
            'shipping_address' => 'Katipunan Ave Delivery Point',
            'contact_number' => '09171234567',
            'payment_method' => 'cod',
            'notes' => 'Deliver before 10 AM please.',
            'items' => [
                [
                    'product_id' => $this->productWholesale->id,
                    'quantity' => 10
                ]
            ]
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', 'Commissary restock order placed successfully!');

        $this->assertDatabaseHas('commissary_orders', [
            'user_id' => $this->franchisee->id,
            'hub_id' => $this->hub->id,
            'status' => 'pending',
            'total_amount' => 180.00, // 18.00 * 10
            'shipping_address' => 'Katipunan Ave Delivery Point',
            'contact_number' => '09171234567',
            'payment_method' => 'cod'
        ]);

        $this->assertDatabaseHas('commissary_order_items', [
            'product_id' => $this->productWholesale->id,
            'quantity' => 10,
            'wholesale_price' => 18.00,
            'subtotal' => 180.00
        ]);
    }

    /** @test */
    public function test_customer_cannot_place_commissary_restock_order()
    {
        $response = $this->actingAs($this->customer, 'sanctum')->postJson('/api/franchise/commissary-orders', [
            'shipping_address' => 'Customer Home Address',
            'contact_number' => '09170000000',
            'payment_method' => 'cod',
            'items' => [
                [
                    'product_id' => $this->productWholesale->id,
                    'quantity' => 5
                ]
            ]
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function test_retail_only_product_fails_wholesale_checkout()
    {
        $response = $this->actingAs($this->franchisee, 'sanctum')->postJson('/api/franchise/commissary-orders', [
            'shipping_address' => 'Katipunan Ave Delivery Point',
            'contact_number' => '09171234567',
            'payment_method' => 'cod',
            'items' => [
                [
                    'product_id' => $this->productRetailOnly->id,
                    'quantity' => 5
                ]
            ]
        ]);

        $response->assertStatus(500);
        $response->assertJsonPath('success', false);
        $response->assertJsonFragment([
            'message' => "Product 'Spicy Beef Pastil (Retail Only)' is not marked for wholesale B2B restock."
        ]);
    }

    /** @test */
    public function test_restock_order_incorporates_idempotency_protection()
    {
        $idempotencyKey = 'unique-restock-key-123456';

        // 1. First submission
        $response1 = $this->actingAs($this->franchisee, 'sanctum')
            ->withHeaders(['X-Idempotency-Key' => $idempotencyKey])
            ->postJson('/api/franchise/commissary-orders', [
                'shipping_address' => 'Katipunan Ave Delivery Point',
                'contact_number' => '09171234567',
                'payment_method' => 'cod',
                'items' => [
                    [
                        'product_id' => $this->productWholesale->id,
                        'quantity' => 5
                    ]
                ]
            ]);

        $response1->assertStatus(201);
        $orderId = $response1->json('data.id');

        // 2. Second submission with the same idempotency key
        $response2 = $this->actingAs($this->franchisee, 'sanctum')
            ->withHeaders(['X-Idempotency-Key' => $idempotencyKey])
            ->postJson('/api/franchise/commissary-orders', [
                'shipping_address' => 'Katipunan Ave Delivery Point',
                'contact_number' => '09171234567',
                'payment_method' => 'cod',
                'items' => [
                    [
                        'product_id' => $this->productWholesale->id,
                        'quantity' => 5
                    ]
                ]
            ]);

        $response2->assertStatus(200);
        $response2->assertJsonPath('success', true);
        $response2->assertJsonPath('message', 'Commissary restock order was already processed (Idempotency Check).');
        $response2->assertJsonPath('data.id', $orderId);

        // Ensure only 1 order exists in database
        $this->assertEquals(1, CommissaryOrder::where('idempotency_key', $idempotencyKey)->count());
    }

    /** @test */
    public function test_admin_can_transition_order_statuses_correctly_through_matrix()
    {
        // Place restock order
        $order = CommissaryOrder::create([
            'user_id' => $this->franchisee->id,
            'hub_id' => $this->hub->id,
            'total_amount' => 180.00,
            'status' => 'pending',
            'shipping_address' => 'QC Spoke Hub Address',
            'contact_number' => '09171234567',
            'payment_method' => 'cod'
        ]);

        CommissaryOrderItem::create([
            'commissary_order_id' => $order->id,
            'product_id' => $this->productWholesale->id,
            'quantity' => 10,
            'wholesale_price' => 18.00,
            'subtotal' => 180.00
        ]);

        // Create HQ batches to prevent delivery failure
        InventoryBatch::create([
            'batch_number' => 'HQ-BATCH-1',
            'product_id' => $this->productWholesale->id,
            'hub_id' => null,
            'quantity' => 20,
            'initial_quantity' => 20,
            'manufacture_date' => now()->toDateString(),
            'expiry_date' => now()->addDays(15)->toDateString()
        ]);

        // 1. Transition pending -> preparing (Allowed)
        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/commissary-orders/{$order->id}", ['status' => 'preparing']);
        $response->assertStatus(200);
        $response->assertJsonPath('data.status', 'preparing');

        // 2. Transition preparing -> out_for_delivery (Allowed)
        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/commissary-orders/{$order->id}", ['status' => 'out_for_delivery']);
        $response->assertStatus(200);
        $response->assertJsonPath('data.status', 'out_for_delivery');

        // 3. Transition out_for_delivery -> delivered (Allowed)
        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/commissary-orders/{$order->id}", ['status' => 'delivered']);
        $response->assertStatus(200);
        $response->assertJsonPath('data.status', 'delivered');
    }

    /** @test */
    public function test_admin_status_update_enforces_transition_matrix_and_rejects_invalid_jumps()
    {
        $order = CommissaryOrder::create([
            'user_id' => $this->franchisee->id,
            'hub_id' => $this->hub->id,
            'total_amount' => 180.00,
            'status' => 'pending',
            'shipping_address' => 'QC Spoke Hub Address',
            'contact_number' => '09171234567',
            'payment_method' => 'cod'
        ]);

        // Try transitioning directly from pending -> delivered (Forbidden in matrix)
        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/commissary-orders/{$order->id}", ['status' => 'delivered']);
        
        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
        $response->assertJsonFragment([
            'message' => "Illogical B2B order transition: Cannot transition from 'pending' directly to 'delivered'."
        ]);
    }

    /** @test */
    public function test_fifo_depletion_and_spoke_hub_batch_generation_on_delivery()
    {
        $this->withoutExceptionHandling();

        // 1. Create two unexpired batches at HQ (hub_id = null)
        $batch1 = InventoryBatch::create([
            'batch_number' => 'HQ-BATCH-A',
            'product_id' => $this->productWholesale->id,
            'hub_id' => null,
            'quantity' => 15,
            'initial_quantity' => 15,
            'manufacture_date' => now()->subDays(5)->toDateString(),
            'expiry_date' => now()->addDays(5)->toDateString() // Expires first
        ]);

        $batch2 = InventoryBatch::create([
            'batch_number' => 'HQ-BATCH-B',
            'product_id' => $this->productWholesale->id,
            'hub_id' => null,
            'quantity' => 30,
            'initial_quantity' => 30,
            'manufacture_date' => now()->subDays(2)->toDateString(),
            'expiry_date' => now()->addDays(10)->toDateString() // Expires second
        ]);

        // Total HQ stock: 45

        // 2. Place restock order of quantity 25
        $order = CommissaryOrder::create([
            'user_id' => $this->franchisee->id,
            'hub_id' => $this->hub->id,
            'total_amount' => 450.00,
            'status' => 'pending',
            'shipping_address' => 'QC Spoke Hub Address',
            'contact_number' => '09171234567',
            'payment_method' => 'cod'
        ]);

        CommissaryOrderItem::create([
            'commissary_order_id' => $order->id,
            'product_id' => $this->productWholesale->id,
            'quantity' => 25,
            'wholesale_price' => 18.00,
            'subtotal' => 450.00
        ]);

        // 3. Setup initial product stock
        $this->productWholesale->stock = 45;
        $this->productWholesale->save();

        // Ensure spoke hub starts with 0 stock
        $this->assertEquals(0, HubInventory::where('hub_id', $this->hub->id)->where('product_id', $this->productWholesale->id)->value('stock_quantity') ?? 0);

        // 4. Run the transition path to delivered
        $this->actingAs($this->admin, 'sanctum')->patchJson("/api/admin/commissary-orders/{$order->id}", ['status' => 'preparing']);
        $this->actingAs($this->admin, 'sanctum')->patchJson("/api/admin/commissary-orders/{$order->id}", ['status' => 'out_for_delivery']);
        
        // Deliver! This triggers the depletion and transfers
        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/commissary-orders/{$order->id}", ['status' => 'delivered']);
        
        $response->assertStatus(200);
        $response->assertJsonPath('data.status', 'delivered');

        // 5. Assert HQ batches are depleted using FIFO:
        // Batch 1 (expires in 5 days, qty 15) -> Should be depleted completely (qty = 0)
        // Batch 2 (expires in 10 days, qty 30) -> Should be partially depleted by 10 units (remaining qty = 20)
        $this->assertEquals(0, InventoryBatch::find($batch1->id)->quantity);
        $this->assertEquals(20, InventoryBatch::find($batch2->id)->quantity);

        // 6. Assert HQ Product global stock decremented from 45 to 20
        $this->assertEquals(20, Product::find($this->productWholesale->id)->stock);

        // 7. Assert Spoke Hub Inventory has been incremented by 25
        $inventory = HubInventory::where('hub_id', $this->hub->id)
            ->where('product_id', $this->productWholesale->id)
            ->first();
        
        $this->assertNotNull($inventory);
        $this->assertEquals(25, $inventory->stock_quantity);

        // 8. Assert new batches were created at Spoke Hub:
        // Spoke Batch 1 derived from HQ Batch 1: qty = 15, same manufacture & expiry
        // Spoke Batch 2 derived from HQ Batch 2: qty = 10, same manufacture & expiry
        $spokeBatches = InventoryBatch::where('product_id', $this->productWholesale->id)
            ->where('hub_id', $this->hub->id)
            ->orderBy('expiry_date', 'asc')
            ->get();

        $this->assertCount(2, $spokeBatches);

        $this->assertEquals(15, $spokeBatches[0]->quantity);
        $this->assertEquals($batch1->manufacture_date, $spokeBatches[0]->manufacture_date);
        $this->assertEquals($batch1->expiry_date, $spokeBatches[0]->expiry_date);
        $this->assertStringContainsString("B2B-H{$this->hub->id}-HQ-BATCH-A", $spokeBatches[0]->batch_number);

        $this->assertEquals(10, $spokeBatches[1]->quantity);
        $this->assertEquals($batch2->manufacture_date, $spokeBatches[1]->manufacture_date);
        $this->assertEquals($batch2->expiry_date, $spokeBatches[1]->expiry_date);
        $this->assertStringContainsString("B2B-H{$this->hub->id}-HQ-BATCH-B", $spokeBatches[1]->batch_number);
    }
}
