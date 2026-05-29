"use client";

import { useState, useEffect } from "react";
import AlertModal from "../../ui/AlertModal";
import { usePayroll } from "./usePayroll";
import { PayrollCalculator } from "./PayrollCalculator";
import { ShiftLogs } from "./ShiftLogs";
import { PayrollLedger } from "./PayrollLedger";
import { PrintablePayslip } from "./PrintablePayslip";
import { PayoutLedger } from "./types";
import SegmentedControl from "@/components/ui/SegmentedControl";

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

  const [activeSubTab, setActiveSubTab] = useState<'shifts' | 'ledger'>('shifts');
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Sticky Control Panel */}
        <div className="lg:col-span-1">
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
            onPaySuccess={() => customAlert("Direct payout settled successfully. Payroll recorded.", "success")}
          />
        </div>

        {/* Right Tabbed Log Lists */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-3 rounded-2xl border border-gray-100/80 shadow-sm">
            <SegmentedControl
              value={activeSubTab}
              onChange={setActiveSubTab}
              options={[
                { id: "shifts", label: "Active Shift Registry" },
                { id: "ledger", label: "Payout Ledger Logs" }
              ]}
            />
          </div>

          {activeSubTab === "shifts" ? (
            <ShiftLogs shifts={shifts} />
          ) : (
            <PayrollLedger payouts={payouts} setPrintData={setPrintData} />
          )}
        </div>
      </div>

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
