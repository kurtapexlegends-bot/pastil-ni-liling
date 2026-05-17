"use client";

import Link from "next/link";
import Image from "next/image";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-8 max-w-md animate-in fade-in zoom-in duration-700">
        <div className="relative w-48 h-48 mx-auto">
           <div className="absolute inset-0 bg-brand-green/20 rounded-full animate-ping"></div>
           <div className="relative bg-brand-green w-48 h-48 rounded-full flex items-center justify-center text-6xl shadow-2xl shadow-brand-green/30">
             ✅
           </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter">Salamat!</h1>
          <p className="text-brand-earth/60 font-medium">
            Your order has been placed successfully. We're starting to prepare your authentic Mindanao feast right now!
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center gap-4 text-left">
          <div className="text-3xl">🛵</div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-green">On the way soon</p>
            <p className="text-xs font-bold text-brand-earth/60 leading-tight">Keep your phone nearby for delivery updates.</p>
          </div>
        </div>

        <div className="pt-8 space-y-4">
          <Link href="/menu" className="block w-full bg-brand-earth text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-green transition-all shadow-xl shadow-brand-earth/10">
            Back to Menu
          </Link>
          <Link href="/" className="block w-full text-[10px] font-black uppercase tracking-widest text-brand-earth/40 hover:text-brand-earth transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
