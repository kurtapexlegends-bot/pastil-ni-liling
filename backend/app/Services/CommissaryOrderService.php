<?php

namespace App\Services;

use App\Models\CommissaryOrder;
use App\Models\CommissaryOrderItem;
use App\Models\Hub;
use App\Models\HubInventory;
use App\Models\Product;
use App\Models\InventoryBatch;
use Illuminate\Support\Facades\DB;

class CommissaryOrderService
{
    /**
     * Strict state transition matrix to prevent illogical jumps.
     */
    protected array $validTransitions = [
        'pending' => ['preparing', 'cancelled'],
        'preparing' => ['out_for_delivery', 'cancelled'],
        'out_for_delivery' => ['delivered', 'cancelled'],
        'delivered' => [], // Terminal State
        'cancelled' => [], // Terminal State
    ];

    /**
     * Create a new B2B Commissary Order within an ACID transaction.
     *
     * @param array $data
     * @param \App\Models\User $user
     * @return CommissaryOrder
     * @throws \Exception
     */
    public function createOrder(array $data, \App\Models\User $user): CommissaryOrder
    {
        return DB::transaction(function () use ($data, $user) {
            if (!$user || !$user->hasRole('Franchisee')) {
                throw new \Exception('Access denied. Commissary restock orders are restricted to registered Franchise partners.');
            }

            $hub = Hub::where('franchisee_id', $user->id)->first();
            if (!$hub) {
                throw new \Exception('No active franchise branch associated with this franchisee account.');
            }

            // Calculate total price based on products' wholesale prices
            $totalAmount = 0;
            $itemsData = [];

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                if (!$product->is_wholesale) {
                    throw new \Exception("Product '{$product->name}' is not marked for wholesale B2B restock.");
                }

                $qty = (int) $item['quantity'];
                $wholesalePrice = $product->wholesale_price ?? $product->price;
                $subtotal = $wholesalePrice * $qty;

                $totalAmount += $subtotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'wholesale_price' => $wholesalePrice,
                    'subtotal' => $subtotal,
                ];
            }

            $order = CommissaryOrder::create([
                'idempotency_key' => $data['idempotency_key'] ?? null,
                'user_id' => $user->id,
                'hub_id' => $hub->id,
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'shipping_address' => $data['shipping_address'] ?? $hub->address,
                'contact_number' => $data['contact_number'] ?? 'N/A',
                'payment_method' => $data['payment_method'] ?? 'cod',
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($itemsData as $item) {
                CommissaryOrderItem::create([
                    'commissary_order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'wholesale_price' => $item['wholesale_price'],
                    'subtotal' => $item['subtotal'],
                ]);
            }

            return $order->load('items.product');
        });
    }

    /**
     * Update B2B order status and execute FIFO batch transfer upon delivery.
     *
     * @throws \Exception
     */
    public function fulfillOrder(CommissaryOrder $order, string $newStatus): CommissaryOrder
    {
        return DB::transaction(function () use ($order, $newStatus) {
            $oldStatus = $order->status;

            if ($oldStatus === $newStatus) {
                return $order;
            }

            // Strict transition matrix check
            if (!isset($this->validTransitions[$oldStatus]) || !in_array($newStatus, $this->validTransitions[$oldStatus])) {
                throw new \Exception("Illogical B2B order transition: Cannot transition from '{$oldStatus}' directly to '{$newStatus}'.");
            }

            $order->update(['status' => $newStatus]);

            // Execute FIFO stock transfer when delivered
            if ($newStatus === 'delivered' && $oldStatus !== 'delivered') {
                foreach ($order->items as $item) {
                    $productId = $item->product_id;
                    $quantityToDeduct = $item->quantity;
                    $hubId = $order->hub_id;

                    // 1. Fetch HQ active unexpired batches in FIFO order (expiry_date asc)
                    $batches = InventoryBatch::where('product_id', $productId)
                        ->whereNull('hub_id')
                        ->where('quantity', '>', 0)
                        ->where('expiry_date', '>=', now()->toDateString())
                        ->orderBy('expiry_date', 'asc')
                        ->lockForUpdate()
                        ->get();

                    $totalAvailable = $batches->sum('quantity');

                    if ($totalAvailable < $quantityToDeduct) {
                        $pName = $item->product ? $item->product->name : "Product #{$productId}";
                        throw new \Exception("Insufficient unexpired stock in HQ Commissary for: {$pName}. Requested: {$quantityToDeduct}, Available: {$totalAvailable}");
                    }

                    $remaining = $quantityToDeduct;

                    // 2. Loop & deduct stock from HQ batches, then instantiate corresponding batches at Spoke Hub
                    /** @var \App\Models\InventoryBatch $batch */
                    foreach ($batches as $batch) {
                        if ($remaining <= 0) break;

                        $deducted = 0;
                        if ($batch->quantity >= $remaining) {
                            $batch->quantity -= $remaining;
                            $deducted = $remaining;
                            $remaining = 0;
                        } else {
                            $remaining -= $batch->quantity;
                            $deducted = $batch->quantity;
                            $batch->quantity = 0;
                        }
                        $batch->save();

                        // Create a corresponding InventoryBatch record at the franchisee spoke hub
                        $b2bBatchNumber = "B2B-H{$hubId}-" . $batch->batch_number . "-" . uniqid();

                        InventoryBatch::create([
                            'batch_number' => $b2bBatchNumber,
                            'product_id' => $productId,
                            'hub_id' => $hubId,
                            'quantity' => $deducted,
                            'initial_quantity' => $deducted,
                            'manufacture_date' => $batch->manufacture_date,
                            'expiry_date' => $batch->expiry_date,
                            'discount_triggered' => false,
                        ]);
                    }

                    // 3. Update global Product stock level at HQ
                    $product = Product::find($productId);
                    if ($product) {
                        $product->stock = max(0, $product->stock - $quantityToDeduct);
                        $product->save();
                    }

                    // 4. Update the centralized Spoke Hub inventory count
                    $inventory = HubInventory::firstOrNew([
                        'hub_id' => $hubId,
                        'product_id' => $productId,
                    ]);
                    $inventory->stock_quantity += $quantityToDeduct;
                    $inventory->save();
                }
            }

            return $order->load('items.product');
        });
    }
}
