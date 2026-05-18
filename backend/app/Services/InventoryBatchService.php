<?php

namespace App\Services;

use App\Models\InventoryBatch;
use App\Models\Ingredient;
use App\Models\ProductIngredient;
use App\Models\Product;
use App\Models\HubInventory;
use Illuminate\Support\Facades\DB;
use Exception;

class InventoryBatchService
{
    /**
     * Deducts stock from unexpired batches utilizing FIFO (First In, First Out).
     *
     * @param int $productId
     * @param int|null $hubId Null means HQ Commissary stock
     * @param int $quantityToDeduct
     * @return void
     * @throws Exception
     */
    public function deductStockFIFO(int $productId, ?int $hubId, int $quantityToDeduct): void
    {
        DB::transaction(function () use ($productId, $hubId, $quantityToDeduct) {
            /** @var \Illuminate\Database\Eloquent\Collection<\App\Models\InventoryBatch> $batches */
            $batches = InventoryBatch::where('product_id', $productId)
                ->where('hub_id', $hubId)
                ->where('quantity', '>', 0)
                ->where('expiry_date', '>=', now()->toDateString())
                ->orderBy('expiry_date', 'asc')
                ->lockForUpdate()
                ->get();

            $totalAvailable = $batches->sum('quantity');

            if ($totalAvailable < $quantityToDeduct) {
                throw new Exception("Insufficient stock in unexpired FIFO batches. Requested: {$quantityToDeduct}, Available: {$totalAvailable}");
            }

            $remaining = $quantityToDeduct;

            /** @var InventoryBatch $batch */
            foreach ($batches as $batch) {
                if ($remaining <= 0) break;

                if ($batch->quantity >= $remaining) {
                    $batch->quantity -= $remaining;
                    $remaining = 0;
                } else {
                    $remaining -= $batch->quantity;
                    $batch->quantity = 0;
                }

                $batch->save();
            }

            // Also update the centralized single-source cache tables
            if ($hubId) {
                $inventory = HubInventory::where('hub_id', $hubId)
                    ->where('product_id', $productId)
                    ->first();
                if ($inventory) {
                    $inventory->stock_quantity = max(0, $inventory->stock_quantity - $quantityToDeduct);
                    $inventory->save();
                }
            } else {
                $product = Product::find($productId);
                if ($product) {
                    $product->stock = max(0, $product->stock - $quantityToDeduct);
                    $product->save();
                }
            }
        });
    }

    /**
     * Depletes raw ingredients at the HQ commissary based on product recipes.
     *
     * @param int $productId
     * @param int $quantityManufactured
     * @return void
     * @throws Exception
     */
    public function depleteIngredients(int $productId, int $quantityManufactured): void
    {
        DB::transaction(function () use ($productId, $quantityManufactured) {
            $recipes = ProductIngredient::where('product_id', $productId)
                ->with('ingredient')
                ->get();

            foreach ($recipes as $recipe) {
                $ingredient = $recipe->ingredient;
                if (!$ingredient) continue;

                $totalNeeded = $recipe->quantity_required * $quantityManufactured;

                if ($ingredient->stock < $totalNeeded) {
                    throw new Exception("Insufficient raw ingredient stock: {$ingredient->name}. Required: {$totalNeeded}{$ingredient->unit}, Available: {$ingredient->stock}{$ingredient->unit}");
                }

                $ingredient->stock -= $totalNeeded;
                $ingredient->save();
            }
        });
    }

    /**
     * Receives/creates a new production batch, auto-depleting ingredients at HQ.
     *
     * @param array $data
     * @return InventoryBatch
     */
    public function createBatch(array $data): InventoryBatch
    {
        return DB::transaction(function () use ($data) {
            // Deplete ingredients if manufacturing at HQ (hub_id === null)
            if (!isset($data['hub_id']) || $data['hub_id'] === null) {
                $this->depleteIngredients($data['product_id'], $data['initial_quantity']);
            }

            $data['quantity'] = $data['initial_quantity'];
            $batch = InventoryBatch::create($data);

            // Update product stock at HQ
            if (!isset($data['hub_id']) || $data['hub_id'] === null) {
                $product = Product::find($data['product_id']);
                if ($product) {
                    $product->stock += $data['initial_quantity'];
                    $product->save();
                }
            } else {
                // Update Hub inventory
                $inventory = HubInventory::firstOrNew([
                    'hub_id' => $data['hub_id'],
                    'product_id' => $data['product_id'],
                ]);
                $inventory->stock_quantity += $data['initial_quantity'];
                $inventory->save();
            }

            return $batch;
        });
    }

    /**
     * Scan and apply automatic 30% markdown flash discounts for batches within 3 days of expiration.
     *
     * @return int Number of discounted batches triggered
     */
    public function triggerCloseToExpiryDiscounts(): int
    {
        return DB::transaction(function () {
            /** @var \Illuminate\Database\Eloquent\Collection<\App\Models\InventoryBatch> $batches */
            $batches = InventoryBatch::where('quantity', '>', 0)
                ->where('expiry_date', '<=', now()->addDays(3)->toDateString())
                ->where('expiry_date', '>=', now()->toDateString())
                ->where('discount_triggered', false)
                ->lockForUpdate()
                ->get();

            /** @var InventoryBatch $batch */
            foreach ($batches as $batch) {
                $batch->discount_triggered = true;
                $batch->save();
            }

            return $batches->count();
        });
    }

    /**
     * Gets the dynamic active price for a product, accounting for close-to-expiration flash discounts.
     *
     * @param Product $product
     * @param int|null $hubId
     * @param bool $isWholesale
     * @return float
     */
    public function getActiveProductPrice(Product $product, ?int $hubId, bool $isWholesale = false): float
    {
        $basePrice = $isWholesale ? ($product->wholesale_price ?? $product->price) : $product->price;

        // Check if any unexpired active batch at this hub has triggered discounts
        $hasDiscountedBatch = InventoryBatch::where('product_id', $product->id)
            ->where('hub_id', $hubId)
            ->where('quantity', '>', 0)
            ->where('expiry_date', '>=', now()->toDateString())
            ->where('discount_triggered', true)
            ->exists();

        if ($hasDiscountedBatch) {
            // Apply 30% flash discount
            return round($basePrice * 0.70, 2);
        }

        return $basePrice;
    }
}
