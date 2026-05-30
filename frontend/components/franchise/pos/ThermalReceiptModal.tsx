import React from "react";
import { Receipt, Printer } from "@phosphor-icons/react";
import { formatCurrency } from "@/lib/format";
import { POSCartItem } from "./types";

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: {
    items: POSCartItem[];
    total: number;
    paymentMethod: string;
    channel: string;
    timestamp: string;
    transactionId: string;
  } | null;
}

export default function ThermalReceiptModal({
  isOpen,
  onClose,
  receipt,
}: ThermalReceiptModalProps) {
  if (!isOpen || !receipt) return null;

  return (
    <div className="fixed inset-0 bg-brand-earth/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className="bg-brand-earth text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Receipt size={18} weight="bold" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">Transaction Completed</span>
          </div>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {/* Receipt Tape Area */}
        <div id="print-area" className="p-6 overflow-y-auto space-y-4 text-brand-earth font-mono text-[10px] bg-gray-50/30">
          <div className="text-center space-y-1">
            <h2 className="text-sm font-black uppercase tracking-tight text-brand-earth">Pastil ni Liling</h2>
            <p className="text-[8px] font-bold uppercase tracking-widest text-brand-earth/40">Branch Stall Hub Terminal</p>
            <p className="text-[8px] text-brand-earth/50">Reconciliation Outpost ID: {receipt.transactionId}</p>
            <p className="text-[8px] text-brand-earth/50">{receipt.timestamp}</p>
          </div>

          {/* Dotted separator line */}
          <div className="border-t-2 border-dashed border-gray-200 my-2"></div>

          {/* Transaction Meta info */}
          <div className="grid grid-cols-2 gap-y-1">
            <span className="text-brand-earth/40 uppercase font-bold">Sales Channel:</span>
            <span className="text-right font-black uppercase">{receipt.channel.replace(/_/g, ' ')}</span>
            
            <span className="text-brand-earth/40 uppercase font-bold">Payment Method:</span>
            <span className="text-right font-black uppercase">{receipt.paymentMethod}</span>
          </div>

          {/* Dotted separator line */}
          <div className="border-t-2 border-dashed border-gray-200 my-2"></div>

          {/* Mapped products list */}
          <div className="space-y-3">
            {receipt.items.map((item) => (
              <div key={item.id} className="space-y-0.5">
                <div className="flex justify-between font-bold">
                  <span>{item.name}</span>
                  <span>{formatCurrency(parseFloat(item.price) * item.quantity)}</span>
                </div>
                <div className="flex justify-between text-[8px] text-brand-earth/50">
                  <span>{item.flavor_modifier || "Original"} × {item.quantity} units</span>
                  <span>@{formatCurrency(item.price)} each</span>
                </div>
              </div>
            ))}
          </div>

          {/* Dotted separator line */}
          <div className="border-t-2 border-dashed border-gray-200 my-2"></div>

          {/* Order total */}
          <div className="flex justify-between items-center text-sm font-black uppercase pt-1 text-brand-earth">
            <span>Total Due:</span>
            <span>{formatCurrency(receipt.total)}</span>
          </div>

          {/* Dotted separator line */}
          <div className="border-t-2 border-dashed border-gray-200 my-2"></div>

          {/* Center message */}
          <div className="text-center py-2 space-y-1 text-brand-earth/40 font-bold uppercase text-[7px] tracking-widest">
            <p>Thank you for dining with us!</p>
            <p>Support your local farmers</p>
            <p>*** Terminal End ***</p>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.print();
              }
            }}
            className="flex-1 bg-white hover:bg-gray-100 text-brand-earth border border-gray-200 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
          >
            <Printer size={12} weight="bold" />
            Print Invoice
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all flex items-center justify-center shadow-sm active:scale-[0.98]"
          >
            New Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
