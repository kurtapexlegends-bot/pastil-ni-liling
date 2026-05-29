<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Hub;
use App\Models\Product;
use App\Models\Ingredient;
use App\Models\ProductIngredient;
use App\Models\InventoryBatch;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Expense;
use App\Models\WorkShift;
use App\Models\ComplianceAudit;
use App\Models\CommissaryOrder;
use App\Models\CommissaryOrderItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Fetch Existing Entities
        $admin = User::where('email', 'admin@pnl.com')->first();
        $franchisee = User::where('email', 'franchise@pnl.com')->first();
        $cashier = User::where('email', 'cashier@pnl.com')->first();
        $customer = User::where('email', 'customer@pnl.com')->first();
        
        $hub = Hub::where('franchisee_id', $franchisee->id)->first();
        if (!$hub) {
            $hub = Hub::create([
                'name' => 'Manila Spoke Hub',
                'franchisee_id' => $franchisee->id,
                'address' => '123 Taft Ave, Manila',
                'status' => 'active'
            ]);
        }

        // Fetch products by slug
        $pOriginal = Product::where('slug', 'original-chicken-pastil')->first();
        $pSpicy = Product::where('slug', 'spicy-chicken-pastil')->first();
        $pBeef = Product::where('slug', 'beef-pastil')->first();
        $pBagoongRegular = Product::where('slug', 'premium-shrimp-bagoong-regular')->first();
        $pBagoongSpicy = Product::where('slug', 'premium-shrimp-bagoong-spicy')->first();
        $pChiliOil = Product::where('slug', 'lilings-signature-chili-garlic-oil')->first();
        
        $pWholesalePastil = Product::where('slug', 'wholesale-pastil-jar-bulk')->first();
        $pWholesaleChili = Product::where('slug', 'wholesale-chili-oil-bulk')->first();

        // 2. Seed Raw Ingredients
        $ingChicken = Ingredient::updateOrCreate(
            ['name' => 'Chicken Breast'],
            ['unit' => 'kg', 'stock' => 85.00, 'min_stock' => 15.00, 'unit_cost' => 240.00]
        );
        $ingRice = Ingredient::updateOrCreate(
            ['name' => 'Premium Rice'],
            ['unit' => 'kg', 'stock' => 150.00, 'min_stock' => 25.00, 'unit_cost' => 55.00]
        );
        $ingBeef = Ingredient::updateOrCreate(
            ['name' => 'Beef Tenderloin'],
            ['unit' => 'kg', 'stock' => 60.00, 'min_stock' => 10.00, 'unit_cost' => 380.00]
        );
        $ingShrimp = Ingredient::updateOrCreate(
            ['name' => 'Shrimps'],
            ['unit' => 'kg', 'stock' => 45.00, 'min_stock' => 8.00, 'unit_cost' => 320.00]
        );
        $ingChili = Ingredient::updateOrCreate(
            ['name' => 'Chili Flakes'],
            ['unit' => 'kg', 'stock' => 25.00, 'min_stock' => 5.00, 'unit_cost' => 150.00]
        );
        $ingGarlic = Ingredient::updateOrCreate(
            ['name' => 'Garlic'],
            ['unit' => 'kg', 'stock' => 30.00, 'min_stock' => 5.00, 'unit_cost' => 120.00]
        );

        // 3. Seed Recipe Mappings
        ProductIngredient::updateOrCreate(
            ['product_id' => $pOriginal->id, 'ingredient_id' => $ingChicken->id],
            ['quantity_required' => 0.0500]
        );
        ProductIngredient::updateOrCreate(
            ['product_id' => $pOriginal->id, 'ingredient_id' => $ingRice->id],
            ['quantity_required' => 0.1000]
        );

        ProductIngredient::updateOrCreate(
            ['product_id' => $pSpicy->id, 'ingredient_id' => $ingChicken->id],
            ['quantity_required' => 0.0500]
        );
        ProductIngredient::updateOrCreate(
            ['product_id' => $pSpicy->id, 'ingredient_id' => $ingRice->id],
            ['quantity_required' => 0.1000]
        );
        ProductIngredient::updateOrCreate(
            ['product_id' => $pSpicy->id, 'ingredient_id' => $ingChili->id],
            ['quantity_required' => 0.0050]
        );

        ProductIngredient::updateOrCreate(
            ['product_id' => $pBeef->id, 'ingredient_id' => $ingBeef->id],
            ['quantity_required' => 0.0500]
        );
        ProductIngredient::updateOrCreate(
            ['product_id' => $pBeef->id, 'ingredient_id' => $ingRice->id],
            ['quantity_required' => 0.1000]
        );

        ProductIngredient::updateOrCreate(
            ['product_id' => $pBagoongRegular->id, 'ingredient_id' => $ingShrimp->id],
            ['quantity_required' => 0.1200]
        );
        ProductIngredient::updateOrCreate(
            ['product_id' => $pBagoongRegular->id, 'ingredient_id' => $ingGarlic->id],
            ['quantity_required' => 0.0100]
        );

        ProductIngredient::updateOrCreate(
            ['product_id' => $pBagoongSpicy->id, 'ingredient_id' => $ingShrimp->id],
            ['quantity_required' => 0.1200]
        );
        ProductIngredient::updateOrCreate(
            ['product_id' => $pBagoongSpicy->id, 'ingredient_id' => $ingGarlic->id],
            ['quantity_required' => 0.0100]
        );
        ProductIngredient::updateOrCreate(
            ['product_id' => $pBagoongSpicy->id, 'ingredient_id' => $ingChili->id],
            ['quantity_required' => 0.0100]
        );

        ProductIngredient::updateOrCreate(
            ['product_id' => $pChiliOil->id, 'ingredient_id' => $ingChili->id],
            ['quantity_required' => 0.1500]
        );
        ProductIngredient::updateOrCreate(
            ['product_id' => $pChiliOil->id, 'ingredient_id' => $ingGarlic->id],
            ['quantity_required' => 0.0500]
        );

        // 4. Seed Inventory Batches (Including expired batches for Food Waste tracking)
        InventoryBatch::create([
            'batch_number' => 'BATCH-OCP-01',
            'product_id' => $pOriginal->id,
            'hub_id' => null,
            'quantity' => 60,
            'initial_quantity' => 100,
            'manufacture_date' => Carbon::now()->subDays(10),
            'expiry_date' => Carbon::now()->addDays(4),
            'discount_triggered' => false
        ]);
        
        InventoryBatch::create([
            'batch_number' => 'BATCH-BP-01',
            'product_id' => $pBeef->id,
            'hub_id' => null,
            'quantity' => 30,
            'initial_quantity' => 50,
            'manufacture_date' => Carbon::now()->subDays(5),
            'expiry_date' => Carbon::now()->addDays(9),
            'discount_triggered' => false
        ]);

        // Expired batch (wasted jars)
        InventoryBatch::create([
            'batch_number' => 'BATCH-SCP-EXPIRED',
            'product_id' => $pSpicy->id,
            'hub_id' => null,
            'quantity' => 20,
            'initial_quantity' => 80,
            'manufacture_date' => Carbon::now()->subDays(25),
            'expiry_date' => Carbon::now()->subDays(5),
            'discount_triggered' => false,
            'deleted_at' => Carbon::now()->subDays(5) // soft deleted as expired waste
        ]);

        // 5. Seed Historical Completed Shifts (Labor cost metrics)
        for ($i = 0; $i < 7; $i++) {
            $shiftDate = Carbon::now()->subDays($i);
            WorkShift::create([
                'user_id' => $cashier->id,
                'hub_id' => $hub->id,
                'clock_in' => $shiftDate->copy()->hour(9)->minute(0),
                'clock_out' => $shiftDate->copy()->hour(17)->minute(0),
                'hourly_rate' => 65.00, // 65 PHP/hr
                'status' => 'completed'
            ]);
        }

        // 6. Seed Operational Expenses
        Expense::create([
            'hub_id' => $hub->id,
            'category' => 'rent',
            'amount' => 12000.00,
            'date' => Carbon::now()->subDays(15),
            'description' => 'Monthly branch lease payment.'
        ]);
        Expense::create([
            'hub_id' => $hub->id,
            'category' => 'utilities',
            'amount' => 2350.00,
            'date' => Carbon::now()->subDays(3),
            'description' => 'Electric and water bills.'
        ]);
        Expense::create([
            'hub_id' => $hub->id,
            'category' => 'marketing',
            'amount' => 1500.00,
            'date' => Carbon::now()->subDays(5),
            'description' => 'Local Facebook promo boost.'
        ]);

        // 7. Seed Quality Compliance Audits (Metrics for scatter plots)
        ComplianceAudit::create([
            'hub_id' => $hub->id,
            'auditor_id' => $admin->id,
            'audit_date' => Carbon::now()->subDays(10),
            'hygiene_score' => 96,
            'recipe_adherence_score' => 98,
            'kitchen_photo_path' => '/photos/kitchen_taft.jpg',
            'notes' => 'Pristine kitchen. Handwashing guidelines strictly adhered to.',
            'status' => 'approved'
        ]);

        ComplianceAudit::create([
            'hub_id' => $hub->id,
            'auditor_id' => $admin->id,
            'audit_date' => Carbon::now()->subDays(3),
            'hygiene_score' => 92,
            'recipe_adherence_score' => 94,
            'kitchen_photo_path' => '/photos/kitchen_taft_2.jpg',
            'notes' => 'Minor ingredient storage clutter, resolved on site.',
            'status' => 'approved'
        ]);

        // 8. Seed Mathematically Consistent Orders for Sales Timeline
        $timelineSpecs = [
            0 => ['retail' => 3500, 'wholesale' => 5600, 'pos' => 4500],
            1 => ['retail' => 4100, 'wholesale' => 0, 'pos' => 5200],
            2 => ['retail' => 2800, 'wholesale' => 2800, 'pos' => 3800],
            3 => ['retail' => 3200, 'wholesale' => 0, 'pos' => 4100],
            4 => ['retail' => 5100, 'wholesale' => 5600, 'pos' => 6200],
            5 => ['retail' => 3800, 'wholesale' => 0, 'pos' => 4800],
            6 => ['retail' => 4400, 'wholesale' => 2800, 'pos' => 5500],
        ];

        foreach ($timelineSpecs as $dayAgo => $revenues) {
            $orderDate = Carbon::now()->subDays($dayAgo);

            // Seed Retail Order (B2C Checkout)
            if ($revenues['retail'] > 0) {
                $qtyOriginal = floor($revenues['retail'] * 0.4 / $pOriginal->price);
                $qtySpicy = floor($revenues['retail'] * 0.3 / $pSpicy->price);
                $qtyChili = floor($revenues['retail'] * 0.3 / $pChiliOil->price);
                
                $totalAmt = ($qtyOriginal * $pOriginal->price) + ($qtySpicy * $pSpicy->price) + ($qtyChili * $pChiliOil->price);

                $order = Order::create([
                    'user_id' => $customer->id, // customer reference
                    'hub_id' => $hub->id,
                    'type' => 'retail',
                    'channel' => 'e_commerce',
                    'total_amount' => $totalAmt,
                    'status' => 'delivered',
                    'shipping_address' => 'Customer Residential Residence, Manila',
                    'contact_number' => '09172345678',
                    'payment_method' => 'online_card',
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate
                ]);

                if ($qtyOriginal > 0) {
                    OrderItem::create([
                        'order_id' => $order->id, 'product_id' => $pOriginal->id, 'quantity' => $qtyOriginal, 'price' => $pOriginal->price
                    ]);
                }
                if ($qtySpicy > 0) {
                    OrderItem::create([
                        'order_id' => $order->id, 'product_id' => $pSpicy->id, 'quantity' => $qtySpicy, 'price' => $pSpicy->price
                    ]);
                }
                if ($qtyChili > 0) {
                    OrderItem::create([
                        'order_id' => $order->id, 'product_id' => $pChiliOil->id, 'quantity' => $qtyChili, 'price' => $pChiliOil->price
                    ]);
                }
            }

            // Seed Wholesale Order (B2B Procurement)
            if ($revenues['wholesale'] > 0) {
                $qtyPBulk = floor($revenues['wholesale'] / $pWholesalePastil->wholesale_price);
                $totalAmt = $qtyPBulk * $pWholesalePastil->wholesale_price;

                $order = Order::create([
                    'user_id' => $franchisee->id,
                    'hub_id' => $hub->id,
                    'type' => 'wholesale',
                    'channel' => 'e_commerce',
                    'total_amount' => $totalAmt,
                    'status' => 'delivered',
                    'shipping_address' => '123 Taft Ave, Manila',
                    'contact_number' => '09156789123',
                    'payment_method' => 'cod',
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate
                ]);

                OrderItem::create([
                    'order_id' => $order->id, 'product_id' => $pWholesalePastil->id, 'quantity' => $qtyPBulk, 'price' => $pWholesalePastil->wholesale_price
                ]);
            }

            // Seed POS walk-in transaction
            if ($revenues['pos'] > 0) {
                $qtyOriginal = floor($revenues['pos'] * 0.5 / $pOriginal->price);
                $qtyBeef = floor($revenues['pos'] * 0.5 / $pBeef->price);
                $totalAmt = ($qtyOriginal * $pOriginal->price) + ($qtyBeef * $pBeef->price);

                $order = Order::create([
                    'user_id' => null,
                    'hub_id' => $hub->id,
                    'cashier_id' => $cashier->id,
                    'type' => 'pos',
                    'channel' => 'walk_in',
                    'total_amount' => $totalAmt,
                    'status' => 'delivered',
                    'shipping_address' => 'Walk-in POS',
                    'contact_number' => 'N/A',
                    'payment_method' => 'cash',
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate
                ]);

                if ($qtyOriginal > 0) {
                    OrderItem::create([
                        'order_id' => $order->id, 'product_id' => $pOriginal->id, 'quantity' => $qtyOriginal, 'price' => $pOriginal->price
                    ]);
                }
                if ($qtyBeef > 0) {
                    OrderItem::create([
                        'order_id' => $order->id, 'product_id' => $pBeef->id, 'quantity' => $qtyBeef, 'price' => $pBeef->price
                    ]);
                }
            }
        }

        // 9. Seed Commissary Orders (B2B Procurement)
        $cOrder1 = CommissaryOrder::create([
            'idempotency_key' => 'seed-idempotency-commissary-1',
            'user_id' => $franchisee->id,
            'hub_id' => $hub->id,
            'total_amount' => 5600.00, // 2800.00 * 2
            'status' => 'delivered',
            'shipping_address' => '123 Taft Ave, Manila',
            'contact_number' => '09156789123',
            'payment_method' => 'cod',
            'notes' => 'Weekly branch restock of bulk pastil jars.',
            'created_at' => Carbon::now()->subDays(4),
            'updated_at' => Carbon::now()->subDays(4),
        ]);

        CommissaryOrderItem::create([
            'commissary_order_id' => $cOrder1->id,
            'product_id' => $pWholesalePastil->id,
            'quantity' => 2,
            'wholesale_price' => 2800.00,
            'subtotal' => 5600.00,
            'created_at' => Carbon::now()->subDays(4),
            'updated_at' => Carbon::now()->subDays(4),
        ]);

        $cOrder2 = CommissaryOrder::create([
            'idempotency_key' => 'seed-idempotency-commissary-2',
            'user_id' => $franchisee->id,
            'hub_id' => $hub->id,
            'total_amount' => 4200.00, // 1400.00 * 3
            'status' => 'preparing',
            'shipping_address' => '123 Taft Ave, Manila',
            'contact_number' => '09156789123',
            'payment_method' => 'cod',
            'notes' => 'Urgent replenishment of premium chili garlic oil jars.',
            'created_at' => Carbon::now()->subHours(2),
            'updated_at' => Carbon::now()->subHours(2),
        ]);

        CommissaryOrderItem::create([
            'commissary_order_id' => $cOrder2->id,
            'product_id' => $pWholesaleChili->id,
            'quantity' => 3,
            'wholesale_price' => 1400.00,
            'subtotal' => 4200.00,
            'created_at' => Carbon::now()->subHours(2),
            'updated_at' => Carbon::now()->subHours(2),
        ]);
    }
}
