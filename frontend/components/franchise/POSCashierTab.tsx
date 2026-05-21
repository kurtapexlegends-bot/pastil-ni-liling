"use client";

import { Warning, Package } from "@phosphor-icons/react";

interface POSCartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  maxStock: number;
  flavor_modifier?: string;
}

interface POSCashierTabProps {
  hubInventory: any[];
  handleAddToPOSCart: (item: any) => void;
  offlineQueue: any[];
  isOnline: boolean;
  handleManualSync: () => void;
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
  const currentTotal = posCart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  return (
    <div className="grid lg:grid-cols-3 gap-12 pt-4">
      {/* Cashier Menu Grid */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Branch Shelf Catalog</h2>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 ${
              isOnline ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
              {isOnline ? 'Network Live' : 'Offline Buffering Active'}
            </span>
          </div>
        </div>

        {offlineQueue.length > 0 && (
          <div className="bg-brand-yellow/10 border border-brand-yellow/20 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <Warning size={20} className="text-brand-yellow shrink-0" weight="fill" />
              <div>
                <p className="text-xs font-bold text-brand-earth tracking-tight">Local offline receipts waiting to sync</p>
                <p className="text-[9px] text-brand-earth/50 leading-relaxed font-semibold mt-0.5">Stall is running offline. {offlineQueue.length} sales are saved locally and will sync once internet recovers.</p>
              </div>
            </div>
            <button 
              onClick={handleManualSync}
              className="bg-brand-earth text-white px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-brand-green transition-all shadow-sm shrink-0"
            >
              Retry Sync
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {hubInventory.length === 0 ? (
            <div className="col-span-2 bg-white border border-gray-100 p-8 rounded-xl text-center space-y-2">
              <p className="text-sm font-semibold text-brand-earth/40">No retail stock available at this branch.</p>
              <p className="text-[10px] text-brand-earth/30 uppercase tracking-widest">Order supplies from HQ commissary using the Logistics tab first.</p>
            </div>
          ) : (
            hubInventory.map((item: any) => (
              <div 
                key={item.id} 
                onClick={() => item.stock_quantity > 0 && handleAddToPOSCart(item)}
                className={`bg-white p-5 rounded-xl border border-gray-100/60 shadow-sm hover:border-brand-green/20 transition-all duration-300 flex flex-col justify-between space-y-4 cursor-pointer relative ${
                  item.stock_quantity === 0 ? 'opacity-45 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[8px] bg-brand-earth/5 text-brand-earth/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{item.product?.category}</span>
                    <h3 className="text-sm font-bold text-brand-earth tracking-tight leading-tight">{item.product?.name}</h3>
                    <p className="text-sm font-bold text-brand-green mt-1">₱{parseFloat(item.product?.price).toFixed(2)}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-3 py-1 rounded-full ${
                    item.stock_quantity === 0 
                      ? 'bg-red-50 text-red-600' 
                      : item.stock_quantity < 30 
                      ? 'bg-yellow-50 text-yellow-600' 
                      : 'bg-green-50 text-green-600'
                  }`}>
                    {item.stock_quantity === 0 ? 'Out of Stock' : `${item.stock_quantity} available`}
                  </span>
                </div>
                <div className="flex justify-end pt-3 border-t border-gray-50">
                  <button 
                    disabled={item.stock_quantity === 0}
                    className="bg-brand-green text-white text-[9px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-full shadow-sm hover:bg-brand-green/90 transition-colors disabled:opacity-0"
                  >
                    + Add to Receipt
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
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
            <div className="py-16 text-center space-y-2 flex flex-col items-center justify-center">
              <Package size={36} className="text-brand-earth/30" />
              <p className="text-sm font-semibold text-brand-earth/40">Receipt is empty</p>
              <p className="text-[9px] text-brand-earth/30 uppercase tracking-widest">Tap products on the left to build order receipt</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                {posCart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs py-2.5 border-b border-gray-50">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-brand-earth tracking-tight">{item.name}</p>
                      <div className="flex gap-2 items-center">
                        <p className="text-[10px] text-brand-earth/40 font-semibold">₱{parseFloat(item.price).toFixed(2)} each</p>
                        <span className="text-[9px] text-brand-earth/30">|</span>
                        <select
                          value={item.flavor_modifier || "Original"}
                          onChange={(e) => updatePOSCartFlavor(item.id, e.target.value)}
                          className="text-[9px] font-bold text-brand-green bg-transparent border-none outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green p-0 cursor-pointer rounded"
                        >
                          <option value="Original">Original</option>
                          <option value="Spicy">Spicy</option>
                          <option value="Toasted">Toasted</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-100 rounded-full overflow-hidden bg-gray-50/50 shadow-sm">
                        <button 
                          type="button" 
                          onClick={() => updatePOSCartQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-brand-earth/60 font-bold transition-colors"
                        >
                          -
                        </button>
                        <span className="px-2.5 text-[10px] font-bold text-brand-earth">{item.quantity}</span>
                        <button 
                          type="button" 
                          onClick={() => updatePOSCartQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-brand-earth/60 font-bold transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-brand-earth w-14 text-right">₱{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                      <button 
                        type="button" 
                        onClick={() => removeFromPOSCart(item.id)}
                        className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 font-bold text-sm transition-colors rounded-full hover:bg-red-50"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-4">
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
                    ].map((ch) => (
                      <button
                        key={ch.value}
                        type="button"
                        onClick={() => setPosChannel(ch.value)}
                        className={`py-2 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-colors ${
                          posChannel === ch.value 
                            ? 'bg-brand-earth text-white border-brand-earth shadow-sm' 
                            : 'bg-white border-gray-100 text-brand-earth/40 hover:border-brand-green'
                        }`}
                      >
                        {ch.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Selector */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Booths Payment Type</span>
                  <div className="grid grid-cols-2 gap-2">
                    {['cash', 'gcash', 'paymaya', 'cod'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPosPaymentMethod(method)}
                        className={`py-2.5 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-colors ${
                          posPaymentMethod === method 
                            ? 'bg-brand-earth text-white border-brand-earth shadow-sm' 
                            : 'bg-white border-gray-100 text-brand-earth/40 hover:border-brand-green'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total calculation */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-earth/40">Amount Due</span>
                  <span className="text-lg font-bold text-brand-earth">
                    ₱{currentTotal.toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handlePOSCheckout}
                  className="w-full bg-brand-green text-white py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-brand-green/90 transition-all shadow-md shadow-brand-green/10"
                >
                  Complete Cashier Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
