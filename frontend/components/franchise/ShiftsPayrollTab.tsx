"use client";

import BranchPayrollManager from "@/components/admin/BranchPayrollManager";

interface ShiftsPayrollTabProps {
  hub: any;
  isFranchisee: boolean;
}

export default function ShiftsPayrollTab({ hub, isFranchisee }: ShiftsPayrollTabProps) {
  const handleClockIn = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/payroll/shifts/clock-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ hub_id: hub?.id || 1 }),
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClockOut = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/payroll/shifts/clock-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pt-4">
      {/* Cashier Attendance Console */}
      <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm space-y-6">
        <div>
          <h3 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Cashier Attendance Console</h3>
          <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest font-semibold mt-1">Clock in to register shift hours and qualify for POS commissions.</p>
        </div>

        <div className="flex gap-4 items-center">
          <button
            onClick={handleClockIn}
            className="bg-brand-green hover:bg-brand-green/90 text-white font-bold uppercase tracking-widest text-[9px] px-5 py-2.5 rounded-full transition-all shadow-sm shadow-brand-green/10"
          >
            Clock In Shift
          </button>

          <button
            onClick={handleClockOut}
            className="bg-red-500 hover:bg-red-600 text-white font-bold uppercase tracking-widest text-[9px] px-5 py-2.5 rounded-full transition-all shadow-sm shadow-red-500/10"
          >
            Clock Out Shift
          </button>
        </div>
      </div>

      {isFranchisee && <BranchPayrollManager />}
    </div>
  );
}
