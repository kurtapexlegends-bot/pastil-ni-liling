"use client";

import React, { useState, useEffect } from "react";
import { Clock, Coffee, CircleNotch, Coins, Calendar, ArrowUpRight } from "@phosphor-icons/react";
import BranchPayrollManager from "@/components/admin/payroll/BranchPayrollManager";
import AlertModal from "@/components/ui/AlertModal";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { formatCurrency, formatThousands } from "@/lib/format";

interface ShiftsPayrollTabProps {
  hub: any;
  isFranchisee: boolean;
}

export default function ShiftsPayrollTab({ hub, isFranchisee }: ShiftsPayrollTabProps) {
  const [alertState, setAlertState] = useState<{isOpen: boolean, message: string, type: 'info'|'success'|'error'}>({isOpen: false, message: "", type: "info"});
  const customAlert = (message: string, type: 'info'|'success'|'error' = 'info') => setAlertState({isOpen: true, message, type});

  const [activeShift, setActiveShift] = useState<any | null>(null);
  const [shiftsList, setShiftsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [shiftsList]);

  const totalPages = Math.ceil(shiftsList.length / pageSize);
  const paginatedShifts = shiftsList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Fetch all cashier shifts logs and filter active statuses
  const fetchShifts = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setIsLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/payroll/shifts", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setShiftsList(data.data);
        const active = data.data.find((s: any) => s.status === 'active' || s.status === 'on_break');
        setActiveShift(active || null);
      }
    } catch (err) {
      console.error("Failed to fetch work shifts", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleClockIn = async () => {
    const token = localStorage.getItem("token");
    if (!token || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const res = await fetch("http://127.0.0.1:8000/api/payroll/shifts/clock-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ hub_id: hub?.id || 1 }),
      });
      const data = await res.json();
      if (data.success) {
        customAlert(data.message, "success");
        await fetchShifts();
      } else {
        customAlert(data.message || "Failed to clock in.", "error");
      }
    } catch (err) {
      console.error(err);
      customAlert("A network error occurred while clocking in.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClockOut = async () => {
    const token = localStorage.getItem("token");
    if (!token || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const res = await fetch("http://127.0.0.1:8000/api/payroll/shifts/clock-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        customAlert(`Clock-out recorded! Worked Hours: ${data.data.hours_worked} hrs. Earnings: ${formatCurrency(data.data.earnings)}`, "success");
        await fetchShifts();
      } else {
        customAlert(data.message || "Failed to clock out.", "error");
      }
    } catch (err) {
      console.error(err);
      customAlert("A network error occurred while clocking out.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartBreak = async () => {
    const token = localStorage.getItem("token");
    if (!token || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const res = await fetch("http://127.0.0.1:8000/api/payroll/shifts/break-start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        customAlert(data.message, "success");
        await fetchShifts();
      } else {
        customAlert(data.message || "Failed to start break.", "error");
      }
    } catch (err) {
      console.error(err);
      customAlert("A network error occurred while entering break.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndBreak = async () => {
    const token = localStorage.getItem("token");
    if (!token || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const res = await fetch("http://127.0.0.1:8000/api/payroll/shifts/break-end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        customAlert(data.message, "success");
        await fetchShifts();
      } else {
        customAlert(data.message || "Failed to resume shift.", "error");
      }
    } catch (err) {
      console.error(err);
      customAlert("A network error occurred while resuming work.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pt-4">
      {/* Cashier Attendance Console */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Cashier Attendance Console</h3>
            <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest font-semibold">Clock in to register shift hours and qualify for POS cashier commissions.</p>
          </div>
          
          {activeShift && (
            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse ${
              activeShift.status === 'on_break' 
                ? 'bg-amber-50 text-amber-700 border border-amber-100/50' 
                : 'bg-emerald-50 text-emerald-700 border border-emerald-100/50'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${activeShift.status === 'on_break' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              {activeShift.status === 'on_break' ? 'On Break' : 'Active Duty Shift'}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <CircleNotch size={28} className="animate-spin text-brand-earth/40" />
            <p className="text-[10px] text-brand-earth/30 uppercase tracking-widest font-bold">Querying Shift Databases...</p>
          </div>
        ) : !activeShift ? (
          /* Check-In Panel (Not clocked in) */
          <div className="p-8 text-center space-y-5 max-w-sm mx-auto">
            <div className="w-12 h-12 bg-brand-earth/5 rounded-full flex items-center justify-center text-brand-earth/30 mx-auto">
              <Clock size={24} weight="duotone" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-brand-earth uppercase tracking-wider">Not Clocked In</p>
              <p className="text-[9px] text-brand-earth/40 leading-relaxed font-semibold">Your daily shift ledger is closed. Clock in now to activate cashier terminals and commissions.</p>
            </div>
            <button
              onClick={handleClockIn}
              disabled={isSubmitting}
              className="bg-brand-earth text-white font-bold uppercase tracking-widest text-[9px] px-6 py-3 rounded-full transition-all shadow-sm hover:bg-brand-green active:scale-[0.98] disabled:opacity-50 shrink-0 w-full"
            >
              {isSubmitting ? "Initializing..." : "Clock In Shift"}
            </button>
          </div>
        ) : activeShift.status === 'on_break' ? (
          /* Break Card Panel (On Break) */
          <div className="p-8 bg-amber-50/50 border-t border-b border-amber-100/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 shrink-0">
                <Coffee size={20} weight="fill" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Shift Muted on Unpaid Break</p>
                <p className="text-[9px] text-amber-700/60 leading-relaxed font-medium">Break session started at {new Date(activeShift.current_break_start).toLocaleTimeString()}. Earnings calculation paused.</p>
                {activeShift.total_break_minutes > 0 && (
                  <p className="text-[8px] text-amber-800 font-bold uppercase tracking-wider">Accumulated break: {activeShift.total_break_minutes} mins</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEndBreak}
                disabled={isSubmitting}
                className="bg-brand-earth hover:bg-brand-green text-white font-bold uppercase tracking-widest text-[9px] px-5 py-2.5 rounded-full transition-all active:scale-[0.97] disabled:opacity-50"
              >
                {isSubmitting ? "Resuming..." : "Resume Shift Duty"}
              </button>
              <button
                onClick={handleClockOut}
                disabled={isSubmitting}
                className="border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold uppercase tracking-widest text-[9px] px-5 py-2.5 rounded-full transition-all active:scale-[0.97] disabled:opacity-50"
              >
                Clock Out
              </button>
            </div>
          </div>
        ) : (
          /* Active Duty Panel (Working) */
          <div className="p-8 bg-emerald-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 shrink-0">
                <Clock size={20} weight="fill" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Currently on Active Duty</p>
                <p className="text-[9px] text-emerald-700/60 leading-relaxed font-medium">Shift started at {new Date(activeShift.clock_in).toLocaleTimeString()} @ ₱{activeShift.hourly_rate}/hr.</p>
                {activeShift.total_break_minutes > 0 && (
                  <p className="text-[8px] text-emerald-800 font-bold uppercase tracking-wider">Total Break Deductions: {activeShift.total_break_minutes} mins</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleStartBreak}
                disabled={isSubmitting}
                className="bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 font-bold uppercase tracking-widest text-[9px] px-5 py-2.5 rounded-full transition-all active:scale-[0.97] disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Take Shift Break"}
              </button>
              <button
                onClick={handleClockOut}
                disabled={isSubmitting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-widest text-[9px] px-5 py-2.5 rounded-full transition-all active:scale-[0.97] disabled:opacity-50 shadow-sm shadow-rose-600/10"
              >
                Clock Out Shift
              </button>
            </div>
          </div>
        )}
      </div>

      {isFranchisee ? (
        <BranchPayrollManager />
      ) : (
        /* Cashier Historical Shift Registry */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xs font-bold text-brand-earth uppercase tracking-wider">My Historical Shifts</h4>
              <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest font-semibold mt-0.5">Your personal work logs and break audit history</p>
            </div>
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
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                totalItems={shiftsList.length}
              />
            )}
          </div>
        </div>
      )}

      <AlertModal 
        isOpen={alertState.isOpen}
        title={alertState.type === 'error' ? "Action Failed" : alertState.type === 'success' ? "Success" : "Information"}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
