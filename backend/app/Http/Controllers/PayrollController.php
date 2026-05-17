<?php

namespace App\Http\Controllers;

use App\Models\Hub;
use App\Models\Order;
use App\Models\Payout;
use App\Models\User;
use App\Models\WorkShift;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PayrollController extends Controller
{
    /**
     * Clock-in a cashier shift session.
     */
    public function clockIn(Request $request)
    {
        $user = $request->user();

        // Fail-Fast: Only Cashiers can clock in shifts
        if (!$user->hasRole('Branch Cashier')) {
            return response()->json([
                'success' => false,
                'message' => 'Only branch cashiers can open shift sessions.'
            ], 403);
        }

        // Fail-Fast: Prevent multiple active shifts
        $activeShift = WorkShift::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();
            
        if ($activeShift) {
            return response()->json([
                'success' => false,
                'message' => 'You already have an active shift session open.'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'hub_id' => 'required|exists:hubs,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid hub location.',
                'errors' => $validator->errors()
            ], 422);
        }

        $shift = WorkShift::create([
            'user_id' => $user->id,
            'hub_id' => $request->hub_id,
            'clock_in' => now(),
            'hourly_rate' => 60.00, // 60 PHP/hour standard cashier rate
            'status' => 'active'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Clock-in recorded. Welcome to your shift!',
            'data' => $shift
        ]);
    }

    /**
     * Clock-out from an active cashier shift.
     */
    public function clockOut(Request $request)
    {
        $user = $request->user();

        $shift = WorkShift::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        // Fail-Fast: Ensure active shift exists
        if (!$shift) {
            return response()->json([
                'success' => false,
                'message' => 'No active shift session found to clock out from.'
            ], 404);
        }

        $shift->clock_out = now();
        $shift->status = 'completed';
        $shift->save();

        // Calculate hours worked
        $hours = $shift->clock_in->diffInHours($shift->clock_out) + ($shift->clock_in->diffInMinutes($shift->clock_out) % 60) / 60;

        return response()->json([
            'success' => true,
            'message' => 'Clock-out recorded. Great job today!',
            'data' => [
                'shift' => $shift,
                'hours_worked' => round($hours, 2),
                'earnings' => round($hours * floatval($shift->hourly_rate), 2)
            ]
        ]);
    }

    /**
     * Fetch work shifts log.
     */
    public function getShifts(Request $request)
    {
        $user = $request->user();

        if ($user->hasRole('Admin') || $user->hasRole('HQ operations')) {
            $shifts = WorkShift::with(['user', 'hub'])->latest()->get();
            return response()->json([
                'success' => true,
                'data' => $shifts
            ]);
        }

        if ($user->hasRole('Franchisee')) {
            $hubs = Hub::where('franchisee_id', $user->id)->pluck('id');
            $shifts = WorkShift::whereIn('hub_id', $hubs)
                ->with(['user', 'hub'])
                ->latest()
                ->get();
            return response()->json([
                'success' => true,
                'data' => $shifts
            ]);
        }

        // Branch Cashier sees their own shifts
        $shifts = WorkShift::where('user_id', $user->id)
            ->with(['hub'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $shifts
        ]);
    }

    /**
     * Compute base shift pay and 5% walk-in POS cashier sales commissions.
     */
    public function calculatePayout(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->query(), [
            'user_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        // Fail-Fast: Validate date inputs
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error.',
                'errors' => $validator->errors()
            ], 422);
        }

        $targetUserId = $request->query('user_id');
        $startDate = Carbon::parse($request->query('start_date'))->startOfDay();
        $endDate = Carbon::parse($request->query('end_date'))->endOfDay();

        // 1. Calculate standard hours pay from completed shifts
        $shifts = WorkShift::where('user_id', $targetUserId)
            ->where('status', 'completed')
            ->whereBetween('clock_in', [$startDate, $endDate])
            ->get();

        $basePay = 0;
        $totalHours = 0;

        foreach ($shifts as $shift) {
            $hours = $shift->clock_in->diffInHours($shift->clock_out) + ($shift->clock_in->diffInMinutes($shift->clock_out) % 60) / 60;
            $totalHours += $hours;
            $basePay += ($hours * floatval($shift->hourly_rate));
        }

        // 2. Calculate 5% commission from direct POS walk-in cashier sales
        $totalPOSSales = Order::where('cashier_id', $targetUserId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('total_amount');

        $commissionPay = floatval($totalPOSSales) * 0.05; // 5% direct commission
        $totalPay = $basePay + $commissionPay;

        return response()->json([
            'success' => true,
            'data' => [
                'user_id' => intval($targetUserId),
                'start_date' => $request->query('start_date'),
                'end_date' => $request->query('end_date'),
                'total_hours' => round($totalHours, 2),
                'base_pay' => round($basePay, 2),
                'total_pos_sales' => round(floatval($totalPOSSales), 2),
                'commission_pay' => round($commissionPay, 2),
                'total_pay' => round($totalPay, 2)
            ]
        ]);
    }

    /**
     * Record a direct payout transaction.
     */
    public function storePayout(Request $request)
    {
        $user = $request->user();

        // Fail-Fast: Only Super Admin or Franchise Partner can issue payroll disbursements
        $isAuthorized = $user->hasRole('Admin') || $user->hasRole('Franchisee');
        if (!$isAuthorized) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized payout action.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'hub_id' => 'required|exists:hubs,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'base_pay' => 'required|numeric',
            'commission_pay' => 'required|numeric',
            'total_pay' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error.',
                'errors' => $validator->errors()
            ], 422);
        }

        $payout = Payout::create([
            'user_id' => $request->user_id,
            'hub_id' => $request->hub_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'base_pay' => $request->base_pay,
            'commission_pay' => $request->commission_pay,
            'total_pay' => $request->total_pay,
            'status' => 'paid'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payroll direct payout recorded as disbursed.',
            'data' => $payout->load(['user', 'hub'])
        ], 201);
    }

    /**
     * Get all payouts.
     */
    public function getPayouts(Request $request)
    {
        $user = $request->user();

        if ($user->hasRole('Admin') || $user->hasRole('HQ operations')) {
            $payouts = Payout::with(['user', 'hub'])->latest()->get();
            return response()->json([
                'success' => true,
                'data' => $payouts
            ]);
        }

        if ($user->hasRole('Franchisee')) {
            $hubs = Hub::where('franchisee_id', $user->id)->pluck('id');
            $payouts = Payout::whereIn('hub_id', $hubs)
                ->with(['user', 'hub'])
                ->latest()
                ->get();
            return response()->json([
                'success' => true,
                'data' => $payouts
            ]);
        }

        // Cashier sees their own payouts
        $payouts = Payout::where('user_id', $user->id)
            ->with(['hub'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $payouts
        ]);
    }
}
