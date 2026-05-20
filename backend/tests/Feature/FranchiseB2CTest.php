<?php

namespace Tests\Feature;

use App\Models\Hub;
use App\Models\HubInventory;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FranchiseB2CTest extends TestCase
{
    use RefreshDatabase;

    public function test_retail_order_requires_branch_selection()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $product = Product::create([
            'name' => 'Original Chicken Pastil',
            'slug' => 'original-chicken-pastil',
            'description' => 'Test Description',
            'price' => '25.00',
            'category' => 'pastil',
            'stock' => 100
        ]);

        $response = $this->postJson('/api/orders', [
            'type' => 'retail',
            'total_amount' => 25.00,
            'shipping_address' => 'Test Addr',
            'contact_number' => '09123456789',
            'payment_method' => 'cod',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                    'price' => 25.00
                ]
            ]
        ]);

        $response->assertStatus(500);
        $response->assertJson([
            'success' => false,
            'message' => 'Failed to place order.',
            'error' => 'Could not determine nearest branch hub with sufficient inventory. Please select branch manually.'
        ]);
    }

    public function test_retail_order_validates_branch_stock()
    {
        $user = User::factory()->create();
        $franchisee = User::factory()->create();
        
        Sanctum::actingAs($user);

        $hub = Hub::create([
            'franchisee_id' => $franchisee->id,
            'name' => 'Test Hub',
            'address' => 'Test Hub Addr',
            'status' => 'active'
        ]);

        $product = Product::create([
            'name' => 'Original Chicken Pastil',
            'slug' => 'original-chicken-pastil',
            'description' => 'Test Description',
            'price' => '25.00',
            'category' => 'pastil',
            'stock' => 100
        ]);

        // Place retail order when hub has 0 stock
        $response = $this->postJson('/api/orders', [
            'type' => 'retail',
            'hub_id' => $hub->id,
            'total_amount' => 25.00,
            'shipping_address' => 'Test Addr',
            'contact_number' => '09123456789',
            'payment_method' => 'cod',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                    'price' => 25.00
                ]
            ]
        ]);

        $response->assertStatus(500);
        $response->assertJsonFragment([
            'error' => 'Sorry, Original Chicken Pastil is out of stock at this branch. (Available: 0 units)'
        ]);
    }

    public function test_successful_retail_checkout_deducts_branch_stock()
    {
        $user = User::factory()->create();
        $franchisee = User::factory()->create();
        
        Sanctum::actingAs($user);

        $hub = Hub::create([
            'franchisee_id' => $franchisee->id,
            'name' => 'Test Hub',
            'address' => 'Test Hub Addr',
            'status' => 'active'
        ]);

        $product = Product::create([
            'name' => 'Original Chicken Pastil',
            'slug' => 'original-chicken-pastil',
            'description' => 'Test Description',
            'price' => '25.00',
            'category' => 'pastil',
            'stock' => 100
        ]);

        // Seed some stock to the branch
        HubInventory::create([
            'hub_id' => $hub->id,
            'product_id' => $product->id,
            'stock_quantity' => 10
        ]);

        \App\Models\InventoryBatch::create([
            'batch_number' => 'BATCH-TEST-CHECKOUT',
            'product_id' => $product->id,
            'hub_id' => $hub->id,
            'quantity' => 10,
            'initial_quantity' => 10,
            'manufacture_date' => now()->toDateString(),
            'expiry_date' => now()->addDays(30)->toDateString()
        ]);

        $response = $this->postJson('/api/orders', [
            'type' => 'retail',
            'hub_id' => $hub->id,
            'total_amount' => 50.00,
            'shipping_address' => 'Test Addr',
            'contact_number' => '09123456789',
            'payment_method' => 'cod',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                    'price' => 25.00
                ]
            ]
        ]);

        $response->assertStatus(201);
        $response->assertJsonFragment(['success' => true]);

        // Check stock decremented to 8
        $inventory = HubInventory::where('hub_id', $hub->id)
            ->where('product_id', $product->id)
            ->first();
            
        $this->assertEquals(8, $inventory->stock_quantity);
    }

    public function test_pos_sync_success_with_sufficient_stock()
    {
        $franchiseeRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Franchisee']);
        $franchisee = User::factory()->create();
        $franchisee->assignRole($franchiseeRole);
        Sanctum::actingAs($franchisee);

        $hub = Hub::create([
            'franchisee_id' => $franchisee->id,
            'name' => 'Franchise Branch',
            'address' => 'Avenue 1',
            'status' => 'active'
        ]);

        $product = Product::create([
            'name' => 'Kare-Kare Pastil',
            'slug' => 'kare-kare-pastil',
            'description' => 'Rich peanut sauce',
            'price' => '30.00',
            'category' => 'pastil',
            'stock' => 100
        ]);

        HubInventory::create([
            'hub_id' => $hub->id,
            'product_id' => $product->id,
            'stock_quantity' => 15
        ]);

        \App\Models\InventoryBatch::create([
            'batch_number' => 'BATCH-POS-SYNC-S',
            'product_id' => $product->id,
            'hub_id' => $hub->id,
            'quantity' => 15,
            'initial_quantity' => 15,
            'manufacture_date' => now()->toDateString(),
            'expiry_date' => now()->addDays(15)->toDateString()
        ]);

        $response = $this->postJson('/api/pos/sync', [
            'orders' => [
                [
                    'offline_id' => 'OFFLINE-S-100',
                    'total_amount' => 90.00,
                    'payment_method' => 'cash',
                    'channel' => 'walk_in',
                    'items' => [
                        [
                            'product_id' => $product->id,
                            'quantity' => 3,
                            'price' => 30.00
                        ]
                    ]
                ]
            ]
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment(['success' => true]);

        // Check stock decremented to 12
        $inventory = HubInventory::where('hub_id', $hub->id)
            ->where('product_id', $product->id)
            ->first();
        $this->assertEquals(12, $inventory->stock_quantity);

        // Check no anomalies recorded
        $this->assertDatabaseCount('pos_sync_anomalies', 0);
    }

    public function test_pos_sync_overdraft_creates_anomaly()
    {
        $franchiseeRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Franchisee']);
        $franchisee = User::factory()->create();
        $franchisee->assignRole($franchiseeRole);
        Sanctum::actingAs($franchisee);

        $hub = Hub::create([
            'franchisee_id' => $franchisee->id,
            'name' => 'Franchise Branch B',
            'address' => 'Avenue 2',
            'status' => 'active'
        ]);

        $product = Product::create([
            'name' => 'Adobo Pastil',
            'slug' => 'adobo-pastil',
            'description' => 'Soy vinegar flavor',
            'price' => '25.00',
            'category' => 'pastil',
            'stock' => 100
        ]);

        // Initialize with very low stock (1 available)
        HubInventory::create([
            'hub_id' => $hub->id,
            'product_id' => $product->id,
            'stock_quantity' => 1
        ]);

        \App\Models\InventoryBatch::create([
            'batch_number' => 'BATCH-POS-SYNC-O',
            'product_id' => $product->id,
            'hub_id' => $hub->id,
            'quantity' => 1,
            'initial_quantity' => 1,
            'manufacture_date' => now()->toDateString(),
            'expiry_date' => now()->addDays(15)->toDateString()
        ]);

        // Sync POS order of quantity 5 (exceeding stock of 1)
        $response = $this->postJson('/api/pos/sync', [
            'orders' => [
                [
                    'offline_id' => 'OFFLINE-OVERDRAFT-404',
                    'total_amount' => 125.00,
                    'payment_method' => 'cash',
                    'channel' => 'walk_in',
                    'items' => [
                        [
                            'product_id' => $product->id,
                            'quantity' => 5,
                            'price' => 25.00
                        ]
                    ]
                ]
            ]
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment(['success' => true]);

        // Check stock is allowed to go negative: 1 - 5 = -4
        $inventory = HubInventory::where('hub_id', $hub->id)
            ->where('product_id', $product->id)
            ->first();
        $this->assertEquals(-4, $inventory->stock_quantity);

        // Check one anomaly is successfully recorded
        $this->assertDatabaseHas('pos_sync_anomalies', [
            'hub_id' => $hub->id,
            'offline_order_id' => 'OFFLINE-OVERDRAFT-404',
            'product_id' => $product->id,
            'requested_quantity' => 5,
            'available_quantity' => 1,
            'status' => 'pending'
        ]);
    }
}
