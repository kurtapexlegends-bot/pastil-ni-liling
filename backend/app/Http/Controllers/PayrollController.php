<?php

namespace App\Http\Controllers;

use App\Models\Hub;
use App\Models\Order;
use App\Models\Payout;
use App\Models\User;
use App\Models\WorkShift;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Http\Requests\ClockInRequest;
use App\Http\Requests\CalculatePayoutRequest;
use App\Http\Requests\StorePayoutRequest;

class PayrollController extends Controller
{
    /**
     * Clock-in a cashier shift session.
     */
    public function clockIn(ClockInRequest $request)
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

        // Calculate hours worked (using centralized service)
        $payrollService = app(\App\Services\PayrollService::class);
        $hours = $payrollService->calculateShiftHours($shift);

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
    public function calculatePayout(CalculatePayoutRequest $request)
    {
        $user = $request->user();

        $targetUserId = $request->query('user_id');
        $startDate = Carbon::parse($request->query('start_date'))->startOfDay();
        $endDate = Carbon::parse($request->query('end_date'))->endOfDay();

        $payrollService = new \App\Services\PayrollService();
        $payoutData = $payrollService->calculateUserPayout($targetUserId, $startDate, $endDate);

        // Preserve original exact query string format in response
        $payoutData['start_date'] = $request->query('start_date');
        $payoutData['end_date'] = $request->query('end_date');

        return response()->json([
            'success' => true,
            'data' => $payoutData
        ]);
    }

    /**
     * Record a direct payout transaction.
     */
    public function storePayout(StorePayoutRequest $request)
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
