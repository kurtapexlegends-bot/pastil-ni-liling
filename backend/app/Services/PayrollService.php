<?php

namespace App\Services;

use App\Models\WorkShift;
use App\Models\Order;
use Carbon\Carbon;

class PayrollService
{
    /**
     * Calculate total hours, base pay, and commission for a user within a given timeframe.
     */
    public function calculateUserPayout(int $targetUserId, Carbon $startDate, Carbon $endDate)
    {
        // 1. Calculate standard hours pay from completed shifts
        $shifts = WorkShift::where('user_id', $targetUserId)
            ->where('status', 'completed')
            ->whereBetween('clock_in', [$startDate, $endDate])
            ->get();

        $basePay = 0;
        $totalHours = 0;

        /** @var WorkShift $shift */
        foreach ($shifts as $shift) {
            $hours = $this->calculateShiftHours($shift);
            $totalHours += $hours;
            $basePay += ($hours * floatval($shift->hourly_rate));
        }

        // 2. Calculate 5% commission from direct POS walk-in cashier sales
        $totalPOSSales = Order::where('cashier_id', $targetUserId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('total_amount');

        $commissionPay = floatval($totalPOSSales) * 0.05; // 5% direct commission
        $totalPay = $basePay + $commissionPay;

        return [
            'user_id' => intval($targetUserId),
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
            'total_hours' => round($totalHours, 2),
            'base_pay' => round($basePay, 2),
            'total_pos_sales' => round(floatval($totalPOSSales), 2),
            'commission_pay' => round($commissionPay, 2),
            'total_pay' => round($totalPay, 2)
        ];
    }

    /**
     * Helper to compute exact fractional hours worked for a completed shift.
     */
    public function calculateShiftHours(WorkShift $shift): float
    {
        if (!$shift->clock_out) return 0;
        
        $totalMinutes = $shift->clock_in->diffInMinutes($shift->clock_out);
        $workingMinutes = max(0, $totalMinutes - intval($shift->total_break_minutes));
        
        return $workingMinutes / 60;
    }
}
