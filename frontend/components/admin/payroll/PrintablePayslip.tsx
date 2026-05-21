import { PayoutLedger } from "./types";

interface PrintablePayslipProps {
  printData: PayoutLedger | null;
}

export function PrintablePayslip({ printData }: PrintablePayslipProps) {
  if (!printData) return null;

  return (
    <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-8">
      <div className="max-w-sm mx-auto border-2 border-brand-earth p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black uppercase tracking-widest text-brand-earth">Pastil ni Liling</h1>
          <p className="text-xs font-bold text-brand-earth/60 uppercase tracking-widest">Official Payroll Receipt</p>
          <p className="text-[10px] text-brand-earth/40 uppercase tracking-widest">{printData.hub.name}</p>
        </div>
        <div className="border-y-2 border-brand-earth border-dashed py-4 space-y-2">
          <div className="flex justify-between text-xs font-bold text-brand-earth">
            <span>Cashier</span>
            <span>{printData.user.name}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-brand-earth">
            <span>Period</span>
            <span>{printData.start_date} to {printData.end_date}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-brand-earth">
            <span>Base Shift Pay</span>
            <span>₱ {parseFloat(printData.base_pay).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-brand-earth">
            <span>POS Commission</span>
            <span>₱ {parseFloat(printData.commission_pay).toLocaleString()}</span>
          </div>
        </div>
        <div className="border-t-2 border-brand-earth border-solid py-4 flex justify-between text-lg font-black text-brand-earth">
          <span>Total Settled</span>
          <span>₱ {parseFloat(printData.total_pay).toLocaleString()}</span>
        </div>
        <div className="text-center pt-8">
          <p className="text-[9px] font-bold text-brand-earth/40 uppercase tracking-widest">Thank you for your hard work!</p>
          <p className="text-[8px] text-brand-earth/30 uppercase tracking-widest mt-1">Ref: {printData.id}-{Date.now()}</p>
        </div>
      </div>
    </div>
  );
}
