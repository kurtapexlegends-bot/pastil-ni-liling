import React from 'react';
import { InventoryBatch } from "@/types/admin";
import { Flask } from "@phosphor-icons/react";

interface BatchTrackerListProps {
  batches: InventoryBatch[];
}

export default function BatchTrackerList({ batches }: BatchTrackerListProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm animate-in fade-in duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Batch Code</th>
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Product Name</th>
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Current Qty</th>
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Hub Destination</th>
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Mfg & Expiry</th>
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Markdown Badge</th>
            </tr>
          </thead>
          <tbody>
            {batches.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                    <Flask size={48} weight="duotone" className="text-brand-earth" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-earth">
                      No batches tracked
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              batches.map((batch) => {
                const expiryDateObj = new Date(batch.expiry_date);
                const daysRemaining = Math.ceil((expiryDateObj.getTime() - Date.now()) / (1000 * 3600 * 24));
                const isNearExpiry = daysRemaining <= 3 && daysRemaining >= 0;
                return (
                  <tr key={batch.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 border-b border-gray-100 text-xs font-semibold text-brand-earth">
                      {batch.batch_number}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100 text-xs font-medium text-brand-earth/70">
                      {batch.product?.name || `Product ID: ${batch.product_id}`}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100 text-xs font-semibold text-brand-earth">
                      {batch.quantity} <span className="text-brand-earth/30 font-normal">/ {batch.initial_quantity} jars</span>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100 text-xs text-brand-earth/60 font-medium">
                      {batch.hub?.name || 'HQ Commissary (Central)'}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100 text-[10px] text-brand-earth/50">
                      <div>Mfg: {batch.manufacture_date.slice(0, 10)}</div>
                      <div>Exp: {batch.expiry_date.slice(0, 10)} ({daysRemaining} days left)</div>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100">
                      {batch.discount_triggered ? (
                        <span className="px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100">
                          30% OFF Flash Sale
                        </span>
                      ) : isNearExpiry ? (
                        <span className="px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100 animate-pulse">
                          Pending Discount
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg text-[8px] font-semibold uppercase tracking-wider text-brand-earth/30">
                          Optimal Shelf Life
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
