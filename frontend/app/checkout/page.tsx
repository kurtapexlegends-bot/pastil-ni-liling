"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartItem } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [formData, setFormData] = useState({
    shipping_address: "",
    contact_number: "",
    payment_method: "gcash",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const deliveryFee = 45; // Flat fee for demo
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setLoading(true);
    setError("");

    const payload = {
      ...formData,
      total_amount: total,
      items: items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/api/orders", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.removeItem("cart");
        router.push("/checkout/success");
      } else {
        setError("Failed to place order. Please check your details.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-brand-earth">
      <nav className="h-20 bg-white border-b border-gray-100 flex items-center px-6">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <Link href="/menu" className="flex items-center gap-3">
            <span className="text-xl">←</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Menu</span>
          </Link>
          <div className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="Logo" width={32} height={32} className="rounded-full" />
            <span className="text-xs font-black uppercase tracking-tighter">Pastil ni Liling</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-16">
        {/* Form Section */}
        <section className="space-y-12">
          <header className="space-y-4">
            <h1 className="text-4xl font-black tracking-tighter">Checkout.</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-earth/40">Provide your delivery details</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-brand-earth/60">Delivery Address</label>
                 <textarea 
                   required
                   className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand-green outline-none transition-all h-24 resize-none shadow-sm"
                   placeholder="Street, Barangay, City, Landmark"
                   value={formData.shipping_address}
                   onChange={(e) => setFormData({...formData, shipping_address: e.target.value})}
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-brand-earth/60">Contact Number</label>
                 <input 
                   required
                   className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand-green outline-none transition-all shadow-sm"
                   placeholder="0917 XXX XXXX"
                   value={formData.contact_number}
                   onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-brand-earth/60">Payment Method</label>
                 <div className="grid grid-cols-3 gap-3">
                    {['gcash', 'paymaya', 'cod'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setFormData({...formData, payment_method: method})}
                        className={`py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                          formData.payment_method === method 
                            ? 'bg-brand-earth text-white border-brand-earth shadow-lg' 
                            : 'bg-white border-gray-100 text-brand-earth/40 hover:border-brand-green'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                 </div>
               </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || items.length === 0}
              className="w-full bg-brand-green text-white py-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-green/20 disabled:opacity-30"
            >
              {loading ? "Processing..." : `Place Order (₱${total.toFixed(2)})`}
            </button>
            {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}
          </form>
        </section>

        {/* Summary Section */}
        <aside className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-brand-earth/5 p-12 h-fit space-y-8 lg:sticky lg:top-32">
          <h2 className="text-xl font-black tracking-tighter">Order Summary</h2>
          
          <div className="space-y-6 max-h-64 overflow-y-auto pr-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex gap-4">
                  <span className="text-[10px] font-black text-brand-green bg-brand-green/10 w-6 h-6 rounded-md flex items-center justify-center">{item.quantity}x</span>
                  <span className="text-xs font-bold text-brand-earth/70">{item.name}</span>
                </div>
                <span className="text-xs font-black">₱{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-gray-100 space-y-3">
             <div className="flex justify-between text-xs font-bold text-brand-earth/40">
                <span>Subtotal</span>
                <span>₱{subtotal.toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-xs font-bold text-brand-earth/40">
                <span>Delivery Fee</span>
                <span>₱{deliveryFee.toFixed(2)}</span>
             </div>
             <div className="flex justify-between pt-4">
                <span className="text-xs font-black uppercase tracking-widest">Total</span>
                <span className="text-2xl font-black tracking-tighter">₱{total.toFixed(2)}</span>
             </div>
          </div>

          <div className="p-6 bg-brand-yellow/10 rounded-2xl border border-brand-yellow/20 flex gap-4 items-start">
            <span className="text-xl">📍</span>
            <p className="text-[10px] font-bold leading-relaxed text-brand-earth/70">
              Orders are typically delivered within <span className="text-brand-earth">30-45 minutes</span> depending on your distance from our nearest hub.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
