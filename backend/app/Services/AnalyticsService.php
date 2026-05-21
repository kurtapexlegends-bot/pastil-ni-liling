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
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class AnalyticsService
{
    /**
     * Compute comprehensive, real-time intelligence metrics across all database tables.
     * Enforces fail-fast patterns and caches the result for 60 seconds (bypassed in testing).
     */
    public function getAnalyticsSummary(): array
    {
        if (app()->environment('testing')) {
            return $this->calculateAnalyticsSummary();
        }

        return Cache::remember('analytics_summary', 60, function () {
            return $this->calculateAnalyticsSummary();
        });
    }

    /**
     * Internal implementation utilizing raw queries to avoid heavy Eloquent ORM hydration.
     */
    protected function calculateAnalyticsSummary(): array
    {
        // 1. Gross Profit Margins Calculations (Real-Time Sums via DB query builder)
        $revenueRetail = DB::table('orders')->where('status', 'delivered')->where('type', 'retail')->sum('total_amount') ?? 0.0;
        $revenueWholesale = DB::table('orders')->where('status', 'delivered')->where('type', 'wholesale')->sum('total_amount') ?? 0.0;
        $revenuePOS = DB::table('orders')->where('status', 'delivered')->where('type', 'pos')->sum('total_amount') ?? 0.0;
        $totalRevenue = $revenueRetail + $revenueWholesale + $revenuePOS;

        // Cost of Goods Sold (COGS) - 100% real-time mathematical recipe matrix calculation:
        $cogs = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('product_ingredients', 'order_items.product_id', '=', 'product_ingredients.product_id')
            ->join('ingredients', 'product_ingredients.ingredient_id', '=', 'ingredients.id')
            ->where('orders.status', 'delivered')
            ->select(DB::raw('SUM(order_items.quantity * product_ingredients.quantity_required * ingredients.unit_cost) as total_cogs'))
            ->value('total_cogs') ?? 0.0;

        // Sum real shift labor costs by multiplying each shift duration by its specific recorded hourly_rate (strtotime is faster than parsing Carbon models):
        $baseLaborCost = DB::table('work_shifts')
            ->whereNotNull('clock_out')
            ->select('clock_in', 'clock_out', 'hourly_rate')
            ->get()
            ->reduce(function ($carry, $shift) {
                $hours = (strtotime($shift->clock_out) - strtotime($shift->clock_in)) / 3600;
                return $carry + ($hours * (float)$shift->hourly_rate);
            }, 0.0);

        // Dynamic POS commissions
        $commissions = $revenuePOS * 0.05;
        $totalLaborCost = $baseLaborCost + $commissions;

        // Food Waste: Real food waste calculations based on the recipe manufacturing material cost of the expired products:
        $expiredJarsCount = DB::table('inventory_batches')->whereNotNull('deleted_at')->sum('quantity') ?? 0;
        if ($expiredJarsCount == 0) {
            $expiredJarsCount = DB::table('inventory_batches')->where('expiry_date', '<', Carbon::now())->sum('quantity') ?? 0;
        }

        // Pre-calculate recipe costs for all products using a single query grouped by product_id
        $productRecipeCosts = DB::table('product_ingredients')
            ->join('ingredients', 'product_ingredients.ingredient_id', '=', 'ingredients.id')
            ->groupBy('product_ingredients.product_id')
            ->select('product_ingredients.product_id', DB::raw('SUM(product_ingredients.quantity_required * ingredients.unit_cost) as cost'))
            ->pluck('cost', 'product_id')
            ->toArray();

        $foodWasteCost = 0.0;
        $expiredBatches = DB::table('inventory_batches')
            ->whereNotNull('deleted_at')
            ->select('product_id', 'quantity')
            ->get();
        if ($expiredBatches->isEmpty()) {
            $expiredBatches = DB::table('inventory_batches')
                ->where('expiry_date', '<', Carbon::now())
                ->select('product_id', 'quantity')
                ->get();
        }

        foreach ($expiredBatches as $batch) {
            $recipeCost = $productRecipeCosts[$batch->product_id] ?? 0.0;
            $foodWasteCost += $batch->quantity * (float)$recipeCost;
        }

        // Net Gross Profit Calculation (Dynamic Expenses subtraction)
        $expensesCost = DB::table('expenses')->sum('amount') ?? 0.0;
        $grossProfit = $totalRevenue - ($cogs + $totalLaborCost + $foodWasteCost + $expensesCost);
        $profitMarginPercent = $totalRevenue > 0 ? ($grossProfit / $totalRevenue) * 100 : 0.0;

        // 2. Comparative Branch (Hub) Performance (Dynamic Ranks) - pre-fetch via group-by queries to avoid N+1
        $hubRevenues = DB::table('orders')
            ->where('status', 'delivered')
            ->whereNotNull('hub_id')
            ->groupBy('hub_id')
            ->select('hub_id', DB::raw('SUM(total_amount) as total'))
            ->pluck('total', 'hub_id')
            ->toArray();

        $hubCompliances = DB::table('compliance_audits')
            ->whereNotNull('hub_id')
            ->groupBy('hub_id')
            ->select('hub_id', DB::raw('AVG((hygiene_score + recipe_adherence_score) / 2) as avg_score'))
            ->pluck('avg_score', 'hub_id')
            ->toArray();

        $hubActiveStocks = DB::table('inventory_batches')
            ->whereNull('deleted_at')
            ->whereNotNull('hub_id')
            ->groupBy('hub_id')
            ->select('hub_id', DB::raw('SUM(quantity) as total'))
            ->pluck('total', 'hub_id')
            ->toArray();

        $hubWastedStocks = DB::table('inventory_batches')
            ->where('expiry_date', '<', Carbon::now())
            ->whereNotNull('hub_id')
            ->groupBy('hub_id')
            ->select('hub_id', DB::raw('SUM(quantity) as total'))
            ->pluck('total', 'hub_id')
            ->toArray();

        $hubs = DB::table('hubs')->select('id', 'name')->get();
        $branchPerformance = [];

        foreach ($hubs as $hub) {
            $hubRevenue = $hubRevenues[$hub->id] ?? 0.0;
            $avgCompliance = $hubCompliances[$hub->id] ?? 100.0;
            $activeStock = $hubActiveStocks[$hub->id] ?? 0;
            $wastedStock = $hubWastedStocks[$hub->id] ?? 0;

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
        $totalBatchesQuantity = DB::table('inventory_batches')->sum('initial_quantity') ?? 0;
        $wasteRatePercent = $totalBatchesQuantity > 0 ? ($expiredJarsCount / $totalBatchesQuantity) * 100 : 0.0;

        $foodWasteMetrics = [
            'expired_jars_count' => (int)$expiredJarsCount,
            'waste_cost_php' => (float)$foodWasteCost,
            'waste_rate_percent' => round((float)$wasteRatePercent, 2),
            'total_produced_jars' => (int)$totalBatchesQuantity
        ];

        // 4. Dynamic 7-Day Sales Timeline Query - run a single group-by query
        $startDate = Carbon::now()->subDays(6)->startOfDay();
        $salesTimelineData = DB::table('orders')
            ->where('status', 'delivered')
            ->where('created_at', '>=', $startDate)
            ->groupBy(DB::raw('DATE(created_at)'), 'type')
            ->select(DB::raw('DATE(created_at) as date'), 'type', DB::raw('SUM(total_amount) as total'))
            ->get();

        $timelineMap = [];
        foreach ($salesTimelineData as $row) {
            $timelineMap[$row->date][$row->type] = (float)$row->total;
        }

        $salesTimeline = [];
        for ($i = 6; $i >= 0; $i--) {
            $targetDate = Carbon::now()->subDays($i);
            $dateStr = $targetDate->toDateString();
            $dayLabel = $targetDate->format('D');

            $salesTimeline[] = [
                'day' => $dayLabel,
                'retail' => $timelineMap[$dateStr]['retail'] ?? 0.0,
                'wholesale' => $timelineMap[$dateStr]['wholesale'] ?? 0.0,
                'pos' => $timelineMap[$dateStr]['pos'] ?? 0.0
            ];
        }

        // 5. Dynamic Stock-to-Safety Index Query - direct selection to bypass model hydration
        $dbIngredients = DB::table('ingredients')->select('name', 'stock', 'min_stock', 'unit')->get();
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
        $productTotalSales = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'delivered')
            ->groupBy('order_items.product_id')
            ->select('order_items.product_id', DB::raw('SUM(order_items.quantity) as total'))
            ->pluck('total', 'product_id')
            ->toArray();

        $productCurrentSales = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'delivered')
            ->where('orders.created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('order_items.product_id')
            ->select('order_items.product_id', DB::raw('SUM(order_items.quantity) as total'))
            ->pluck('total', 'product_id')
            ->toArray();

        $productPreviousSales = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'delivered')
            ->whereBetween('orders.created_at', [Carbon::now()->subDays(14), Carbon::now()->subDays(7)])
            ->groupBy('order_items.product_id')
            ->select('order_items.product_id', DB::raw('SUM(order_items.quantity) as total'))
            ->pluck('total', 'product_id')
            ->toArray();

        $predictiveTrends = [];
        $dbProducts = DB::table('products')->select('id', 'name')->get();
        $totalFlavorSales = array_sum($productTotalSales);

        foreach ($dbProducts as $prod) {
            $qty = $productTotalSales[$prod->id] ?? 0;
            $currentPeriodQty = $productCurrentSales[$prod->id] ?? 0;
            $previousPeriodQty = $productPreviousSales[$prod->id] ?? 0;

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

