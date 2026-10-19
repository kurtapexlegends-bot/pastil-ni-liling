<?php

namespace App\Http\Controllers;

use App\Http\Requests\Expense\StoreExpenseRequest;
use App\Http\Requests\Expense\UpdateExpenseRequest;
use App\Models\Expense;
use App\Services\ExpenseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function __construct(
        protected ExpenseService $expenseService
    ) {}

    /**
     * Display a listing of expenses.
     */
    public function index(Request $request): JsonResponse
    {
        $expenses = $this->expenseService->getExpenses(
            $request->user(),
            $request->query('hub_id') ? (int) $request->query('hub_id') : null,
            $request->query('category'),
            $request->query('start_date'),
            $request->query('end_date')
        );

        return response()->json([
            'success' => true,
            'data' => $expenses,
        ]);
    }

    /**
     * Store a newly created expense in storage.
     */
    public function store(StoreExpenseRequest $request): JsonResponse
    {
        $expense = $this->expenseService->createExpense(
            $request->validated(),
            $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => 'Operational expense logged successfully.',
            'data' => $expense,
        ], 201);
    }

    /**
     * Update the specified expense in storage.
     */
    public function update(UpdateExpenseRequest $request, int $id): JsonResponse
    {
        $expense = Expense::find($id);
        if (! $expense) {
            return response()->json([
                'success' => false,
                'message' => 'Expense record not found.',
            ], 404);
        }

        $updated = $this->expenseService->updateExpense(
            $expense,
            $request->validated(),
            $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => 'Operational expense updated successfully.',
            'data' => $updated,
        ]);
    }

    /**
     * Remove the specified expense from storage.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $expense = Expense::find($id);
        if (! $expense) {
            return response()->json([
                'success' => false,
                'message' => 'Expense record not found.',
            ], 404);
        }

        $this->expenseService->deleteExpense($expense, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Expense record deleted successfully.',
        ]);
    }
}
