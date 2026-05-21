"use client";

import { useState, useEffect } from "react";
import AlertModal from "../ui/AlertModal";
import { usePayroll } from "./payroll/usePayroll";
import { PayrollCalculator } from "./payroll/PayrollCalculator";
import { ShiftLogs } from "./payroll/ShiftLogs";
import { PayrollLedger } from "./payroll/PayrollLedger";
import { PrintablePayslip } from "./payroll/PrintablePayslip";
import { PayoutLedger } from "./payroll/types";

export default function BranchPayrollManager() {
  const {
    shifts,
    payouts,
    cashiers,
    hubs,
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
  } = usePayroll();

  const [printData, setPrintData] = useState<PayoutLedger | null>(null);
  const [alertState, setAlertState] = useState<{isOpen: boolean, message: string, type: 'info'|'success'|'error'}>({isOpen: false, message: "", type: "info"});
  const customAlert = (message: string, type: 'info'|'success'|'error' = 'info') => setAlertState({isOpen: true, message, type});

  useEffect(() => {
    if (printData) {
      setTimeout(() => {
        window.print();
        // Clear it after printing so subsequent prints don't flash old data
        setTimeout(() => setPrintData(null), 500); 
      }, 100);
    }
  }, [printData]);

  return (
    <div className="space-y-8">
      <PayrollCalculator
        cashiers={cashiers}
        hubs={hubs}
        selectedCashier={selectedCashier}
        setSelectedCashier={setSelectedCashier}
        selectedHub={selectedHub}
        setSelectedHub={setSelectedHub}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        calcResult={calcResult}
        setCalcResult={setCalcResult}
        submitting={submitting}
        handleCalculate={handleCalculate}
        handlePay={handlePay}
        onPaySuccess={() => customAlert("Direct payout settles successfully. Payroll recorded.", "success")}
      />

      <ShiftLogs shifts={shifts} />

      <PayrollLedger payouts={payouts} setPrintData={setPrintData} />

      <AlertModal 
        isOpen={alertState.isOpen}
        title={alertState.type === 'error' ? "Action Failed" : alertState.type === 'success' ? "Success" : "Information"}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
      />

      <PrintablePayslip printData={printData} />
    </div>
  );
}
