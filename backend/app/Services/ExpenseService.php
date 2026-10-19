<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Hub;
use App\Models\User;
use App\Models\WorkShift;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ExpenseService
{
    /**
     * Display a listing of operational expenses scoped by tenant hub and optional filters.
     * Admin/HQ Operations can view all expenses or filter by hub_id.
     * Franchisees can only access expenses for their owned hub.
     * Branch Cashiers can only access expenses for their active shift hub (or assigned hub).
     *
     * @return Collection<int, Expense>
     */
    public function getExpenses(
        User $user,
        ?int $hubId = null,
        ?string $category = null,
        ?string $startDate = null,
        ?string $endDate = null
    ): Collection {
        $query = Expense::query()->with('hub');

        if ($user->hasRole(['Admin', 'HQ operations'])) {
            if ($hubId !== null) {
                $query->where('hub_id', $hubId);
            }
        } elseif ($user->hasRole('Franchisee')) {
            $hub = Hub::where('franchisee_id', $user->id)->first();
            if (! $hub) {
                throw new HttpResponseException(response()->json([
                    'success' => false,
                    'message' => 'No active franchise branch associated with this account.',
                ], 404));
            }
            $query->where('hub_id', $hub->id);
        } elseif ($user->hasRole('Branch Cashier')) {
            $shift = WorkShift::where('user_id', $user->id)
                ->where('status', 'active')
                ->first();
            $cashierHubId = $shift?->hub_id ?? $user->hub_id;

            if (! $cashierHubId) {
                throw new HttpResponseException(response()->json([
                    'success' => false,
                    'message' => 'No active clocked-in work shift session found.',
                ], 400));
            }
            $query->where('hub_id', $cashierHubId);
        } else {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'Access denied.',
            ], 403));
        }

        if ($category) {
            $query->where('category', $category);
        }

        if ($startDate) {
            $query->whereDate('date', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('date', '<=', $endDate);
        }

        return $query->orderBy('date', 'desc')->latest()->get();
    }

    /**
     * Create an operational expense inside an ACID transaction with strict hub scoping.
     *
     * @param  array<string, mixed>  $data
     */
    public function createExpense(array $data, User $actor): Expense
    {
        return DB::transaction(function () use ($data, $actor) {
            $hubId = null;

            if ($actor->hasRole(['Admin', 'HQ operations'])) {
                $hubId = $data['hub_id'] ?? null;
            } elseif ($actor->hasRole('Franchisee')) {
                $hub = Hub::where('franchisee_id', $actor->id)->first();
                if (! $hub) {
                    throw new HttpResponseException(response()->json([
                        'success' => false,
                        'message' => 'No active franchise branch associated with this account.',
                    ], 404));
                }
                $hubId = $hub->id;
            } elseif ($actor->hasRole('Branch Cashier')) {
                $shift = WorkShift::where('user_id', $actor->id)
                    ->where('status', 'active')
                    ->first();
                $hubId = $shift?->hub_id ?? $actor->hub_id;
                if (! $hubId) {
                    throw new HttpResponseException(response()->json([
                        'success' => false,
                        'message' => 'You must clock in to register daily expenses.',
                    ], 400));
                }
            } else {
                throw new HttpResponseException(response()->json([
                    'success' => false,
                    'message' => 'Access denied.',
                ], 403));
            }

            $expense = Expense::create([
                'hub_id' => $hubId,
                'category' => $data['category'],
                'amount' => $data['amount'],
                'date' => $data['date'],
                'description' => $data['description'] ?? null,
            ]);

            Cache::forget('analytics_summary');

            return $expense->load('hub');
        });
    }

    /**
     * Update an operational expense inside an ACID transaction after validating tenant ownership.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateExpense(Expense $expense, array $data, User $actor): Expense
    {
        return DB::transaction(function () use ($expense, $data, $actor) {
            $this->validateOwnership($expense, $actor);

            if ($actor->hasRole(['Admin', 'HQ operations']) && array_key_exists('hub_id', $data)) {
                $expense->hub_id = $data['hub_id'];
            }

            $expense->fill(Arr::only($data, ['category', 'amount', 'date', 'description']));
            $expense->save();

            Cache::forget('analytics_summary');

            return $expense->load('hub');
        });
    }

    /**
     * Delete an operational expense inside an ACID transaction after validating tenant ownership.
     */
    public function deleteExpense(Expense $expense, User $actor): bool
    {
        return DB::transaction(function () use ($expense, $actor) {
            $this->validateOwnership($expense, $actor);

            $deleted = (bool) $expense->delete();

            Cache::forget('analytics_summary');

            return $deleted;
        });
    }

    /**
     * Validate that the actor has tenant ownership or governance authorization to mutate the expense.
     */
    public function validateOwnership(Expense $expense, User $actor): void
    {
        if ($actor->hasRole(['Admin', 'HQ operations'])) {
            return;
        }

        if ($actor->hasRole('Franchisee')) {
            $hub = Hub::where('franchisee_id', $actor->id)->first();
            if (! $hub || $expense->hub_id !== $hub->id) {
                throw new HttpResponseException(response()->json([
                    'success' => false,
                    'message' => 'Access denied.',
                ], 403));
            }

            return;
        }

        if ($actor->hasRole('Branch Cashier')) {
            $shift = WorkShift::where('user_id', $actor->id)
                ->where('status', 'active')
                ->first();
            $cashierHubId = $shift?->hub_id ?? $actor->hub_id;

            if (! $cashierHubId || $expense->hub_id !== $cashierHubId) {
                throw new HttpResponseException(response()->json([
                    'success' => false,
                    'message' => 'Access denied.',
                ], 403));
            }

            return;
        }

        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Access denied.',
        ], 403));
    }
}
