<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use App\Http\Requests\Franchise\StoreCommissaryOrderRequest;
use App\Http\Requests\Franchise\UpdateCommissaryOrderStatusRequest;
use App\Models\CommissaryOrder;
use App\Services\CommissaryOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommissaryController extends Controller
{
    public function __construct(
        protected CommissaryOrderService $commissaryService
    ) {}

    /**
     * Display a listing of the logged-in franchisee's commissary orders.
     */
    public function index(Request $request): JsonResponse
    {
        $orders = CommissaryOrder::where('user_id', $request->user()->id)
            ->with(['items.product', 'hub'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Store a newly created B2B commissary restock order.
     */
    public function store(StoreCommissaryOrderRequest $request): JsonResponse
    {
        $idempotencyKey = $request->header('X-Idempotency-Key');
        if ($idempotencyKey) {
            $existingOrder = CommissaryOrder::where('idempotency_key', $idempotencyKey)
                ->with('items.product')
                ->first();

            if ($existingOrder) {
                return response()->json([
                    'success' => true,
                    'message' => 'Commissary restock order was already processed (Idempotency Check).',
                    'data' => $existingOrder,
                ], 200);
            }
        }

        try {
            $orderData = $request->validated();
            $orderData['idempotency_key'] = $idempotencyKey;
            $order = $this->commissaryService->createOrder($orderData, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Commissary restock order placed successfully!',
                'data' => $order,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display a global listing of all commissary orders (Admin/HQ only).
     */
    public function adminIndex(): JsonResponse
    {
        $orders = CommissaryOrder::with(['items.product', 'user', 'hub'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Update the status of a commissary order (Admin/HQ only).
     */
    public function adminUpdateStatus(UpdateCommissaryOrderStatusRequest $request, int $id): JsonResponse
    {
        $order = CommissaryOrder::with('items.product')->findOrFail($id);

        try {
            $order = $this->commissaryService->fulfillOrder($order, $request->validated('status'));

            return response()->json([
                'success' => true,
                'message' => 'Commissary restock order status updated successfully!',
                'data' => $order,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
