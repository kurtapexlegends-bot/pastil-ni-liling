<?php

namespace App\Services;

use App\Models\Order;
use App\Models\HubInventory;
use App\Models\Product;

class OrderFulfillmentService
{
    /**
     * Define the strict state transition matrix.
     * Prevents illogical jumps (e.g. delivered -> pending).
     */
    protected array $validTransitions = [
        'pending' => ['preparing', 'cancelled'],
        'preparing' => ['out_for_delivery', 'cancelled'],
        'out_for_delivery' => ['delivered', 'cancelled'],
        'delivered' => [], // Terminal State
        'cancelled' => [], // Terminal State
    ];

    /**
     * Update the status of an order and fulfill inventory if it is delivered.
     *
     * @param Order $order
     * @param string $newStatus
     * @return Order
     * @throws \Exception
     */
    public function fulfillOrder(Order $order, string $newStatus): Order
    {
        $oldStatus = $order->status;

        // If no change, exit early
        if ($oldStatus === $newStatus) {
            return $order;
        }

        // Defensive guard: Ensure transition is strictly valid according to the matrix
        if (!isset($this->validTransitions[$oldStatus]) || !in_array($newStatus, $this->validTransitions[$oldStatus])) {
            throw new \Exception("Illogical order transition: Cannot transition from '{$oldStatus}' directly to '{$newStatus}'.");
        }

        $order->update(['status' => $newStatus]);

        if ($order->type === 'wholesale' && $newStatus === 'delivered' && $oldStatus !== 'delivered') {
            if ($order->hub_id) {
                $batchService = app(\App\Services\InventoryBatchService::class);
                foreach ($order->items as $item) {
                    $product = $item->product;
                    if (!$product) continue;

                    // Deplete HQ Commissary stock batches in FIFO order
                    $batchService->deductStockFIFO($item->product_id, null, $item->quantity);

                    $targetProductSlug = null;
                    $multiplier = 1;

                    if ($product->slug === 'wholesale-pastil-jar-bulk') {
                        $targetProductSlug = 'original-chicken-pastil';
                        $multiplier = 24;
                    } elseif ($product->slug === 'wholesale-chili-oil-bulk') {
                        $targetProductSlug = 'lilings-signature-chili-garlic-oil';
                        $multiplier = 12;
                    }

                    $targetProductId = null;
                    if ($targetProductSlug) {
                        $retailProduct = Product::where('slug', $targetProductSlug)->first();
                        if ($retailProduct) {
                            $targetProductId = $retailProduct->id;
                        }
                    } else {
                        $targetProductId = $product->id;
                    }

                    if ($targetProductId) {
                        $inventory = HubInventory::firstOrNew([
                            'hub_id' => $order->hub_id,
                            'product_id' => $targetProductId,
                        ]);
                        $inventory->stock_quantity += ($item->quantity * $multiplier);
                        $inventory->save();
                    }
                }
            }
        }

        return $order;
    }
}
