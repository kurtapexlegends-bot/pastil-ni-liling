<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Hub;
use App\Models\WorkShift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ExpenseController extends Controller
{
    /**
     * Display a listing of expenses.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Expense::query()->with('hub');

        if ($user->hasRole('Admin') || $user->hasRole('HQ operations')) {
            if ($request->has('hub_id')) {
                $query->where('hub_id', $request->query('hub_id'));
            }
        } elseif ($user->hasRole('Franchisee')) {
            $hub = Hub::where('franchisee_id', $user->id)->first();
            if (!$hub) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active franchise branch associated with this account.'
                ], 404);
            }
            $query->where('hub_id', $hub->id);
        } elseif ($user->hasRole('Branch Cashier')) {
            // Retrieve active shift to identify branch hub
            $shift = WorkShift::where('user_id', $user->id)
                ->where('status', 'active')
                ->first();
            
            if (!$shift) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active clocked-in work shift session found.'
                ], 400);
            }
            $query->where('hub_id', $shift->hub_id);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.'
            ], 403);
        }

        $expenses = $query->orderBy('date', 'desc')->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $expenses
        ]);
    }

    /**
     * Store a newly created expense in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $hubId = null;

        if ($user->hasRole('Admin') || $user->hasRole('HQ operations')) {
            $validator = Validator::make($request->all(), [
                'hub_id' => 'nullable|exists:hubs,id',
                'category' => 'required|string|max:255',
                'amount' => 'required|numeric|min:0.01',
                'date' => 'required|date',
                'description' => 'nullable|string|max:1000',
            ]);
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }
            $hubId = $request->input('hub_id');
        } else {
            $validator = Validator::make($request->all(), [
                'category' => 'required|string|max:255',
                'amount' => 'required|numeric|min:0.01',
                'date' => 'required|date',
                'description' => 'nullable|string|max:1000',
            ]);
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            if ($user->hasRole('Franchisee')) {
                $hub = Hub::where('franchisee_id', $user->id)->first();
                if (!$hub) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No active franchise branch associated with this account.'
                    ], 404);
                }
                $hubId = $hub->id;
            } elseif ($user->hasRole('Branch Cashier')) {
                $shift = WorkShift::where('user_id', $user->id)
                    ->where('status', 'active')
                    ->first();
                if (!$shift) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You must clock in to register daily expenses.'
                    ], 400);
                }
                $hubId = $shift->hub_id;
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied.'
                ], 403);
            }
        }

        $expense = Expense::create([
            'hub_id' => $hubId,
            'category' => $request->category,
            'amount' => $request->amount,
            'date' => $request->date,
            'description' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Operational expense logged successfully.',
            'data' => $expense->load('hub')
        ], 201);
    }

    /**
     * Remove the specified expense from storage.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $expense = Expense::find($id);

        if (!$expense) {
            return response()->json([
                'success' => false,
                'message' => 'Expense record not found.'
            ], 404);
        }

        // Authorization checks (Only HQ Admin, or Franchise owner/cashier of the same hub can delete mistakes)
        if ($user->hasRole('Admin') || $user->hasRole('HQ operations')) {
            // Permitted
        } elseif ($user->hasRole('Franchisee')) {
            $hub = Hub::where('franchisee_id', $user->id)->first();
            if (!$hub || $expense->hub_id !== $hub->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied.'
                ], 403);
            }
        } elseif ($user->hasRole('Branch Cashier')) {
            $shift = WorkShift::where('user_id', $user->id)->where('status', 'active')->first();
            if (!$shift || $expense->hub_id !== $shift->hub_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied.'
                ], 403);
            }
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.'
            ], 403);
        }

        $expense->delete();

        return response()->json([
            'success' => true,
            'message' => 'Expense record deleted successfully.'
        ]);
    }
}
