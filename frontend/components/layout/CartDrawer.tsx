"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Package, X, Minus, Plus } from "@phosphor-icons/react";
import { CartItem } from "@/types";
import { formatCurrency } from "@/lib/format";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  onCheckout?: () => void;
  checkoutText?: string;
  title?: string;
  emptyText?: string;
  isWholesale?: boolean;
  isCheckingOut?: boolean;
}

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemove, 
  onCheckout, 
  checkoutText,
  title,
  emptyText,
  isWholesale = false,
  isCheckingOut = false
}: CartDrawerProps) {
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-earth/20 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <header className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold tracking-tight text-brand-earth">
              {title || (isWholesale ? "Wholesale Cart" : "Your Basket")}
            </h2>
            <p className="text-[10px] font-medium text-brand-earth/40">{items.length} items selected</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            aria-label="Close basket"
            className="w-11 h-11 min-w-[44px] min-h-[44px] bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-brand-earth/70 cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-30">
              {isWholesale ? (
                <Package size={48} className="text-brand-earth mx-auto" />
              ) : (
                <ShoppingBag size={48} className="text-brand-earth mx-auto" />
              )}
              <p className="text-[10px] font-semibold uppercase tracking-wider">
                {emptyText || (isWholesale ? "Wholesale cart is empty" : "Your basket is empty")}
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3.5 group">
                <div className="relative w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={
                      item.image_url 
                        ? item.image_url.startsWith('http://localhost/storage') 
                          ? item.image_url.replace('http://localhost/storage', 'http://127.0.0.1:8000/storage')
                          : item.image_url.startsWith('/storage/') 
                            ? `http://127.0.0.1:8000${item.image_url}` 
                            : item.image_url
                        : "/hero.png"
                    } 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <h3 className="text-xs font-semibold text-brand-earth leading-tight">{item.name}</h3>
                    <p className="text-[10px] font-semibold text-brand-green mt-0.5">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl p-1 border border-gray-100">
                      <button 
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        aria-label="Decrease quantity"
                        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-brand-earth/60 hover:text-brand-green hover:bg-white rounded-lg transition-all active:scale-90 cursor-pointer"
                      >
                        <Minus size={14} weight="bold" />
                      </button>
                      <span className="text-xs font-bold text-brand-earth min-w-[20px] text-center select-none">{item.quantity}</span>
                      <button 
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        aria-label="Increase quantity"
                        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-brand-earth/60 hover:text-brand-green hover:bg-white rounded-lg transition-all active:scale-90 cursor-pointer"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>
                    <button 
                      type="button"
                      onClick={() => onRemove(item.id)}
                      aria-label="Remove item"
                      className="min-h-[44px] min-w-[44px] px-2.5 flex items-center justify-center text-[9px] font-semibold uppercase tracking-wider text-red-500 hover:text-red-600 opacity-60 hover:opacity-100 transition-opacity cursor-pointer active:scale-95"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="p-4 md:p-6 bg-gray-50 space-y-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-earth/40">Subtotal</p>
            <p className="text-xl font-bold text-brand-earth">{formatCurrency(subtotal)}</p>
          </div>
          
          {onCheckout ? (
            <button
              type="button"
              onClick={onCheckout}
              disabled={items.length === 0 || isCheckingOut}
              className={`w-full text-center bg-brand-earth hover:bg-brand-green text-white min-h-[44px] py-3 rounded-xl text-[10px] font-semibold uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-sm flex items-center justify-center gap-2 ${(items.length === 0 || isCheckingOut) ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
            >
              {isCheckingOut ? "Processing..." : (checkoutText || "Place Bulk Order")}
            </button>
          ) : (
            <Link 
              href="/checkout"
              className={`w-full text-center bg-brand-earth hover:bg-brand-green text-white min-h-[44px] py-3 rounded-xl text-[10px] font-semibold uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-sm flex items-center justify-center ${items.length === 0 ? 'opacity-30 pointer-events-none' : ''}`}
            >
              {checkoutText || "Proceed to Checkout"}
            </Link>
          )}
          
          <p className="text-[8px] text-center font-medium uppercase tracking-wider text-brand-earth/30">
            Shipping & taxes calculated at checkout
          </p>
        </footer>
      </div>
    </div>
  );
}
