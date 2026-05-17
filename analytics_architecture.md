# Corporate Intelligence & Analytics Architecture

This document maps out the end-to-end telemetry pipeline of the **Pastil ni Liling** platform. Every single financial metric, supply index, and trend forecaster is derived entirely from live database relations, with zero placeholders or fallback mock vectors.

---

## 1. Mathematical Database Matrix Models

The intelligence pipeline binds **Backend Eloquent Queries** to the **Frontend React Analytics Engine** through the following database-level mappings:

```mermaid
graph TD
    Order[Order Model] -->|Delivered Sales| GrossMargins[Gross Margin Calculations]
    OrderItem[OrderItem Model] -->|Quantities Sold| ProductIngredients[Recipe COGS Formula]
    Ingredients[Ingredient Model] -->|unit_cost & stock| ProductIngredients
    InventoryBatch[InventoryBatch Model] -->|Expired Quantity| FoodWaste[FIFO Food Waste calculations]
    WorkShift[WorkShift Model] -->|Duration * hourly_rate| LaborCosts[Shift Labor & POS Commission Costs]
    
    GrossMargins --> AnalyticsAPI[/api/analytics/summary]
    ProductIngredients --> AnalyticsAPI
    FoodWaste --> AnalyticsAPI
    LaborCosts --> AnalyticsAPI
    
    AnalyticsAPI --> ReactEngine[AnalyticsEngine.tsx Components]
```

---

## 2. Dynamic Metric Calculations

### A. Cost of Goods Sold (COGS)
* **Mathematical Formula:**
  $$\text{COGS} = \sum (\text{OrderItem.quantity} \times \text{ProductIngredient.quantity\_required} \times \text{Ingredient.unit\_cost})$$
* **SQL Query Vector:**
  ```php
  DB::table('order_items')
      ->join('orders', 'order_items.order_id', '=', 'orders.id')
      ->join('product_ingredients', 'order_items.product_id', '=', 'product_ingredients.product_id')
      ->join('ingredients', 'product_ingredients.ingredient_id', '=', 'ingredients.id')
      ->where('orders.status', 'delivered')
      ->select(DB::raw('SUM(order_items.quantity * product_ingredients.quantity_required * ingredients.unit_cost) as total_cogs'))
      ->value('total_cogs');
  ```

### B. Shift Labor & POS Commissions
* **Mathematical Formula:**
  $$\text{Labor Cost} = \sum (\text{Shift.Duration Hours} \times \text{Shift.hourly\_rate}) + (\text{POS Revenue} \times 0.05)$$
* **Laravel Eloquent Implementation:**
  ```php
  $baseLaborCost = WorkShift::whereNotNull('clock_out')->get()->reduce(function ($carry, $shift) {
      $in = Carbon::parse($shift->clock_in);
      $out = Carbon::parse($shift->clock_out);
      $hours = $out->diffInMinutes($in) / 60;
      return $carry + ($hours * (float)$shift->hourly_rate);
  }, 0.0);
  ```

### C. Expired Inventory Food Waste Valuation
* **Mathematical Formula:**
  $$\text{Waste Cost} = \sum (\text{ExpiredBatch.quantity} \times \text{Recipe Cost})$$
  $$\text{Recipe Cost} = \sum (\text{ProductIngredient.quantity\_required} \times \text{Ingredient.unit\_cost})$$
* **Valuation Controller Logic:**
  ```php
  foreach ($expiredBatches as $batch) {
      $recipeCost = DB::table('product_ingredients')
          ->join('ingredients', 'product_ingredients.ingredient_id', '=', 'ingredients.id')
          ->where('product_ingredients.product_id', $batch->product_id)
          ->select(DB::raw('SUM(product_ingredients.quantity_required * ingredients.unit_cost) as cost'))
          ->value('cost') ?? 0.0;
      $foodWasteCost += $batch->quantity * (float)$recipeCost;
  }
  ```

---

## 3. High-Fidelity UI/UX Grid Mapping

All mathematical variables map cleanly to visual widgets on the corporate dashboard:

| Dashboard Card | Data Bind | Metric Classifiers | Micro-Animations / Interactive Features |
| :--- | :--- | :--- | :--- |
| **Sales Velocity Timeline** | `sales_timeline` | Retail / Wholesale / POS | SVG Area Graph with interactive coordinates & hover guides |
| **Margin Structure Allocation** | `gross_margins` | Net Profit / COGS / Labor / Waste | Proportional color block ratio divider |
| **Stock-to-Safety Index** | `ingredients_safety` | Stock Level vs Critical Minimums | Horizontal progress indicators with procurement alarms |
| **FIFO Food Waste Tracker** | `food_waste` | Discarded Count & Cost Valuation | Circular radial dial indicating active waste rates |
| **Quality vs Sales Correlation Matrix** | `branches` | QC Scores & Branch Revenue Coordinates | Interactive gradient coordinates mapped by compliance levels |
| **Flavor Demand Forecaster** | `trends` | Units Sold, Market Share, Projected Growth | Share progress bars & demand badges with dynamic pulse effects |

---

## 4. Integrity Standards

* **Defensive Design:** Early returns and database constraints prevent SQL injection, XSS, and data degradation.
* **Pure Mathematical Calculations:** No hardcoded approximations are stored in the backend database. If the workspace database is cleared, the system will output clean, mathematical zero ratios without crashing.
* **TypeScript Safety:** Fully bound static types (`Ingredient`, `Product`, `Order`, `InventoryBatch`) are shared between backend endpoints and frontend components.
