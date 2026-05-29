import { CircleNotch } from "@phosphor-icons/react";

interface PayrollCalculatorProps {
  cashiers: any[];
  hubs: any[];
  selectedCashier: string;
  setSelectedCashier: (val: string) => void;
  selectedHub: string;
  setSelectedHub: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  calcResult: any;
  setCalcResult: (val: any) => void;
  submitting: boolean;
  handleCalculate: () => void;
  handlePay: (onSuccess: () => void) => void;
  onPaySuccess: () => void;
}

export function PayrollCalculator({
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
  handlePay,
  onPaySuccess
}: PayrollCalculatorProps) {
  return (
    <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6">
      <div>
        <h2 className="text-sm font-bold text-brand-earth uppercase tracking-wider">Payout Calculator</h2>
        <p className="text-[10px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Calculate shift earnings and 5% sales commissions to generate staff payslips.</p>
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
              onClick={() => handlePay(onPaySuccess)}
              disabled={submitting}
              className="bg-brand-earth hover:bg-brand-earth/95 text-white font-bold uppercase tracking-wider text-[8px] px-4 py-1.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 min-w-[140px]"
            >
              {submitting ? <CircleNotch weight="bold" className="animate-spin text-[10px]" /> : "Settle & Disburse Pay"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
