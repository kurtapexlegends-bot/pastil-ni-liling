"use client";

import Image from "next/image";
import Link from "next/link";
import { CartItem } from "@/types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
}

export default function CartDrawer({ isOpen, onClose, items, onUpdateQuantity, onRemove }: CartDrawerProps) {
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
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        <header className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tighter">Your Basket</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-earth/40">{items.length} items selected</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
              <span className="text-5xl">🛍️</span>
              <p className="text-xs font-black uppercase tracking-widest">Your basket is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                <div className="relative w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                  <Image src={item.image_url || "/hero.png"} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="text-sm font-black tracking-tight leading-tight">{item.name}</h3>
                    <p className="text-[10px] font-bold text-brand-green uppercase tracking-widest mt-1">₱{item.price}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-full px-3 py-1">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="text-lg font-bold hover:text-brand-green"
                      >-</button>
                      <span className="text-xs font-black">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="text-lg font-bold hover:text-brand-green"
                      >+</button>
                    </div>
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="text-[10px] font-black uppercase tracking-widest text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="p-8 bg-gray-50 space-y-6">
          <div className="flex justify-between items-end">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-earth/40">Subtotal</p>
            <p className="text-3xl font-black tracking-tighter">₱{subtotal.toFixed(2)}</p>
          </div>
          
          <Link 
            href="/checkout"
            className={`block w-full text-center bg-brand-earth text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-green transition-all shadow-xl shadow-brand-earth/10 ${items.length === 0 ? 'opacity-30 pointer-events-none' : ''}`}
          >
            Proceed to Checkout
          </Link>
          
          <p className="text-[8px] text-center font-bold uppercase tracking-widest opacity-30">
            Shipping & taxes calculated at checkout
          </p>
        </footer>
      </div>
    </div>
  );
}
