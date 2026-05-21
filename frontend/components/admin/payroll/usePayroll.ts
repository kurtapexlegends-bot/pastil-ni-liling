import { useState, useEffect, useCallback } from "react";
import { Shift, PayoutLedger } from "./types";

export function usePayroll() {
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

  const fetchPayrollData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchPayrollData();
  }, [fetchPayrollData]);

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

  const handlePay = async (onSuccess: () => void) => {
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
        setCalcResult(null);
        fetchPayrollData();
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    shifts,
    payouts,
    cashiers,
    hubs,
    loading,
    selectedCashier,
    setSelectedCashier,
    selectedHub,
    setSelectedHub,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    calcResult,
    setCalcResult,
    submitting,
    handleCalculate,
    handlePay
  };
}
