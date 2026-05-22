<?php

namespace App\Http\Controllers;

use App\Models\CommissaryOrder;
use App\Services\CommissaryOrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CommissaryController extends Controller
{
    protected CommissaryOrderService $commissaryService;

    public function __construct(CommissaryOrderService $commissaryService)
    {
        $this->commissaryService = $commissaryService;
    }

    /**
     * Display a listing of the logged-in franchisee's commissary orders.
     */
    public function index(Request $request)
    {
        $orders = CommissaryOrder::where('user_id', $request->user()->id)
            ->with(['items.product', 'hub'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Store a newly created B2B commissary restock order.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'shipping_address' => 'required|string',
            'contact_number' => 'required|string',
            'payment_method' => 'required|string|in:gcash,paymaya,cod',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $idempotencyKey = $request->header('X-Idempotency-Key');
        if ($idempotencyKey) {
            $existingOrder = CommissaryOrder::where('idempotency_key', $idempotencyKey)
                ->with('items.product')
                ->first();

            if ($existingOrder) {
                return response()->json([
                    'success' => true,
                    'message' => 'Commissary restock order was already processed (Idempotency Check).',
                    'data' => $existingOrder
                ], 200);
            }
        }

        try {
            $orderData = $request->all();
            $orderData['idempotency_key'] = $idempotencyKey;
            $order = $this->commissaryService->createOrder($orderData, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Commissary restock order placed successfully!',
                'data' => $order
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a global listing of all commissary orders (Admin/HQ only).
     */
    public function adminIndex()
    {
        $orders = CommissaryOrder::with(['items.product', 'user', 'hub'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Update the status of a commissary order (Admin/HQ only).
     */
    public function adminUpdateStatus(Request $request, int $id)
    {
        $request->validate([
            'status' => 'required|string|in:pending,preparing,out_for_delivery,delivered,cancelled'
        ]);

        $order = CommissaryOrder::with('items.product')->findOrFail($id);

        try {
            $order = $this->commissaryService->fulfillOrder($order, $request->status);

            return response()->json([
                'success' => true,
                'message' => 'Commissary restock order status updated successfully!',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }
}
