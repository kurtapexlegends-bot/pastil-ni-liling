import React from "react";

interface POSChannelSelectorProps {
  posChannel: string;
  setPosChannel: (channel: string) => void;
  posPaymentMethod: string;
  setPosPaymentMethod: (method: string) => void;
}

export default function POSChannelSelector({
  posChannel,
  setPosChannel,
  posPaymentMethod,
  setPosPaymentMethod,
}: POSChannelSelectorProps) {
  return (
    <div className="space-y-4">
      {/* POS Sales Channel Selector */}
      <div className="space-y-2">
        <span className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">POS Sales Channel</span>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "walk_in", label: "Walk-in" },
            { value: "grab", label: "Grab" },
            { value: "foodpanda", label: "Foodpanda" },
            { value: "shopee", label: "Shopee" },
            { value: "tiktok", label: "TikTok" }
          ].map((ch) => {
            const isSelected = posChannel === ch.value;
            let activeClass = 'bg-brand-earth text-white border-brand-earth shadow-sm';
            if (isSelected) {
              if (ch.value === 'grab') activeClass = 'bg-emerald-600 border-emerald-600 text-white shadow-sm';
              else if (ch.value === 'foodpanda') activeClass = 'bg-pink-600 border-pink-600 text-white shadow-sm';
              else if (ch.value === 'shopee') activeClass = 'bg-orange-600 border-orange-600 text-white shadow-sm';
              else if (ch.value === 'tiktok') activeClass = 'bg-neutral-900 border-neutral-900 text-white shadow-sm';
            }
            
            return (
              <button
                key={ch.value}
                type="button"
                onClick={() => setPosChannel(ch.value)}
                className={`py-3 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all active:scale-[0.95] ${
                  isSelected 
                    ? activeClass 
                    : 'bg-white border-gray-100 text-brand-earth/40 hover:border-brand-green hover:text-brand-green'
                }`}
              >
                {ch.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment Selector */}
      <div className="space-y-2">
        <span className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Booths Payment Type</span>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'cash', label: 'Cash' },
            { value: 'gcash', label: 'GCash' },
            { value: 'paymaya', label: 'PayMaya' },
            { value: 'cod', label: 'COD' }
          ].map((ch) => {
            const isSelected = posPaymentMethod === ch.value;
            let activeClass = 'bg-brand-earth text-white border-brand-earth shadow-sm';
            if (isSelected) {
              if (ch.value === 'cash') activeClass = 'bg-emerald-700 border-emerald-700 text-white shadow-sm';
              else if (ch.value === 'gcash') activeClass = 'bg-blue-600 border-blue-600 text-white shadow-sm';
              else if (ch.value === 'paymaya') activeClass = 'bg-indigo-600 border-indigo-600 text-white shadow-sm';
            }
            
            return (
              <button
                key={ch.value}
                type="button"
                onClick={() => setPosPaymentMethod(ch.value)}
                className={`py-2.5 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all active:scale-[0.95] ${
                  isSelected 
                    ? activeClass 
                    : 'bg-white border-gray-100 text-brand-earth/40 hover:border-brand-green hover:text-brand-green'
                }`}
              >
                {ch.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
