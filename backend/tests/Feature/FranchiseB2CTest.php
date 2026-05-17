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
            'error' => 'Please select a branch to fulfill your order.'
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
}
