'use client';

import React from 'react';
import { Coins, ArrowUpRight } from '@phosphor-icons/react';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { formatCurrency } from '@/lib/format';

export interface CashierShiftHistoryTableProps {
  shiftsList: any[];
  onExportCSV: () => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function CashierShiftHistoryTable({
  shiftsList,
  onExportCSV,
  currentPage,
  totalPages,
  pageSize,
  onPageChange
}: CashierShiftHistoryTableProps) {
  const paginatedShifts = shiftsList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-xs font-bold text-brand-earth uppercase tracking-wider">My Historical Shifts</h4>
          <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest font-semibold mt-0.5">Your personal work logs and break audit history</p>
        </div>
        {shiftsList.length > 0 && (
          <button
            onClick={onExportCSV}
            className="border border-gray-200 hover:bg-gray-50 text-brand-earth/70 font-bold uppercase tracking-widest text-[8px] px-4 py-2 min-h-[44px] rounded-full transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <ArrowUpRight size={12} weight="bold" />
            Export CSV
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Shift Date</th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Hub Outlet</th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Active Work hours</th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Break Deductions</th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Rate / hr</th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Earned Payout</th>
              </tr>
            </thead>
            <tbody>
              {shiftsList.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="py-12">
                      <EmptyState
                        icon={Coins}
                        title="No Shifts Logged"
                        description="Historical check-ins, exact work hours, breaks, and base earnings will display here."
                      />
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedShifts.map((shift) => {
                  const dateObj = new Date(shift.clock_in);
                  const clockInTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const clockOutTime = shift.clock_out 
                    ? new Date(shift.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Active';

                  // Math calculations for frontend listing
                  let workingHours = 0;
                  if (shift.clock_out) {
                    const totalMins = Math.ceil((new Date(shift.clock_out).getTime() - new Date(shift.clock_in).getTime()) / (1000 * 60));
                    workingHours = Math.max(0, (totalMins - (shift.total_break_minutes || 0)) / 60);
                  }

                  return (
                    <tr key={shift.id} className="hover:bg-gray-50/20 transition-colors">
                      <td className="px-6 py-4 border-b border-gray-100">
                        <p className="text-xs font-semibold text-brand-earth">{dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <p className="text-[9px] text-brand-earth/40 font-bold uppercase tracking-wider">{clockInTime} – {clockOutTime}</p>
                      </td>
                      <td className="px-6 py-4 border-b border-gray-100 text-xs font-medium text-brand-earth/70">
                        {shift.hub?.name || 'Central Hub'}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-100 text-xs font-semibold text-brand-earth">
                        {shift.status === 'completed' ? `${workingHours.toFixed(2)} hrs` : 'Calculating...'}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-100 text-xs font-semibold text-amber-600">
                        {shift.total_break_minutes || 0} mins
                      </td>
                      <td className="px-6 py-4 border-b border-gray-100 text-xs text-brand-earth/50 font-medium">
                        {formatCurrency(shift.hourly_rate)}/hr
                      </td>
                      <td className="px-6 py-4 border-b border-gray-100 text-xs font-semibold text-brand-green">
                        {shift.status === 'completed' 
                          ? formatCurrency(workingHours * parseFloat(shift.hourly_rate))
                          : 'Active Session'
                        }
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {shiftsList.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            pageSize={pageSize}
            totalItems={shiftsList.length}
          />
        )}
      </div>
    </div>
  );
}
