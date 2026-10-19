<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use App\Http\Requests\Franchise\UpdateHubOrderStatusRequest;
use App\Models\Hub;
use App\Models\HubInventory;
use App\Models\Order;
use App\Models\WorkShift;
use App\Services\OrderFulfillmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FranchiseController extends Controller
{
    /**
     * Resolve the operational hub for the authenticated user (Franchisee or Cashier).
     */
    protected function resolveHub(Request $request): Hub
    {
        $user = $request->user();

        if ($user->hasRole('Branch Cashier')) {
            $shift = WorkShift::where('user_id', $user->id)
                ->where('status', 'active')
                ->first();

            $hubId = $shift?->hub_id ?? $user->hub_id;

            if (! $hubId) {
                abort(403, 'No active shift or assigned branch.');
            }

            $hub = Hub::find($hubId);
        } else {
            $hub = Hub::where('franchisee_id', $user->id)->first();
        }

        if (! $hub) {
            abort(404, 'No active franchise branch associated with this account.');
        }

        return $hub;
    }

    /**
     * Get the active franchisee's hub details and current stock levels.
     */
    public function getInventory(Request $request): JsonResponse
    {
        $hub = $this->resolveHub($request);

        $inventory = HubInventory::where('hub_id', $hub->id)
            ->with('product')
            ->get();

        return response()->json([
            'success' => true,
            'hub' => $hub,
            'data' => $inventory,
        ]);
    }

    /**
     * Get retail orders routed to the franchisee's hub.
     */
    public function getHubOrders(Request $request): JsonResponse
    {
        $hub = $this->resolveHub($request);

        $orders = Order::where('hub_id', $hub->id)
            ->where('type', 'retail')
            ->with(['items.product', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Update status of a retail order routed to the franchisee's hub.
     */
    public function updateHubOrderStatus(UpdateHubOrderStatusRequest $request, int $id): JsonResponse
    {
        $hub = $this->resolveHub($request);

        $order = Order::where('id', $id)
            ->where('hub_id', $hub->id)
            ->where('type', 'retail')
            ->first();

        if (! $order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found or not routed to your branch.',
            ], 404);
        }

        try {
            $fulfillmentService = app(OrderFulfillmentService::class);
            $order = $fulfillmentService->fulfillOrder($order, $request->validated('status'));

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully.',
                'data' => $order->load(['items.product', 'user']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
