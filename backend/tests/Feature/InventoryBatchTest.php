<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\Ingredient;
use App\Models\ProductIngredient;
use App\Models\InventoryBatch;
use App\Services\InventoryBatchService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class InventoryBatchTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Product $product;
    protected InventoryBatchService $batchService;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Create Roles & Admin User
        Role::create(['name' => 'Admin']);
        $this->admin = User::factory()->create([
            'email' => 'admin@pastilnililing.com',
            'password' => bcrypt('password')
        ]);
        $this->admin->assignRole('Admin');

        // 2. Create a Product
        $this->product = Product::create([
            'name' => 'Original Chicken Pastil',
            'slug' => 'original-chicken-pastil',
            'description' => 'Classic Chicken Pastil',
            'price' => 25.00,
            'category' => 'pastil',
            'stock' => 0,
            'is_active' => true,
            'is_wholesale' => false
        ]);

        $this->batchService = new InventoryBatchService();
    }

    /** @test */
    public function test_it_records_new_batch_and_depletes_hq_commissary_ingredients()
    {
        // 1. Seed HQ Ingredients
        $chicken = Ingredient::create([
            'name' => 'Chicken Breast',
            'unit' => 'kg',
            'stock' => 50.00, // 50kg
            'min_stock' => 5.00
        ]);

        $rice = Ingredient::create([
            'name' => 'Premium Rice',
            'unit' => 'kg',
            'stock' => 100.00,
            'min_stock' => 10.00
        ]);

        // 2. Establish Recipe (0.1kg chicken and 0.2kg rice per jar of pastil)
        ProductIngredient::create([
            'product_id' => $this->product->id,
            'ingredient_id' => $chicken->id,
            'quantity_required' => 0.1000
        ]);

        ProductIngredient::create([
            'product_id' => $this->product->id,
            'ingredient_id' => $rice->id,
            'quantity_required' => 0.2000
        ]);

        // 3. Post manufacturing batch request to API
        $token = $this->admin->createToken('auth_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}"
        ])->postJson('/api/admin/inventory/batches', [
            'batch_number' => 'BATCH-2026-0517-A',
            'product_id' => $this->product->id,
            'initial_quantity' => 100, // Make 100 pastil units
            'manufacture_date' => now()->toDateString(),
            'expiry_date' => now()->addDays(14)->toDateString()
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);

        // 4. Assert HQ Ingredients are depleted correctly
        // Chicken remaining: 50kg - (0.1kg * 100) = 40kg
        // Rice remaining: 100kg - (0.2kg * 100) = 80kg
        $this->assertEquals(40.00, Ingredient::find($chicken->id)->stock);
        $this->assertEquals(80.00, Ingredient::find($rice->id)->stock);

        // Assert Batch is stored correctly and product stock increased at HQ
        $this->assertDatabaseHas('inventory_batches', [
            'batch_number' => 'BATCH-2026-0517-A',
            'quantity' => 100
        ]);
        $this->assertEquals(100, Product::find($this->product->id)->stock);
    }

    /** @test */
    public function test_it_fails_manufacturing_batch_if_ingredients_are_insufficient()
    {
        // Chicken stock is only 5kg
        $chicken = Ingredient::create([
            'name' => 'Chicken Breast',
            'unit' => 'kg',
            'stock' => 5.00,
            'min_stock' => 5.00
        ]);

        ProductIngredient::create([
            'product_id' => $this->product->id,
            'ingredient_id' => $chicken->id,
            'quantity_required' => 0.1000 // 100 units will require 10kg
        ]);

        $token = $this->admin->createToken('auth_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}"
        ])->postJson('/api/admin/inventory/batches', [
            'batch_number' => 'BATCH-FAILED',
            'product_id' => $this->product->id,
            'initial_quantity' => 100, // Requires 10kg, only 5kg available
            'manufacture_date' => now()->toDateString(),
            'expiry_date' => now()->addDays(14)->toDateString()
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
        $response->assertJsonFragment([
            'message' => 'Insufficient raw ingredient stock: Chicken Breast. Required: 10kg, Available: 5kg'
        ]);
    }

    /** @test */
    public function test_it_correctly_deducts_stock_in_fifo_order_by_earliest_expiry()
    {
        // Create two batches
        // Batch A expires in 5 days
        $batchA = InventoryBatch::create([
            'batch_number' => 'BATCH-EXPIRE-5D',
            'product_id' => $this->product->id,
            'hub_id' => null,
            'quantity' => 40,
            'initial_quantity' => 40,
            'manufacture_date' => now()->toDateString(),
            'expiry_date' => now()->addDays(5)->toDateString()
        ]);

        // Batch B expires in 10 days
        $batchB = InventoryBatch::create([
            'batch_number' => 'BATCH-EXPIRE-10D',
            'product_id' => $this->product->id,
            'hub_id' => null,
            'quantity' => 50,
            'initial_quantity' => 50,
            'manufacture_date' => now()->toDateString(),
            'expiry_date' => now()->addDays(10)->toDateString()
        ]);

        // Deduct 50 units (should empty Batch A [40 units] and take 10 units from Batch B)
        $this->batchService->deductStockFIFO($this->product->id, null, 50);

        $this->assertEquals(0, InventoryBatch::find($batchA->id)->quantity);
        $this->assertEquals(40, InventoryBatch::find($batchB->id)->quantity);
    }

    /** @test */
    public function test_it_triggers_markdowns_for_close_to_expiry_batches()
    {
        // Create batch expiring in 2 days (within 3-day discount window)
        $closeBatch = InventoryBatch::create([
            'batch_number' => 'BATCH-EXPIRE-2D',
            'product_id' => $this->product->id,
            'hub_id' => null,
            'quantity' => 10,
            'initial_quantity' => 10,
            'manufacture_date' => now()->toDateString(),
            'expiry_date' => now()->addDays(2)->toDateString(),
            'discount_triggered' => false
        ]);

        // Trigger discounts
        $token = $this->admin->createToken('auth_token')->plainTextToken;
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}"
        ])->postJson('/api/admin/inventory/batches/markdown');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.discounted_count', 1);

        $this->assertTrue(InventoryBatch::find($closeBatch->id)->discount_triggered);
        
        // Price should be dynamically discounted: 25.00 * 0.70 = 17.50
        $activePrice = $this->batchService->getActiveProductPrice($this->product, null, false);
        $this->assertEquals(17.50, $activePrice);
    }
}
