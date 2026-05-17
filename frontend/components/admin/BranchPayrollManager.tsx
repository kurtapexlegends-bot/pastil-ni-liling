"use client";

import { useState, useEffect } from "react";

interface Shift {
  id: number;
  user: { name: string };
  hub: { name: string };
  clock_in: string;
  clock_out: string | null;
  hourly_rate: string;
  status: string;
}

interface PayoutLedger {
  id: number;
  user: { name: string };
  hub: { name: string };
  start_date: string;
  end_date: string;
  base_pay: string;
  commission_pay: string;
  total_pay: string;
  status: string;
}

export default function BranchPayrollManager() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [payouts, setPayouts] = useState<PayoutLedger[]>([]);
  const [cashiers, setCashiers] = useState<any[]>([]);
  const [hubs, setHubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculator State
  const [selectedCashier, setSelectedCashier] = useState("");
  const [selectedHub, setSelectedHub] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [calcResult, setCalcResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPayrollData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const [shiftRes, payoutRes, empRes, hubRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/payroll/shifts", {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch("http://127.0.0.1:8000/api/payroll/payouts", {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch("http://127.0.0.1:8000/api/admin/employees", {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch("http://127.0.0.1:8000/api/admin/hubs", {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ]);

      const shiftData = await shiftRes.json();
      const payoutData = await payoutRes.json();
      const empData = await empRes.json();
      const hubData = await hubRes.json();

      if (shiftData.success) setShifts(shiftData.data);
      if (payoutData.success) setPayouts(payoutData.data);
      if (empData.success) {
        const branchCashiers = empData.data.filter((e: any) => 
          e.roles.some((r: any) => r.name === "Branch Cashier")
        );
        setCashiers(branchCashiers);
        if (branchCashiers.length > 0) setSelectedCashier(branchCashiers[0].id.toString());
      }
      if (hubData.success) {
        setHubs(hubData.data);
        if (hubData.data.length > 0) setSelectedHub(hubData.data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const handleCalculate = async () => {
    if (!selectedCashier) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/payroll/payouts/calculate?user_id=${selectedCashier}&start_date=${startDate}&end_date=${endDate}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCalcResult(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!calcResult) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setSubmitting(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/payroll/payouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: calcResult.user_id,
          hub_id: selectedHub,
          start_date: calcResult.start_date,
          end_date: calcResult.end_date,
          base_pay: calcResult.base_pay,
          commission_pay: calcResult.commission_pay,
          total_pay: calcResult.total_pay
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("Direct payout settles successfully. Payroll recorded.");
        setCalcResult(null);
        fetchPayrollData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (dtStr: string | null) => {
    if (!dtStr) return "Ongoing Shift";
    return new Date(dtStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. Direct Payout Calculator Section */}
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6">
        <div>
          <h2 className="text-sm font-bold text-brand-earth uppercase tracking-wider">Dry Run / Direct Payout Calculator</h2>
          <p className="text-[10px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Calculate shift base pay, 5% POS walk-in cashier sales commissions, and generate payouts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[8px] font-bold text-brand-earth/40 uppercase tracking-widest">Select Branch Cashier</label>
            <select
              value={selectedCashier}
              onChange={(e) => setSelectedCashier(e.target.value)}
              className="w-full border border-gray-100 rounded-xl px-3 py-2 text-[10px] font-bold text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all"
            >
              {cashiers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[8px] font-bold text-brand-earth/40 uppercase tracking-widest">Fulfilling Branch Hub</label>
            <select
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              className="w-full border border-gray-100 rounded-xl px-3 py-2 text-[10px] font-bold text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all"
            >
              {hubs.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[8px] font-bold text-brand-earth/40 uppercase tracking-widest">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-100 rounded-xl px-3 py-2 text-[10px] font-medium text-brand-earth focus:border-brand-earth/30 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[8px] font-bold text-brand-earth/40 uppercase tracking-widest">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-100 rounded-xl px-3 py-2 text-[10px] font-medium text-brand-earth focus:border-brand-earth/30 outline-none transition-all"
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="bg-brand-earth hover:bg-brand-earth/95 text-white font-bold uppercase tracking-wider text-[9px] px-6 py-2.5 rounded-lg transition-all"
        >
          Compute Direct Payout
        </button>

        {calcResult && (
          <div className="border border-brand-green/20 bg-brand-green/5 p-5 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Payroll Settlement Preview</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-[8px] font-bold text-brand-earth/30 uppercase tracking-widest">Total Shifts Hours</span>
                <p className="text-base font-black text-brand-earth mt-1">{calcResult.total_hours} hrs</p>
              </div>

              <div>
                <span className="text-[8px] font-bold text-brand-earth/30 uppercase tracking-widest">Base Hourly Pay</span>
                <p className="text-base font-black text-brand-earth mt-1">₱ {calcResult.base_pay.toLocaleString()}</p>
              </div>

              <div>
                <span className="text-[8px] font-bold text-brand-earth/30 uppercase tracking-widest">POS Cashier Sales (5% Comm)</span>
                <p className="text-base font-black text-brand-earth mt-1">₱ {calcResult.commission_pay.toLocaleString()}</p>
                <span className="text-[7px] text-brand-earth/40 uppercase tracking-widest">on ₱ {calcResult.total_pos_sales.toLocaleString()} sales</span>
              </div>

              <div className="border-l border-brand-green/20 pl-4">
                <span className="text-[8px] font-bold text-brand-earth/30 uppercase tracking-widest text-brand-green">Total Payroll Pay</span>
                <p className="text-base font-black text-brand-green mt-1">₱ {calcResult.total_pay.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-brand-green/10">
              <button
                onClick={() => setCalcResult(null)}
                className="border border-gray-100 hover:bg-gray-50 text-brand-earth font-bold uppercase tracking-wider text-[8px] px-3 py-1.5 rounded-lg transition-all"
              >
                Reset Calculation
              </button>
              <button
                onClick={handlePay}
                disabled={submitting}
                className="bg-brand-earth hover:bg-brand-earth/95 text-white font-bold uppercase tracking-wider text-[8px] px-4 py-1.5 rounded-lg shadow-sm transition-all"
              >
                {submitting ? "settling..." : "Settle & Disburse Pay"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Shifts Log Section */}
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-brand-earth uppercase tracking-wider">Branch Cashier Work Shift Registry</h2>
          <p className="text-[10px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Real-time attendance logs, hourly shifts record, and branch logouts.</p>
        </div>

        {shifts.length === 0 ? (
          <p className="text-[10px] text-brand-earth/30 uppercase tracking-widest font-semibold text-center py-6">No shift logs found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Employee</th>
                  <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Branch Location</th>
                  <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Clock-In</th>
                  <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Clock-Out</th>
                  <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Hourly Rate</th>
                  <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Status</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/20 transition-colors">
                    <td className="p-4 text-[10px] font-bold text-brand-earth">{s.user.name}</td>
                    <td className="p-4 text-[10px] font-medium text-brand-earth/60">{s.hub.name}</td>
                    <td className="p-4 text-[10px] font-medium text-brand-earth/60">{formatDateTime(s.clock_in)}</td>
                    <td className="p-4 text-[10px] font-medium text-brand-earth/60">{formatDateTime(s.clock_out)}</td>
                    <td className="p-4 text-[10px] font-bold text-brand-earth">₱ {parseFloat(s.hourly_rate).toFixed(2)}/hr</td>
                    <td className="p-4">
                      <span className={`inline-block border text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        s.status === 'active' ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' : 'bg-green-50 text-green-700 border-green-100'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Direct Payout settlement Ledger Section */}
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-brand-earth uppercase tracking-wider">Settled Direct Payout Ledger</h2>
          <p className="text-[10px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Permanent payout records containing base pay + cashier walk-in POS commissions.</p>
        </div>

        {payouts.length === 0 ? (
          <p className="text-[10px] text-brand-earth/30 uppercase tracking-widest font-semibold text-center py-6">No payouts settled yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Employee</th>
                  <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Branch Location</th>
                  <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Statement Period</th>
                  <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Base Hourly Pay</th>
                  <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Commission Pay</th>
                  <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40 text-right">Settled Amount</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/20 transition-colors">
                    <td className="p-4 text-[10px] font-bold text-brand-earth">{p.user.name}</td>
                    <td className="p-4 text-[10px] font-medium text-brand-earth/60">{p.hub.name}</td>
                    <td className="p-4 text-[10px] font-medium text-brand-earth/60">{p.start_date} to {p.end_date}</td>
                    <td className="p-4 text-[10px] font-medium text-brand-earth/60">₱ {parseFloat(p.base_pay).toLocaleString()}</td>
                    <td className="p-4 text-[10px] font-medium text-brand-earth/60">₱ {parseFloat(p.commission_pay).toLocaleString()}</td>
                    <td className="p-4 text-right text-[10px] font-black text-brand-green">₱ {parseFloat(p.total_pay).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
