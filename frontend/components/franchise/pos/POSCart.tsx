import React from "react";
import { formatCurrency } from "@/lib/format";
import { POSCartItem } from "./types";

interface POSCartProps {
  posCart: POSCartItem[];
  updatePOSCartFlavor: (id: number, flavor: string) => void;
  updatePOSCartQuantity: (id: number, delta: number) => void;
  removeFromPOSCart: (id: number) => void;
}

export default function POSCart({
  posCart,
  updatePOSCartFlavor,
  updatePOSCartQuantity,
  removeFromPOSCart,
}: POSCartProps) {
  return (
    <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1 animate-in fade-in duration-300">
      {posCart.map((item) => (
        <div key={item.id} className="flex justify-between items-center text-xs py-2.5 border-b border-gray-50">
          <div className="space-y-0.5 flex-1 min-w-0 pr-2">
            <p className="font-semibold text-brand-earth tracking-tight truncate">{item.name}</p>
            {item.quantity >= item.maxStock && (
              <p className="text-[8px] text-amber-600 font-bold uppercase tracking-wider animate-pulse">Max shelf stock reached ({item.maxStock})</p>
            )}
            <div className="flex gap-2 items-center">
              <p className="text-[10px] text-brand-earth/40 font-semibold">{formatCurrency(item.price)} each</p>
              <span className="text-[9px] text-brand-earth/30">|</span>
              <select
                value={item.flavor_modifier || "Original"}
                onChange={(e) => updatePOSCartFlavor(item.id, e.target.value)}
                className="text-[9px] font-bold text-brand-green bg-transparent border-none outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green p-0 cursor-pointer rounded"
              >
                <option value="Original">Original</option>
                <option value="Spicy">Spicy</option>
                <option value="Toasted">Toasted</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`flex items-center border rounded-full overflow-hidden bg-gray-50/50 shadow-sm transition-all duration-300 ${
              item.quantity >= item.maxStock 
                ? 'border-amber-300 ring-2 ring-amber-100' 
                : 'border-gray-100'
            }`}>
              <button 
                type="button" 
                onClick={() => updatePOSCartQuantity(item.id, -1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-brand-earth/60 font-bold transition-colors active:scale-[0.9]"
              >
                -
              </button>
              <span className="px-2.5 text-[10px] font-bold text-brand-earth">{item.quantity}</span>
              <button 
                type="button" 
                onClick={() => updatePOSCartQuantity(item.id, 1)}
                disabled={item.quantity >= item.maxStock}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-brand-earth/60 font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.9]"
              >
                +
              </button>
            </div>
            
            <span className="font-bold text-brand-earth w-14 text-right">{formatCurrency(parseFloat(item.price) * item.quantity)}</span>
            
            <button 
              type="button" 
              onClick={() => removeFromPOSCart(item.id)}
              className="w-8 h-8 flex items-center justify-center text-rose-400 hover:text-rose-600 font-bold text-sm transition-colors rounded-full hover:bg-rose-50"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
