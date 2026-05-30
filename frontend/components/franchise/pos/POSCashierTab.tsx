"use client";

import React, { useState } from "react";
import { Warning, CircleNotch, Package } from "@phosphor-icons/react";
import { formatCurrency } from "@/lib/format";
import EmptyState from "@/components/ui/EmptyState";
import { POSCartItem } from "./types";
import POSCatalog from "./POSCatalog";
import POSCart from "./POSCart";
import POSChannelSelector from "./POSChannelSelector";
import ThermalReceiptModal from "./ThermalReceiptModal";

interface POSCashierTabProps {
  hubInventory: any[];
  handleAddToPOSCart: (item: any) => void;
  offlineQueue: any[];
  isOnline: boolean;
  handleManualSync: () => void;
  isSyncing?: boolean;
  isPOSCheckingOut?: boolean;
  posCart: POSCartItem[];
  posPaymentMethod: string;
  setPosPaymentMethod: (method: string) => void;
  posChannel: string;
  setPosChannel: (channel: string) => void;
  handlePOSCheckout: () => void;
  updatePOSCartFlavor: (id: number, flavor: string) => void;
  updatePOSCartQuantity: (id: number, delta: number) => void;
  removeFromPOSCart: (id: number) => void;
}

export default function POSCashierTab({
  hubInventory,
  handleAddToPOSCart,
  offlineQueue,
  isOnline,
  handleManualSync,
  isSyncing = false,
  isPOSCheckingOut = false,
  posCart,
  posPaymentMethod,
  setPosPaymentMethod,
  posChannel,
  setPosChannel,
  handlePOSCheckout,
  updatePOSCartFlavor,
  updatePOSCartQuantity,
  removeFromPOSCart,
}: POSCashierTabProps) {
  // Receipt print modal state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any | null>(null);

  const currentTotal = posCart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  // Snapshot transaction right before clearing POS Cart
  const handleCheckoutSubmit = () => {
    if (posCart.length === 0) return;
    
    setLastReceipt({
      items: [...posCart],
      total: currentTotal,
      paymentMethod: posPaymentMethod,
      channel: posChannel,
      timestamp: new Date().toLocaleString(),
      transactionId: "TXN-" + Math.floor(100000 + Math.random() * 900000),
    });
    
    setShowReceiptModal(true);
    handlePOSCheckout();
  };

  return (
    <div className="grid lg:grid-cols-3 gap-12 pt-4 relative">
      {/* Cashier Menu grid (extracted to POSCatalog) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Branch Shelf Catalog</h2>
            <p className="text-[9px] text-brand-earth/40 font-semibold uppercase tracking-wider">Select products to add to receipt</p>
          </div>
          
          <div className="flex items-center gap-3 self-start md:self-center">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 ${
              isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
              {isOnline ? 'Network Live' : 'Offline Buffering Active'}
            </span>
          </div>
        </div>

        {offlineQueue.length > 0 && (
          <div className="bg-brand-yellow/10 border border-brand-yellow/20 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-start md:items-center gap-3">
              <Warning size={20} className="text-brand-yellow shrink-0 mt-0.5 md:mt-0" weight="fill" />
              <div>
                <p className="text-xs font-bold text-brand-earth tracking-tight">Local offline receipts waiting to sync</p>
                <p className="text-[9px] text-brand-earth/50 leading-relaxed font-semibold mt-0.5">Stall is running offline. {offlineQueue.length} sales are saved locally and will sync once internet recovers.</p>
                {offlineQueue.filter(o => (o.sync_retries || 0) >= 3).length > 0 && (
                  <p className="text-[9px] font-black text-red-500 mt-1 uppercase tracking-widest bg-red-50 inline-block px-2 py-0.5 rounded border border-red-100 animate-pulse">
                    {offlineQueue.filter(o => (o.sync_retries || 0) >= 3).length} anomalous orders require HQ manual intervention.
                  </p>
                )}
              </div>
            </div>
            <button 
              onClick={handleManualSync}
              disabled={isSyncing}
              className="bg-brand-earth text-white px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-brand-green transition-all shadow-sm shrink-0 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait"
            >
              {isSyncing ? (
                <>
                  <CircleNotch size={14} className="animate-spin" />
                  Syncing...
                </>
              ) : "Retry Sync"}
            </button>
          </div>
        )}

        {/* Modular Product Catalog Grid */}
        <POSCatalog 
          hubInventory={hubInventory} 
          onAddToPOSCart={handleAddToPOSCart} 
        />
      </div>

      {/* Live Receipt Drawer */}
      <div className="space-y-6">
        <div id="pos-receipt-drawer" className="bg-white rounded-xl border border-gray-100/75 shadow-sm p-6 space-y-5 lg:sticky lg:top-8 scroll-mt-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-earth/80">Active Receipt</h2>
            <span className="text-[9px] font-bold bg-brand-green/10 text-brand-green px-3 py-1 rounded-full uppercase tracking-widest">
              {posCart.reduce((sum, item) => sum + item.quantity, 0)} Items
            </span>
          </div>

          {posCart.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={Package}
                title="Receipt is Empty"
                description="Click products in the branch catalog to assemble invoice items."
              />
            </div>
          ) : (
            <>
              {/* Modular Cart List */}
              <POSCart
                posCart={posCart}
                updatePOSCartFlavor={updatePOSCartFlavor}
                updatePOSCartQuantity={updatePOSCartQuantity}
                removeFromPOSCart={removeFromPOSCart}
              />

              <div className="pt-4 border-t border-gray-100 space-y-4">
                {/* Modular Sales Channel & Payment Type Selectors */}
                <POSChannelSelector
                  posChannel={posChannel}
                  setPosChannel={setPosChannel}
                  posPaymentMethod={posPaymentMethod}
                  setPosPaymentMethod={setPosPaymentMethod}
                />

                {/* Total Calculation */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-earth/40">Amount Due</span>
                  <span className="text-lg font-bold text-brand-earth">
                    {formatCurrency(currentTotal)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCheckoutSubmit}
                  disabled={isPOSCheckingOut}
                  className="w-full bg-brand-green text-white py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-brand-green/90 transition-all shadow-md shadow-brand-green/10 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait"
                >
                  {isPOSCheckingOut ? (
                    <>
                      <CircleNotch size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : "Complete Cashier Checkout"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modular High-Fidelity Printable Thermal Receipt Overlay */}
      <ThermalReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        receipt={lastReceipt}
      />
    </div>
  );
}
