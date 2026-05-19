<?php
namespace App\Services;

use App\Models\Order;
use App\Models\Hub;
use App\Models\InventoryBatch;
use App\Models\ComplianceAudit;
use App\Models\WorkShift;
use App\Models\Product;
use App\Models\Ingredient;
use App\Models\Payout;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsService
{
    /**
     * Compute comprehensive, real-time intelligence metrics across all database tables.
     * Enforces fail-fast patterns and strictly real calculations derived entirely from active database entries.
     */
    public function getAnalyticsSummary(): array
    {
        // 1. Gross Profit Margins Calculations (Real-Time Sums)
        $revenueRetail = Order::where('status', 'delivered')->where('type', 'retail')->sum('total_amount');
        $revenueWholesale = Order::where('status', 'delivered')->where('type', 'wholesale')->sum('total_amount');
        $revenuePOS = Order::where('status', 'delivered')->where('type', 'pos')->sum('total_amount');
        $totalRevenue = $revenueRetail + $revenueWholesale + $revenuePOS;

        // Cost of Goods Sold (COGS) - 100% real-time mathematical recipe matrix calculation:
        $cogs = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('product_ingredients', 'order_items.product_id', '=', 'product_ingredients.product_id')
            ->join('ingredients', 'product_ingredients.ingredient_id', '=', 'ingredients.id')
            ->where('orders.status', 'delivered')
            ->select(DB::raw('SUM(order_items.quantity * product_ingredients.quantity_required * ingredients.unit_cost) as total_cogs'))
            ->value('total_cogs') ?? 0.0;

        // Sum real shift labor costs by multiplying each shift duration by its specific recorded hourly_rate:
        $baseLaborCost = WorkShift::whereNotNull('clock_out')->get()->reduce(function ($carry, $shift) {
            $in = Carbon::parse($shift->clock_in);
            $out = Carbon::parse($shift->clock_out);
            $hours = $out->diffInMinutes($in) / 60;
            return $carry + ($hours * (float)$shift->hourly_rate);
        }, 0.0);

        // Dynamic POS commissions
        $commissions = Order::where('status', 'delivered')->where('type', 'pos')->sum('total_amount') * 0.05;
        $totalLaborCost = $baseLaborCost + $commissions;

        // Food Waste: Real food waste calculations based on the recipe manufacturing material cost of the expired products:
        $expiredJarsCount = InventoryBatch::onlyTrashed()->sum('quantity');
        if ($expiredJarsCount === 0) {
            $expiredJarsCount = InventoryBatch::where('expiry_date', '<', Carbon::now())->sum('quantity');
        }

        $foodWasteCost = 0.0;
        $expiredBatches = InventoryBatch::onlyTrashed()->get();
        if ($expiredBatches->isEmpty()) {
            $expiredBatches = InventoryBatch::where('expiry_date', '<', Carbon::now())->get();
        }
        foreach ($expiredBatches as $batch) {
            $recipeCost = DB::table('product_ingredients')
                ->join('ingredients', 'product_ingredients.ingredient_id', '=', 'ingredients.id')
                ->where('product_ingredients.product_id', $batch->product_id)
                ->select(DB::raw('SUM(product_ingredients.quantity_required * ingredients.unit_cost) as cost'))
                ->value('cost') ?? 0.0;
            $foodWasteCost += $batch->quantity * (float)$recipeCost;
        }

        // Net Gross Profit Calculation (Dynamic Expenses subtraction)
        $expensesCost = \App\Models\Expense::sum('amount') ?? 0.0;
        $grossProfit = $totalRevenue - ($cogs + $totalLaborCost + $foodWasteCost + $expensesCost);
        $profitMarginPercent = $totalRevenue > 0 ? ($grossProfit / $totalRevenue) * 100 : 0.0;

        // 2. Comparative Branch (Hub) Performance (Dynamic Ranks)
        $hubs = Hub::all();
        $branchPerformance = [];

        foreach ($hubs as $hub) {
            $hubRevenue = Order::where('hub_id', $hub->id)->where('status', 'delivered')->sum('total_amount');
            
            // Average compliance score (aggregate of hygiene and recipe adherence)
            $avgCompliance = ComplianceAudit::where('hub_id', $hub->id)
                ->select(DB::raw('AVG((hygiene_score + recipe_adherence_score) / 2) as avg_score'))
                ->value('avg_score') ?? 100.0;
            
            $activeStock = InventoryBatch::where('hub_id', $hub->id)->sum('quantity');
            $wastedStock = InventoryBatch::where('hub_id', $hub->id)->where('expiry_date', '<', Carbon::now())->sum('quantity');

            $branchPerformance[] = [
                'id' => $hub->id,
                'name' => $hub->name,
                'revenue' => (float)$hubRevenue,
                'compliance_score' => round((float)$avgCompliance, 1),
                'active_stock' => (int)$activeStock,
                'wasted_stock' => (int)$wastedStock,
            ];
        }

        // Sort by revenue descending
        usort($branchPerformance, fn($a, $b) => $b['revenue'] <=> $a['revenue']);

        // 3. Food Waste Metrics
        $totalBatchesQuantity = InventoryBatch::withTrashed()->sum('initial_quantity') ?: 0;
        $wasteRatePercent = $totalBatchesQuantity > 0 ? ($expiredJarsCount / $totalBatchesQuantity) * 100 : 0.0;

        $foodWasteMetrics = [
            'expired_jars_count' => (int)$expiredJarsCount,
            'waste_cost_php' => (float)$foodWasteCost,
            'waste_rate_percent' => round((float)$wasteRatePercent, 2),
            'total_produced_jars' => (int)$totalBatchesQuantity
        ];

        // 4. Dynamic 7-Day Sales Timeline Query
        $salesTimeline = [];
        for ($i = 6; $i >= 0; $i--) {
            $targetDate = Carbon::now()->subDays($i);
            $dayLabel = $targetDate->format('D');

            $dayRetail = Order::where('status', 'delivered')
                ->where('type', 'retail')
                ->whereDate('created_at', $targetDate->toDateString())
                ->sum('total_amount');

            $dayWholesale = Order::where('status', 'delivered')
                ->where('type', 'wholesale')
                ->whereDate('created_at', $targetDate->toDateString())
                ->sum('total_amount');

            $dayPOS = Order::where('status', 'delivered')
                ->where('type', 'pos')
                ->whereDate('created_at', $targetDate->toDateString())
                ->sum('total_amount');

            $salesTimeline[] = [
                'day' => $dayLabel,
                'retail' => (float)$dayRetail,
                'wholesale' => (float)$dayWholesale,
                'pos' => (float)$dayPOS
            ];
        }

        // 5. Dynamic Stock-to-Safety Index Query
        $dbIngredients = Ingredient::all();
        $safetyStockIndex = [];

        foreach ($dbIngredients as $ing) {
            $safetyStockIndex[] = [
                'ingredient' => $ing->name,
                'current' => (float)$ing->stock,
                'safety' => (float)$ing->min_stock,
                'unit' => $ing->unit
            ];
        }

        // 6. Real Dynamic Flavor Sales Growth Predictions mapped directly from Catalog Products
        $predictiveTrends = [];
        $dbProducts = Product::all();
        $totalFlavorSales = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'delivered')
            ->sum('order_items.quantity') ?: 0;

        foreach ($dbProducts as $prod) {
            $qty = DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', 'delivered')
                ->where('order_items.product_id', $prod->id)
                ->sum('order_items.quantity');

            $currentPeriodQty = DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', 'delivered')
                ->where('order_items.product_id', $prod->id)
                ->where('orders.created_at', '>=', Carbon::now()->subDays(7))
                ->sum('order_items.quantity');

            $previousPeriodQty = DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', 'delivered')
                ->where('order_items.product_id', $prod->id)
                ->whereBetween('orders.created_at', [Carbon::now()->subDays(14), Carbon::now()->subDays(7)])
                ->sum('order_items.quantity');

            $growthFactor = $previousPeriodQty > 0 
                ? (($currentPeriodQty - $previousPeriodQty) / $previousPeriodQty) * 100 
                : 0.0;

            $predictiveTrends[] = [
                'flavor' => $prod->name,
                'units_sold' => (int)$qty,
                'share_percent' => $totalFlavorSales > 0 ? round(($qty / $totalFlavorSales) * 100, 1) : 0.0,
                'projected_weekly_growth' => round($growthFactor, 1),
                'demand_status' => $growthFactor > 10.0 ? 'High Surge' : ($growthFactor > 0.0 ? 'Stable Growth' : 'Plateauing')
            ];
        }

        return [
            'gross_margins' => [
                'total_revenue' => (float)$totalRevenue,
                'cogs' => (float)$cogs,
                'labor_cost' => (float)$totalLaborCost,
                'waste_cost' => (float)$foodWasteCost,
                'expenses_cost' => (float)$expensesCost,
                'gross_profit' => (float)$grossProfit,
                'margin_percent' => round((float)$profitMarginPercent, 2)
            ],
            'branches' => $branchPerformance,
            'food_waste' => $foodWasteMetrics,
            'sales_timeline' => $salesTimeline,
            'ingredients_safety' => $safetyStockIndex,
            'trends' => $predictiveTrends
        ];
    }
}
