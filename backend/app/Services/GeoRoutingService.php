<?php

namespace App\Services;

use App\Models\Hub;
use App\Models\HubInventory;

class GeoRoutingService
{
    /**
     * Finds the nearest active hub with sufficient inventory for all items in the request.
     * Uses the Haversine formula to compute great-circle distance in kilometers.
     *
     * @param float $customerLat
     * @param float $customerLng
     * @param array $items Array of ['product_id' => int, 'quantity' => int]
     * @return Hub|null
     */
    public function findNearestHubWithStock(float $customerLat, float $customerLng, array $items): ?Hub
    {
        $hubs = Hub::where('status', 'active')->get();
        $nearestHub = null;
        $minDistance = INF;

        foreach ($hubs as $hub) {
            // Check coordinates presence
            if (is_null($hub->latitude) || is_null($hub->longitude)) {
                continue;
            }

            // Verify inventory first to see if this hub has enough stock for all requested items
            if (!$this->hubHasSufficientInventory($hub->id, $items)) {
                continue;
            }

            // Calculate distance
            $distance = $this->calculateDistance($customerLat, $customerLng, (float) $hub->latitude, (float) $hub->longitude);
            if ($distance < $minDistance) {
                $minDistance = $distance;
                $nearestHub = $hub;
            }
        }

        return $nearestHub;
    }

    /**
     * Verify if a specific hub has enough inventory in stock for all requested product quantities.
     */
    private function hubHasSufficientInventory(int $hubId, array $items): bool
    {
        foreach ($items as $item) {
            $productId = $item['product_id'] ?? null;
            $qty = $item['quantity'] ?? 0;

            if (!$productId || $qty <= 0) {
                continue;
            }

            // Query active inventory
            $inventory = HubInventory::where('hub_id', $hubId)
                ->where('product_id', $productId)
                ->first();

            if (!$inventory || $inventory->stock_quantity < $qty) {
                return false;
            }
        }

        return true;
    }

    /**
     * Calculate Haversine distance in kilometers between two sets of GPS coordinates.
     */
    private function calculateDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371; // Earth's radius in kilometers

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
