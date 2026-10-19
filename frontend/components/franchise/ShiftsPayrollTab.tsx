"use client";

import React, { useState, useEffect } from "react";
import BranchPayrollManager from "@/components/admin/payroll/BranchPayrollManager";
import AlertModal from "@/components/ui/AlertModal";
import CashierAttendanceConsole from "./shifts/CashierAttendanceConsole";
import CashierShiftHistoryTable from "./shifts/CashierShiftHistoryTable";
import { formatCurrency } from "@/lib/format";

interface ShiftsPayrollTabProps {
  hub: any;
  isFranchisee: boolean;
  onShiftUpdate?: () => void;
}

export default function ShiftsPayrollTab({ hub, isFranchisee, onShiftUpdate }: ShiftsPayrollTabProps) {
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
        onShiftUpdate?.();
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
        onShiftUpdate?.();
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
        onShiftUpdate?.();
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
        onShiftUpdate?.();
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

  const handleExportCSV = () => {
    const headers = ["Date", "Time Range", "Hub Outlet", "Active Work Hours", "Break Deductions", "Rate / hr", "Earned Payout"];
    const rows = shiftsList.map(shift => {
      const dateObj = new Date(shift.clock_in);
      const dateStr = dateObj.toLocaleDateString();
      const clockInTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const clockOutTime = shift.clock_out 
        ? new Date(shift.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Active';
      const timeRange = `"${clockInTime} – ${clockOutTime}"`;
      const hubName = `"${shift.hub?.name || 'Central Hub'}"`;
      
      let workingHours = 0;
      if (shift.clock_out) {
        const totalMins = Math.ceil((new Date(shift.clock_out).getTime() - new Date(shift.clock_in).getTime()) / (1000 * 60));
        workingHours = Math.max(0, (totalMins - (shift.total_break_minutes || 0)) / 60);
      }
      const workingHoursStr = shift.status === 'completed' ? workingHours.toFixed(2) : 'Active';
      const breakMins = shift.total_break_minutes || 0;
      const rate = shift.hourly_rate;
      const payout = shift.status === 'completed' ? (workingHours * parseFloat(shift.hourly_rate)).toFixed(2) : 'Active';

      return [dateStr, timeRange, hubName, workingHoursStr, breakMins, rate, payout];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Shift_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pt-4">
      {/* Cashier Attendance Console */}
      <CashierAttendanceConsole
        activeShift={activeShift}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        onClockIn={handleClockIn}
        onClockOut={handleClockOut}
        onStartBreak={handleStartBreak}
        onEndBreak={handleEndBreak}
      />

      {isFranchisee ? (
        <BranchPayrollManager />
      ) : (
        /* Cashier Historical Shift Registry */
        <CashierShiftHistoryTable
          shiftsList={shiftsList}
          onExportCSV={handleExportCSV}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
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
