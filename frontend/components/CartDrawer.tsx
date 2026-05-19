"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "@phosphor-icons/react";
import { CartItem } from "@/types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  onCheckout?: () => void;
  checkoutText?: string;
}

export default function CartDrawer({ isOpen, onClose, items, onUpdateQuantity, onRemove, onCheckout, checkoutText }: CartDrawerProps) {
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
        <header className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold tracking-tight text-brand-earth">Your Basket</h2>
            <p className="text-[10px] font-medium text-brand-earth/40">{items.length} items selected</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-xs text-brand-earth/70"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-30">
              <ShoppingBag size={48} className="text-brand-earth mx-auto" />
              <p className="text-[10px] font-semibold uppercase tracking-wider">Your basket is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3.5 group">
                <div className="relative w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={item.image_url || "/hero.png"} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <h3 className="text-xs font-semibold text-brand-earth leading-tight">{item.name}</h3>
                    <p className="text-[10px] font-semibold text-brand-green mt-0.5">₱{item.price}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-2.5 py-0.5 border border-gray-100">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="text-xs font-bold text-brand-earth/60 hover:text-brand-green"
                      >-</button>
                      <span className="text-[11px] font-semibold text-brand-earth">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="text-xs font-bold text-brand-earth/60 hover:text-brand-green"
                      >+</button>
                    </div>
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="text-[9px] font-semibold uppercase tracking-wider text-red-500 hover:text-red-600 opacity-60 group-hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="p-6 bg-gray-50 space-y-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-earth/40">Subtotal</p>
            <p className="text-xl font-bold text-brand-earth">₱{subtotal.toFixed(2)}</p>
          </div>
          
          {onCheckout ? (
            <button
              onClick={onCheckout}
              disabled={items.length === 0}
              className={`block w-full text-center bg-brand-earth hover:bg-brand-green text-white py-2.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-sm ${items.length === 0 ? 'opacity-30 pointer-events-none' : ''}`}
            >
              {checkoutText || "Place Bulk Order"}
            </button>
          ) : (
            <Link 
              href="/checkout"
              className={`block w-full text-center bg-brand-earth hover:bg-brand-green text-white py-2.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-sm ${items.length === 0 ? 'opacity-30 pointer-events-none' : ''}`}
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
