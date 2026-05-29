'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/types';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  orderMethod: 'direct' | 'apps';
  setOrderMethod: (method: 'direct' | 'apps') => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
  orderMethod,
  setOrderMethod,
  onAddToCart,
}: ProductDetailModalProps) {
  // Defensive return if not open or no product loaded
  if (!isOpen || !product) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-earth/40 backdrop-blur-sm animate-fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(27,45,22,0.18)] border border-gray-100/50 grid md:grid-cols-2 animate-slide-up"
      >
        {/* Left Column: Media Cover */}
        <div className="relative aspect-square md:aspect-auto md:h-full w-full bg-gray-50 shrink-0 min-h-[240px]">
          <Image 
            src={product.image_url || "/hero.png"} 
            alt={product.name} 
            fill 
            className="object-cover" 
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 bg-white/95 rounded-full flex items-center justify-center shadow-sm hover:bg-white active:scale-95 transition-all text-xs text-brand-earth/70 cursor-pointer"
            aria-label="Close details"
          >
            ✕
          </button>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-brand-green/10 text-[9px] font-bold uppercase tracking-wider text-brand-green">
              {product.category.replace('_', ' ')}
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-brand-earth leading-tight">{product.name}</h2>
            <p className="text-xs text-brand-earth/60 leading-relaxed font-normal">{product.description}</p>
            <div className="text-xl font-black text-brand-earth">₱{product.price}</div>
          </div>

          {/* Ordering Channel Selector */}
          <div className="space-y-3">
            <p className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Select Order Option</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderMethod("direct")}
                className={`p-3 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer active:scale-[0.98] ${
                  orderMethod === "direct"
                    ? "bg-brand-earth text-white border-brand-earth shadow-sm"
                    : "bg-white border-gray-100 text-brand-earth/50 hover:border-brand-green hover:text-brand-green"
                }`}
              >
                <span>Direct Delivery</span>
                <span className="text-[7px] font-medium lowercase opacity-60">From our local branch</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderMethod("apps")}
                className={`p-3 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer active:scale-[0.98] ${
                  orderMethod === "apps"
                    ? "bg-brand-earth text-white border-brand-earth shadow-sm"
                    : "bg-white border-gray-100 text-brand-earth/50 hover:border-brand-green hover:text-brand-green"
                }`}
              >
                <span>Delivery Apps</span>
                <span className="text-[7px] font-medium lowercase opacity-60">Foodpanda & Grab</span>
              </button>
            </div>
          </div>

          {/* CTA Action Bar */}
          {orderMethod === "direct" ? (
            <div className="pt-2 space-y-2">
              <button 
                onClick={() => onAddToCart(product)}
                className="w-full bg-brand-green text-white py-3.5 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-brand-green/90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-brand-green/10 cursor-pointer"
              >
                Add to Basket
              </button>
              <p className="text-[7.5px] text-center font-bold text-brand-earth/40 uppercase tracking-wider leading-none">
                Select your nearest branch & payment option at checkout
              </p>
            </div>
          ) : (
            <div className="pt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://www.foodpanda.ph/?query=pastil+ni+liling"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#D70F64] hover:bg-[#D70F64]/95 text-white py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#D70F64]/10 text-center"
                >
                  Foodpanda
                </a>
                <a
                  href="https://food.grab.com/ph/en/restaurants?search=Pastil+ni+Liling"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#00B14F] hover:bg-[#00B14F]/95 text-white py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#00B14F]/10 text-center"
                >
                  GrabFood
                </a>
              </div>
              <p className="text-[7.5px] text-center font-bold text-brand-earth/40 uppercase tracking-wider leading-none">
                Opens the delivery app in a new browser tab
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
