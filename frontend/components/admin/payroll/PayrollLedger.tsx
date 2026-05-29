import { PayoutLedger } from "./types";
import { Printer } from "@phosphor-icons/react";

interface PayrollLedgerProps {
  payouts: PayoutLedger[];
  setPrintData: (payout: PayoutLedger) => void;
}

export function PayrollLedger({ payouts, setPrintData }: PayrollLedgerProps) {
  return (
    <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
      <div>
        <h2 className="text-sm font-bold text-brand-earth uppercase tracking-wider">Payout Ledger</h2>
        <p className="text-[10px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Permanent records of completed staff payouts, base pay, and commissions.</p>
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
                <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40 text-center">Receipt</th>
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
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => setPrintData(p)}
                      className="bg-brand-earth/5 hover:bg-brand-earth/10 text-brand-earth p-2 rounded-full transition-colors inline-flex"
                      aria-label="Print Receipt"
                    >
                      <Printer size={16} weight="bold" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
