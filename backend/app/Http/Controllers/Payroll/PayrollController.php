<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payroll\CalculatePayoutRequest;
use App\Http\Requests\Payroll\ClockInRequest;
use App\Http\Requests\Payroll\StorePayoutRequest;
use App\Models\Hub;
use App\Models\Payout;
use App\Models\User;
use App\Models\WorkShift;
use App\Services\PayrollService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    /**
     * Clock-in a cashier shift session.
     */
    public function clockIn(ClockInRequest $request)
    {
        $user = $request->user();

        // Fail-Fast: Only Cashiers can clock in shifts
        if (! $user->hasRole('Branch Cashier')) {
            return response()->json([
                'success' => false,
                'message' => 'Only branch cashiers can open shift sessions.',
            ], 403);
        }

        // Fail-Fast: Enforce branch assignment scoping
        if (! $user->hub_id || (int) $user->hub_id !== (int) $request->hub_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. You are not assigned to this branch.',
            ], 403);
        }

        // Fail-Fast: Prevent multiple active shifts
        $activeShift = WorkShift::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if ($activeShift) {
            return response()->json([
                'success' => false,
                'message' => 'You already have an active shift session open.',
            ], 400);
        }

        $shift = WorkShift::create([
            'user_id' => $user->id,
            'hub_id' => $request->hub_id,
            'clock_in' => now(),
            'hourly_rate' => 60.00, // 60 PHP/hour standard cashier rate
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Clock-in recorded. Welcome to your shift!',
            'data' => $shift,
        ]);
    }

    /**
     * Clock-out from an active cashier shift.
     */
    public function clockOut(Request $request)
    {
        $user = $request->user();

        // Intercept active OR on_break shifts
        $shift = WorkShift::where('user_id', $user->id)
            ->whereIn('status', ['active', 'on_break'])
            ->first();

        // Fail-Fast: Ensure active shift exists
        if (! $shift) {
            return response()->json([
                'success' => false,
                'message' => 'No active shift session found to clock out from.',
            ], 404);
        }

        // Auto-end active breaks cleanly before checking out
        if ($shift->status === 'on_break' && $shift->current_break_start) {
            $breakStart = Carbon::parse($shift->current_break_start);
            $elapsedMinutes = max(0, $breakStart->diffInMinutes(now()));
            $shift->total_break_minutes = intval($shift->total_break_minutes) + $elapsedMinutes;
            $shift->current_break_start = null;
        }

        $shift->clock_out = now();
        $shift->status = 'completed';
        $shift->save();

        // Calculate hours worked (using centralized service)
        $payrollService = app(PayrollService::class);
        $hours = $payrollService->calculateShiftHours($shift);

        return response()->json([
            'success' => true,
            'message' => 'Clock-out recorded. Great job today!',
            'data' => [
                'shift' => $shift,
                'hours_worked' => round($hours, 2),
                'earnings' => round($hours * floatval($shift->hourly_rate), 2),
            ],
        ]);
    }

    /**
     * Start cashier break session.
     */
    public function startBreak(Request $request)
    {
        $user = $request->user();

        // Fail-Fast: Only cashiers can take breaks
        if (! $user->hasRole('Branch Cashier')) {
            return response()->json([
                'success' => false,
                'message' => 'Only branch cashiers can control shift breaks.',
            ], 403);
        }

        $shift = WorkShift::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        // Fail-Fast: Ensure cashier has an active work session
        if (! $shift) {
            return response()->json([
                'success' => false,
                'message' => 'No active work shift found to start break.',
            ], 400);
        }

        $shift->status = 'on_break';
        $shift->current_break_start = now();
        $shift->save();

        return response()->json([
            'success' => true,
            'message' => 'Break session started. Take a good rest!',
            'data' => $shift,
        ]);
    }

    /**
     * End cashier break session.
     */
    public function endBreak(Request $request)
    {
        $user = $request->user();

        // Fail-Fast: Only cashiers can control breaks
        if (! $user->hasRole('Branch Cashier')) {
            return response()->json([
                'success' => false,
                'message' => 'Only branch cashiers can control shift breaks.',
            ], 403);
        }

        $shift = WorkShift::where('user_id', $user->id)
            ->where('status', 'on_break')
            ->first();

        // Fail-Fast: Ensure shift is currently on break
        if (! $shift || ! $shift->current_break_start) {
            return response()->json([
                'success' => false,
                'message' => 'You are not currently on a break session.',
            ], 400);
        }

        // Calculate break duration in minutes
        $breakStart = Carbon::parse($shift->current_break_start);
        $elapsedMinutes = max(0, $breakStart->diffInMinutes(now()));

        $shift->total_break_minutes = intval($shift->total_break_minutes) + $elapsedMinutes;
        $shift->current_break_start = null;
        $shift->status = 'active';
        $shift->save();

        return response()->json([
            'success' => true,
            'message' => 'Break ended. Welcome back to active duty!',
            'data' => $shift,
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
                'data' => $shifts,
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
                'data' => $shifts,
            ]);
        }

        // Branch Cashier sees their own shifts
        $shifts = WorkShift::where('user_id', $user->id)
            ->with(['hub'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $shifts,
        ]);
    }

    /**
     * Compute base shift pay and 5% walk-in POS cashier sales commissions.
     */
    public function calculatePayout(CalculatePayoutRequest $request)
    {
        $user = $request->user();

        $isAuthorized = $user->hasRole('Admin') || $user->hasRole('HQ operations') || $user->hasRole('Franchisee');
        if (! $isAuthorized) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized payout action.',
            ], 403);
        }

        $targetUserId = $request->query('user_id');
        $targetUser = User::find($targetUserId);
        if (! $targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'Personnel profile not found.',
            ], 404);
        }

        if ($user->hasRole('Franchisee')) {
            $franchiseeHubIds = Hub::where('franchisee_id', $user->id)->pluck('id');
            $belongsToHub = ($targetUser->hub_id && $franchiseeHubIds->contains($targetUser->hub_id))
                || WorkShift::where('user_id', $targetUserId)->whereIn('hub_id', $franchiseeHubIds)->exists();

            if (! $belongsToHub) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Employee does not belong to your branch.',
                ], 403);
            }
        }

        $startDate = Carbon::parse($request->query('start_date'))->startOfDay();
        $endDate = Carbon::parse($request->query('end_date'))->endOfDay();

        $payrollService = new PayrollService;
        $payoutData = $payrollService->calculateUserPayout($targetUserId, $startDate, $endDate);

        $payoutData['start_date'] = $request->query('start_date');
        $payoutData['end_date'] = $request->query('end_date');

        return response()->json([
            'success' => true,
            'data' => $payoutData,
        ]);
    }

    /**
     * Record a direct payout transaction.
     */
    public function storePayout(StorePayoutRequest $request, PayrollService $payrollService)
    {
        $user = $request->user();

        $isAuthorized = $user->hasRole('Admin') || $user->hasRole('HQ operations') || $user->hasRole('Franchisee');
        if (! $isAuthorized) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized payout action.',
            ], 403);
        }

        if ($user->hasRole('Franchisee')) {
            $ownsHub = Hub::where('id', $request->hub_id)
                ->where('franchisee_id', $user->id)
                ->exists();

            if (! $ownsHub) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized payout action for this franchise hub.',
                ], 403);
            }

            $targetUser = User::findOrFail($request->user_id);
            $belongsToHub = ($targetUser->hub_id && (int) $targetUser->hub_id === (int) $request->hub_id)
                || WorkShift::where('user_id', $targetUser->id)->where('hub_id', $request->hub_id)->exists();

            if (! $belongsToHub) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Employee does not belong to your branch.',
                ], 403);
            }
        }

        $payout = $payrollService->recordPayout($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Payroll direct payout recorded as disbursed.',
            'data' => $payout->load(['user', 'hub']),
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
                'data' => $payouts,
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
                'data' => $payouts,
            ]);
        }

        // Cashier sees their own payouts
        $payouts = Payout::where('user_id', $user->id)
            ->with(['hub'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $payouts,
        ]);
    }
}
