<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Hub;
use App\Models\Ingredient;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ChallengerM3StressTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $hqOps;

    protected User $franchisee;

    protected User $cashier;

    protected User $customer;

    protected Hub $hub;

    protected Product $product;

    protected Ingredient $ingredient;

    protected Order $order;

    protected Expense $expense;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Roles setup
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $hqOpsRole = Role::firstOrCreate(['name' => 'HQ operations']);
        $franchiseeRole = Role::firstOrCreate(['name' => 'Franchisee']);
        $cashierRole = Role::firstOrCreate(['name' => 'Branch Cashier']);
        $customerRole = Role::firstOrCreate(['name' => 'Customer']);

        // 2. Users setup
        $this->admin = User::factory()->create([
            'name' => 'HQ Admin Tester',
            'email' => 'admin.m3@test.com',
        ]);
        $this->admin->assignRole($adminRole);

        $this->hqOps = User::factory()->create([
            'name' => 'HQ Operations Tester',
            'email' => 'hqops.m3@test.com',
        ]);
        $this->hqOps->assignRole($hqOpsRole);

        $this->franchisee = User::factory()->create([
            'name' => 'Franchise Partner Tester',
            'email' => 'franchisee.m3@test.com',
        ]);
        $this->franchisee->assignRole($franchiseeRole);

        $this->cashier = User::factory()->create([
            'name' => 'Branch Cashier Tester',
            'email' => 'cashier.m3@test.com',
        ]);
        $this->cashier->assignRole($cashierRole);

        $this->customer = User::factory()->create([
            'name' => 'Customer Shopper',
            'email' => 'customer.m3@test.com',
        ]);
        $this->customer->assignRole($customerRole);

        // 3. Hub setup
        $this->hub = Hub::create([
            'franchisee_id' => $this->franchisee->id,
            'name' => 'Empirical Hub',
            'address' => '123 Challenger Street, Manila',
            'latitude' => 14.5995,
            'longitude' => 120.9842,
            'status' => 'active',
        ]);

        $this->cashier->update(['hub_id' => $this->hub->id]);

        // 4. Product setup
        $this->product = Product::create([
            'name' => 'Pastil Spicy Chicken',
            'slug' => 'pastil-spicy-chicken',
            'price' => 120.00,
            'category' => 'Rice Meals',
            'stock' => 50,
            'is_active' => true,
            'is_wholesale' => false,
        ]);

        // 5. Ingredient setup
        $this->ingredient = Ingredient::create([
            'name' => 'Shredded Chicken Breast',
            'unit' => 'kg',
            'stock' => 100.0,
            'min_stock' => 10.0,
            'unit_cost' => 220.00,
        ]);

        // 6. Order setup
        $this->order = Order::create([
            'user_id' => $this->admin->id,
            'hub_id' => $this->hub->id,
            'type' => 'retail',
            'payment_method' => 'cash',
            'payment_status' => 'pending',
            'status' => 'pending',
            'total_amount' => 120.00,
            'shipping_address' => 'Customer Address 1',
            'contact_number' => '09123456789',
        ]);

        // 7. Expense setup
        $this->expense = Expense::create([
            'hub_id' => $this->hub->id,
            'recorded_by' => $this->admin->id,
            'category' => 'utilities',
            'amount' => 1500.00,
            'date' => '2026-05-15',
            'description' => 'Initial electric bill',
        ]);
    }

    /**
     * Helper to assert standard 422 JSON validation error structure.
     */
    protected function assertValidationErrorContract($response, array $expectedErrorKeys = []): void
    {
        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonStructure([
                'success',
                'message',
                'errors',
            ]);

        $this->assertIsString($response->json('message'));
        $this->assertNotEmpty($response->json('message'));
        $this->assertIsArray($response->json('errors'));

        foreach ($expectedErrorKeys as $key) {
            $this->assertArrayHasKey($key, $response->json('errors'), "Expected errors to contain key: {$key}");
        }
    }

    // =========================================================================
    // 1. /api/admin/orders/{id} (UpdateOrderStatusRequest)
    // =========================================================================

    public function test_order_status_update_fails_with_missing_status(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/orders/{$this->order->id}", []);

        $this->assertValidationErrorContract($response, ['status']);
    }

    public function test_order_status_update_fails_with_invalid_status_enum(): void
    {
        $invalidStatuses = ['invalid_status', 'hacked', 'COMPLETED', "'; DROP TABLE orders; --"];

        foreach ($invalidStatuses as $status) {
            $response = $this->actingAs($this->admin, 'sanctum')
                ->patchJson("/api/admin/orders/{$this->order->id}", ['status' => $status]);

            $this->assertValidationErrorContract($response, ['status']);
        }
    }

    public function test_order_status_update_fails_with_invalid_type(): void
    {
        $invalidTypes = [12345, true, ['delivered'], ['status' => 'delivered']];

        foreach ($invalidTypes as $payload) {
            $response = $this->actingAs($this->admin, 'sanctum')
                ->patchJson("/api/admin/orders/{$this->order->id}", ['status' => $payload]);

            $this->assertValidationErrorContract($response, ['status']);
        }
    }

    // =========================================================================
    // 2. /api/admin/employees (StoreEmployeeRequest & UpdateEmployeeRequest)
    // =========================================================================

    public function test_employee_store_fails_with_empty_payload(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/employees', []);

        $this->assertValidationErrorContract($response, ['name', 'email', 'password', 'role']);
    }

    public function test_employee_store_fails_with_malformed_email(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/employees', [
                'name' => 'Test Employee',
                'email' => 'not-an-email-address',
                'password' => 'password123',
                'role' => 'Branch Cashier',
            ]);

        $this->assertValidationErrorContract($response, ['email']);
    }

    public function test_employee_store_fails_with_short_password(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/employees', [
                'name' => 'Test Employee',
                'email' => 'valid.email@test.com',
                'password' => '123', // less than 8 chars
                'role' => 'Branch Cashier',
            ]);

        $this->assertValidationErrorContract($response, ['password']);
    }

    public function test_employee_store_fails_with_invalid_role(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/employees', [
                'name' => 'Test Employee',
                'email' => 'valid.email@test.com',
                'password' => 'password123',
                'role' => 'SuperHackerRole',
            ]);

        $this->assertValidationErrorContract($response, ['role']);
    }

    public function test_employee_store_fails_with_nonexistent_hub(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/employees', [
                'name' => 'Test Employee',
                'email' => 'valid.email@test.com',
                'password' => 'password123',
                'role' => 'Branch Cashier',
                'hub_id' => 999999,
            ]);

        $this->assertValidationErrorContract($response, ['hub_id']);
    }

    public function test_employee_store_fails_with_duplicate_email(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/employees', [
                'name' => 'Duplicate Admin',
                'email' => $this->admin->email,
                'password' => 'password123',
                'role' => 'Admin',
            ]);

        $this->assertValidationErrorContract($response, ['email']);
    }

    public function test_employee_update_fails_with_invalid_email_and_role(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/admin/employees/{$this->cashier->id}", [
                'email' => 'invalid-email-format',
                'role' => 'InvalidRole',
                'hub_id' => 999999,
            ]);

        $this->assertValidationErrorContract($response, ['email', 'role', 'hub_id']);
    }

    public function test_employee_update_fails_when_stealing_another_users_email(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/admin/employees/{$this->cashier->id}", [
                'email' => $this->admin->email, // Already used by admin
            ]);

        $this->assertValidationErrorContract($response, ['email']);
    }

    // =========================================================================
    // 3. /api/admin/hubs (StoreHubRequest & UpdateHubRequest)
    // =========================================================================

    public function test_hub_store_fails_with_empty_payload(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/hubs', []);

        $this->assertValidationErrorContract($response, ['franchisee_id', 'name', 'address', 'status']);
    }

    public function test_hub_store_fails_with_nonexistent_franchisee(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/hubs', [
                'franchisee_id' => 999999,
                'name' => 'New Hub',
                'address' => 'Some Street',
                'status' => 'active',
            ]);

        $this->assertValidationErrorContract($response, ['franchisee_id']);
    }

    public function test_hub_store_fails_with_invalid_status(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/hubs', [
                'franchisee_id' => $this->franchisee->id,
                'name' => 'New Hub',
                'address' => 'Some Street',
                'status' => 'pending_approval', // only active, inactive
            ]);

        $this->assertValidationErrorContract($response, ['status']);
    }

    public function test_hub_store_fails_with_out_of_range_coordinates(): void
    {
        // Latitude must be between -90 and 90, Longitude between -180 and 180
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/hubs', [
                'franchisee_id' => $this->franchisee->id,
                'name' => 'New Hub',
                'address' => 'Some Street',
                'status' => 'active',
                'latitude' => 90.00001,
                'longitude' => -180.00001,
            ]);

        $this->assertValidationErrorContract($response, ['latitude', 'longitude']);
    }

    public function test_hub_update_fails_with_invalid_types(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/admin/hubs/{$this->hub->id}", [
                'name' => ['invalid_array_type'],
                'status' => 'destroyed',
                'latitude' => 'not-a-number',
            ]);

        $this->assertValidationErrorContract($response, ['name', 'status', 'latitude']);
    }

    // =========================================================================
    // 4. /api/admin/inventory/batches (StoreInventoryBatchRequest)
    // =========================================================================

    public function test_inventory_batch_store_fails_with_empty_payload(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/inventory/batches', []);

        $this->assertValidationErrorContract($response, [
            'batch_number',
            'product_id',
            'initial_quantity',
            'manufacture_date',
            'expiry_date',
        ]);
    }

    public function test_inventory_batch_store_fails_with_nonexistent_foreign_keys(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/inventory/batches', [
                'batch_number' => 'BATCH-TEST-001',
                'product_id' => 999999,
                'hub_id' => 999999,
                'initial_quantity' => 10,
                'manufacture_date' => '2026-05-01',
                'expiry_date' => '2026-06-01',
            ]);

        $this->assertValidationErrorContract($response, ['product_id', 'hub_id']);
    }

    public function test_inventory_batch_store_fails_with_zero_or_negative_quantity(): void
    {
        $quantities = [0, -1, -50];

        foreach ($quantities as $qty) {
            $response = $this->actingAs($this->admin, 'sanctum')
                ->postJson('/api/admin/inventory/batches', [
                    'batch_number' => "BATCH-QTY-{$qty}",
                    'product_id' => $this->product->id,
                    'initial_quantity' => $qty,
                    'manufacture_date' => '2026-05-01',
                    'expiry_date' => '2026-06-01',
                ]);

            $this->assertValidationErrorContract($response, ['initial_quantity']);
        }
    }

    public function test_inventory_batch_store_fails_with_decimal_quantity(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/inventory/batches', [
                'batch_number' => 'BATCH-DECIMAL-QTY',
                'product_id' => $this->product->id,
                'initial_quantity' => 12.5, // Integer rule
                'manufacture_date' => '2026-05-01',
                'expiry_date' => '2026-06-01',
            ]);

        $this->assertValidationErrorContract($response, ['initial_quantity']);
    }

    public function test_inventory_batch_store_fails_when_expiry_precedes_manufacture_date(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/inventory/batches', [
                'batch_number' => 'BATCH-INVERTED-DATES',
                'product_id' => $this->product->id,
                'initial_quantity' => 20,
                'manufacture_date' => '2026-06-01',
                'expiry_date' => '2026-05-01', // Before manufacture_date
            ]);

        $this->assertValidationErrorContract($response, ['expiry_date']);
    }

    // =========================================================================
    // 5. /api/admin/products (StoreProductRequest & UpdateProductRequest)
    // =========================================================================

    public function test_product_store_fails_with_empty_payload(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/products', []);

        $this->assertValidationErrorContract($response, [
            'name',
            'price',
            'category',
            'stock',
            'is_active',
            'is_wholesale',
        ]);
    }

    public function test_product_store_fails_with_negative_price_and_stock(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/products', [
                'name' => 'Negative Price Product',
                'price' => -99.99,
                'category' => 'Rice Meals',
                'stock' => -10,
                'is_active' => true,
                'is_wholesale' => false,
            ]);

        $this->assertValidationErrorContract($response, ['price', 'stock']);
    }

    public function test_product_store_fails_with_non_boolean_flags(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/products', [
                'name' => 'Non Boolean Product',
                'price' => 50.00,
                'category' => 'Rice Meals',
                'stock' => 10,
                'is_active' => 'not-a-boolean',
                'is_wholesale' => ['array_value'],
            ]);

        $this->assertValidationErrorContract($response, ['is_active', 'is_wholesale']);
    }

    public function test_product_store_fails_with_negative_wholesale_price(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/products', [
                'name' => 'Wholesale Product',
                'price' => 100.00,
                'category' => 'Rice Meals',
                'stock' => 10,
                'is_active' => true,
                'is_wholesale' => true,
                'wholesale_price' => -15.50,
            ]);

        $this->assertValidationErrorContract($response, ['wholesale_price']);
    }

    public function test_product_update_fails_with_negative_price(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/admin/products/{$this->product->id}", [
                'price' => -500.00,
            ]);

        $this->assertValidationErrorContract($response, ['price']);
    }

    // =========================================================================
    // 6. /api/admin/website-settings (UpdateWebsiteSettingsRequest)
    // =========================================================================

    public function test_website_settings_update_fails_with_empty_payload(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson('/api/admin/website-settings', []);

        $this->assertValidationErrorContract($response, ['settings']);
    }

    public function test_website_settings_update_fails_with_non_array_settings(): void
    {
        $invalidSettings = [
            'string_value',
            12345,
            true,
            null,
        ];

        foreach ($invalidSettings as $invalid) {
            $response = $this->actingAs($this->admin, 'sanctum')
                ->putJson('/api/admin/website-settings', ['settings' => $invalid]);

            $this->assertValidationErrorContract($response, ['settings']);
        }
    }

    // =========================================================================
    // 7. /api/franchise/commissary-orders (StoreCommissaryOrderRequest)
    // =========================================================================

    public function test_commissary_order_store_fails_with_empty_payload(): void
    {
        $response = $this->actingAs($this->franchisee, 'sanctum')
            ->postJson('/api/franchise/commissary-orders', []);

        $this->assertValidationErrorContract($response, [
            'shipping_address',
            'contact_number',
            'payment_method',
            'items',
        ]);
    }

    public function test_commissary_order_store_fails_with_invalid_payment_method(): void
    {
        $response = $this->actingAs($this->franchisee, 'sanctum')
            ->postJson('/api/franchise/commissary-orders', [
                'shipping_address' => 'Branch Diliman',
                'contact_number' => '09123456789',
                'payment_method' => 'bitcoin_crypto', // only gcash,paymaya,cod
                'items' => [
                    ['product_id' => $this->product->id, 'quantity' => 10],
                ],
            ]);

        $this->assertValidationErrorContract($response, ['payment_method']);
    }

    public function test_commissary_order_store_fails_with_empty_items_or_non_array(): void
    {
        $response = $this->actingAs($this->franchisee, 'sanctum')
            ->postJson('/api/franchise/commissary-orders', [
                'shipping_address' => 'Branch Diliman',
                'contact_number' => '09123456789',
                'payment_method' => 'gcash',
                'items' => 'string_items_not_array',
            ]);

        $this->assertValidationErrorContract($response, ['items']);
    }

    public function test_commissary_order_store_fails_with_invalid_nested_item_fields(): void
    {
        // 1. Non-existent product_id
        $response = $this->actingAs($this->franchisee, 'sanctum')
            ->postJson('/api/franchise/commissary-orders', [
                'shipping_address' => 'Branch Diliman',
                'contact_number' => '09123456789',
                'payment_method' => 'gcash',
                'items' => [
                    ['product_id' => 999999, 'quantity' => 5],
                ],
            ]);

        $this->assertValidationErrorContract($response, ['items.0.product_id']);

        // 2. Zero quantity
        $response = $this->actingAs($this->franchisee, 'sanctum')
            ->postJson('/api/franchise/commissary-orders', [
                'shipping_address' => 'Branch Diliman',
                'contact_number' => '09123456789',
                'payment_method' => 'gcash',
                'items' => [
                    ['product_id' => $this->product->id, 'quantity' => 0],
                ],
            ]);

        $this->assertValidationErrorContract($response, ['items.0.quantity']);

        // 3. Negative quantity
        $response = $this->actingAs($this->franchisee, 'sanctum')
            ->postJson('/api/franchise/commissary-orders', [
                'shipping_address' => 'Branch Diliman',
                'contact_number' => '09123456789',
                'payment_method' => 'gcash',
                'items' => [
                    ['product_id' => $this->product->id, 'quantity' => -5],
                ],
            ]);

        $this->assertValidationErrorContract($response, ['items.0.quantity']);
    }

    // =========================================================================
    // 8. /api/expenses (StoreExpenseRequest & UpdateExpenseRequest)
    // =========================================================================

    public function test_expense_store_fails_with_empty_payload(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/expenses', []);

        $this->assertValidationErrorContract($response, ['category', 'amount', 'date']);
    }

    public function test_expense_store_fails_with_zero_or_negative_amount(): void
    {
        $amounts = [0, 0.00, -10.50, -500];

        foreach ($amounts as $amt) {
            $response = $this->actingAs($this->admin, 'sanctum')
                ->postJson('/api/expenses', [
                    'category' => 'utilities',
                    'amount' => $amt,
                    'date' => '2026-05-15',
                ]);

            $this->assertValidationErrorContract($response, ['amount']);
        }
    }

    public function test_expense_store_fails_with_non_numeric_amount(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/expenses', [
                'category' => 'utilities',
                'amount' => 'one_thousand_pesos',
                'date' => '2026-05-15',
            ]);

        $this->assertValidationErrorContract($response, ['amount']);
    }

    public function test_expense_store_fails_with_invalid_date_format(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/expenses', [
                'category' => 'utilities',
                'amount' => 500.00,
                'date' => 'not-a-valid-date-string',
            ]);

        $this->assertValidationErrorContract($response, ['date']);
    }

    public function test_expense_store_fails_with_nonexistent_hub_id(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/expenses', [
                'hub_id' => 999999,
                'category' => 'utilities',
                'amount' => 500.00,
                'date' => '2026-05-15',
            ]);

        $this->assertValidationErrorContract($response, ['hub_id']);
    }

    public function test_expense_store_fails_with_description_exceeding_max_characters(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/expenses', [
                'category' => 'utilities',
                'amount' => 500.00,
                'date' => '2026-05-15',
                'description' => str_repeat('A', 1001), // Max is 1000
            ]);

        $this->assertValidationErrorContract($response, ['description']);
    }

    public function test_expense_update_fails_with_zero_or_negative_amount(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/expenses/{$this->expense->id}", [
                'amount' => -200.00,
            ]);

        $this->assertValidationErrorContract($response, ['amount']);
    }

    // =========================================================================
    // 9. Additional Form Requests: Ingredients, Restock, Recipes, Applications
    // =========================================================================

    public function test_ingredient_store_fails_with_empty_payload(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/inventory/ingredients', []);

        $this->assertValidationErrorContract($response, ['name', 'unit', 'stock', 'min_stock']);
    }

    public function test_ingredient_store_fails_with_duplicate_name(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/inventory/ingredients', [
                'name' => $this->ingredient->name,
                'unit' => 'kg',
                'stock' => 10,
                'min_stock' => 5,
            ]);

        $this->assertValidationErrorContract($response, ['name']);
    }

    public function test_ingredient_restock_fails_with_zero_or_negative_quantity(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/admin/inventory/ingredients/{$this->ingredient->id}/restock", [
                'quantity' => 0,
            ]);

        $this->assertValidationErrorContract($response, ['quantity']);
    }

    public function test_recipe_store_fails_with_nonexistent_ids(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/inventory/recipes', [
                'product_id' => 999999,
                'ingredient_id' => 999999,
                'quantity_required' => 0,
            ]);

        $this->assertValidationErrorContract($response, ['product_id', 'ingredient_id', 'quantity_required']);
    }

    public function test_franchise_application_status_update_fails_with_invalid_status(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson('/api/admin/applications/1', [
                'status' => 'invalid_status_value',
            ]);

        $this->assertValidationErrorContract($response, ['status']);
    }

    public function test_product_image_upload_fails_with_non_image_file(): void
    {
        $fakePdf = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/products/upload-image', [
                'image' => $fakePdf,
            ]);

        $this->assertValidationErrorContract($response, ['image']);
    }

    // =========================================================================
    // 10. HTTP Header & Authentication Precedence Stress Tests
    // =========================================================================

    public function test_validation_failure_returns_422_json_even_with_html_accept_header(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->post('/api/expenses', [], ['Accept' => 'text/html']);

        $response->assertStatus(422)
            ->assertHeader('Content-Type', 'application/json')
            ->assertJsonPath('success', false)
            ->assertJsonStructure([
                'success',
                'message',
                'errors',
            ]);
    }

    public function test_unauthenticated_request_fails_with_401_json_contract(): void
    {
        $response = $this->postJson('/api/admin/employees', []);

        $response->assertStatus(401)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Unauthenticated.');
    }

    public function test_unauthorized_role_is_rejected_with_403_before_validation(): void
    {
        $response = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/admin/employees', [
                'name' => 'Intruder',
            ]);

        $response->assertStatus(403);
    }
}
