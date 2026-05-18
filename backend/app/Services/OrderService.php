<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Hub;
use App\Models\HubInventory;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class OrderService
{
    protected GeoRoutingService $geoRoutingService;
    protected InventoryBatchService $inventoryBatchService;

    public function __construct(GeoRoutingService $geoRoutingService, InventoryBatchService $inventoryBatchService)
    {
        $this->geoRoutingService = $geoRoutingService;
        $this->inventoryBatchService = $inventoryBatchService;
    }

    /**
     * Create a new online/wholesale order within an ACID transaction.
     *
     * @throws \Exception
     */
    public function createCustomerOrder(array $data, $user): Order
    {
        return DB::transaction(function () use ($data, $user) {
            $type = $data['type'] ?? 'retail';
            $hubId = $data['hub_id'] ?? null;
            $customerLat = $data['latitude'] ?? null;
            $customerLng = $data['longitude'] ?? null;

            if ($type === 'wholesale') {
                $hubId = $this->resolveWholesaleHub($user);
            } else {
                $hubId = $this->resolveRetailHub($customerLat, $customerLng, $data['items'], $hubId);
                $this->verifyStockAndDeduct($hubId, $data['items']);
            }

            $order = Order::create([
                'user_id' => $user?->id,
                'hub_id' => $hubId,
                'type' => $type,
                'total_amount' => $data['total_amount'],
                'status' => 'pending',
                'shipping_address' => $data['shipping_address'],
                'latitude' => $customerLat,
                'longitude' => $customerLng,
                'contact_number' => $data['contact_number'],
                'payment_method' => $data['payment_method'],
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }

            return $order->load('items.product');
        });
    }

    /**
     * Synchronize offline POS orders taken at a franchisee outlet.
     *
     * @throws \Exception
     */
    public function syncPOSOrders(array $orders, $user): array
    {
        $hub = Hub::where('franchisee_id', $user->id)->first();
        if (!$hub) {
            throw new \Exception('No active franchise branch associated with this operator account.');
        }

        $hubId = $hub->id;
        $syncedOrders = [];

        DB::transaction(function () use ($orders, $user, $hubId, &$syncedOrders) {
            foreach ($orders as $orderData) {
                // Check if already synchronized
                if ($this->isPOSOrderAlreadySynced($hubId, $orderData['offline_id'])) {
                    continue;
                }

                // Verify stock and deduct inventory
                $this->verifyStockAndDeduct($hubId, $orderData['items']);

                // Create the completed POS sale
                $order = Order::create([
                    'user_id' => $user->id, // Franchisee acting as cashier
                    'hub_id' => $hubId,
                    'type' => 'pos',
                    'total_amount' => $orderData['total_amount'],
                    'status' => 'completed',
                    'shipping_address' => 'Walk-in Stall Customer',
                    'contact_number' => 'N/A',
                    'payment_method' => $orderData['payment_method'],
                    'notes' => "POS-OFFLINE-ID: {$orderData['offline_id']}",
                ]);

                foreach ($orderData['items'] as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'price' => $item['price'],
                    ]);
                }

                $syncedOrders[] = [
                    'offline_id' => $orderData['offline_id'],
                    'online_id' => $order->id
                ];
            }
        });

        return $syncedOrders;
    }

    /**
     * Validate and resolve the associated Hub ID for wholesale ordering.
     *
     * @throws \Exception
     */
    protected function resolveWholesaleHub($user): int
    {
        if (!$user || !$user->hasRole('Franchisee')) {
            throw new \Exception('Access denied. Wholesale orders are restricted to registered Franchise partners.');
        }

        $hub = Hub::where('franchisee_id', $user->id)->first();
        if (!$hub) {
            throw new \Exception('No active franchise branch associated with this account.');
        }

        return $hub->id;
    }

    /**
     * Resolve the nearest available retail Hub ID with stock coordinates.
     *
     * @throws \Exception
     */
    protected function resolveRetailHub($lat, $lng, array $items, ?int $hubId): int
    {
        if (!is_null($lat) && !is_null($lng)) {
            $matchedHub = $this->geoRoutingService->findNearestHubWithStock((float) $lat, (float) $lng, $items);
            if ($matchedHub) {
                return $matchedHub->id;
            }
        }

        if (!$hubId) {
            throw new \Exception('Could not determine nearest branch hub with sufficient inventory. Please select branch manually.');
        }

        $hub = Hub::where('id', $hubId)->where('status', 'active')->first();
        if (!$hub) {
            throw new \Exception('The selected branch is currently unavailable.');
        }

        return $hub->id;
    }

    /**
     * Verify HubInventory levels and deduct stock using FIFO batch allocations.
     *
     * @throws \Exception
     */
    protected function verifyStockAndDeduct(int $hubId, array $items): void
    {
        // 1. Validate all stock levels first (Defensive Fail-Fast)
        foreach ($items as $item) {
            $product = Product::findOrFail($item['product_id']);
            $inventory = HubInventory::where('hub_id', $hubId)
                ->where('product_id', $item['product_id'])
                ->first();

            if (!$inventory || $inventory->stock_quantity < $item['quantity']) {
                $available = $inventory ? $inventory->stock_quantity : 0;
                throw new \Exception("Sorry, {$product->name} is out of stock at this branch. (Available: {$available} units)");
            }
        }

        // 2. Perform stock depletions using FIFO rules
        foreach ($items as $item) {
            $this->inventoryBatchService->deductStockFIFO($item['product_id'], $hubId, $item['quantity']);
        }
    }

    /**
     * Check if a POS order has already been synchronized.
     */
    protected function isPOSOrderAlreadySynced(int $hubId, string $offlineId): bool
    {
        return Order::where('hub_id', $hubId)
            ->where('notes', 'LIKE', "POS-OFFLINE-ID: {$offlineId}%")
            ->exists();
    }
}
