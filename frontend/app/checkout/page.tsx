"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { CartItem } from "@/types";
import { MapPin, Compass, CircleNotch, Sparkle, CheckCircle } from "@phosphor-icons/react";
import { formatCurrency } from "@/lib/format";

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedHubId, setSelectedHubId] = useState<string>("");
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<string>("idle"); // idle, requested, success, denied
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

    // Request customer coordinates to auto-match the nearest hub
    if (navigator.geolocation) {
      setGeoStatus("requested");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setGeoStatus("success");
        },
        (err) => {
          console.warn("Geolocation request denied or timed out.", err);
          setGeoStatus("denied");
        },
        { timeout: 10000 }
      );
    }
  }, []);

  const { data: hubsData } = useSWR("http://127.0.0.1:8000/api/hubs", (url) => fetch(url).then(res => res.json()));
  const hubs = hubsData?.success && Array.isArray(hubsData.data) ? hubsData.data : [];

  useEffect(() => {
    if (Array.isArray(hubs) && hubs.length > 0 && !selectedHubId) {
      setSelectedHubId(hubs[0].id.toString());
    }
  }, [hubs, selectedHubId]);

  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const isBulkFreeDelivery = totalQuantity >= 100;
  const deliveryFee = items.length === 0 ? 0 : (isBulkFreeDelivery ? 0 : 45);
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setLoading(true);
    setError("");

    const payload = {
      ...formData,
      hub_id: selectedHubId ? parseInt(selectedHubId) : null,
      latitude: coordinates?.latitude || null,
      longitude: coordinates?.longitude || null,
      total_amount: total,
      items: items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    try {
      const token = localStorage.getItem("token");
      const idempotencyKey = crypto.randomUUID();
      const res = await fetch("http://127.0.0.1:8000/api/orders", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
          "X-Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.removeItem("cart");
        router.push("/checkout/success");
      } else {
        setError(data.message || "Failed to place order. Please check your details.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-brand-earth flex flex-col">
      <Navbar variant="checkout" />

      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-24 pb-10 flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 lg:gap-12 w-full flex-1">
        {/* Form Section */}
        <section className="space-y-8">
          <header className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-brand-earth">Checkout</h1>
            <p className="text-xs text-brand-earth/50">Provide your delivery details below</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
               <div className="space-y-1.5">
                 <div className="flex justify-between items-center">
                   <label className="text-[10px] font-semibold uppercase tracking-wider text-brand-earth/50">Fulfilling Spoke Hub (Branch)</label>
                   {geoStatus === "success" && (
                     <span className="text-[8px] bg-brand-green/15 text-brand-green border border-brand-green/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                        <MapPin size={10} weight="bold" />
                        Auto-Routing Active
                      </span>
                   )}
                   {geoStatus === "requested" && (
                     <span className="text-[8px] bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                        <Compass size={10} weight="bold" className="animate-spin" style={{ animationDuration: '3s' }} />
                        Locating...
                      </span>
                   )}
                 </div>
                 <select
                   required
                   value={selectedHubId}
                   onChange={(e) => setSelectedHubId(e.target.value)}
                   className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 min-h-[44px] font-medium focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green/50 outline-none transition-all shadow-sm"
                 >
                   {!Array.isArray(hubs) || hubs.length === 0 ? (
                     <option value="">No active hubs available</option>
                   ) : (
                     hubs.map((hub: any) => (
                       <option key={hub.id} value={hub.id}>
                         {hub.name} — {hub.address}
                       </option>
                     ))
                   )}
                 </select>
               </div>
               <div className="space-y-1.5">
                 <label className="text-[10px] font-semibold uppercase tracking-wider text-brand-earth/50">Delivery Address</label>
                 <textarea 
                   required
                   className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 font-medium focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green/50 outline-none transition-all h-24 resize-none shadow-sm"
                   placeholder="Street, Barangay, City, Landmark"
                   value={formData.shipping_address}
                   onChange={(e) => setFormData({...formData, shipping_address: e.target.value})}
                 />
               </div>
               <div className="space-y-1.5">
                 <label className="text-[10px] font-semibold uppercase tracking-wider text-brand-earth/50">Contact Number</label>
                 <input 
                   required
                   className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 min-h-[44px] font-medium focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green/50 outline-none transition-all shadow-sm"
                   placeholder="0917 XXX XXXX"
                   value={formData.contact_number}
                   onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                 />
               </div>
               <div className="space-y-1.5">
                 <label className="text-[10px] font-semibold uppercase tracking-wider text-brand-earth/50">Payment Method</label>
                 <div className="grid grid-cols-3 gap-2">
                    {['gcash', 'paymaya', 'cod'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setFormData({...formData, payment_method: method})}
                        className={`min-h-[44px] py-3 rounded-lg border text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center ${
                          formData.payment_method === method 
                            ? 'bg-brand-earth text-white border-brand-earth shadow-sm' 
                            : 'bg-white border-gray-100 text-brand-earth/40 hover:border-brand-green'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                 </div>
               </div>

               {/* Delivery Apps Shortcut */}
               <div className="pt-4 border-t border-dashed border-gray-200/60 space-y-3">
                 <p className="text-[9px] font-black uppercase tracking-widest text-brand-earth/40">Or Order via Delivery Apps</p>
                 <div className="grid grid-cols-2 gap-2">
                   <a
                     href="https://www.foodpanda.ph/?query=pastil+ni+liling"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="bg-[#D70F64] hover:bg-[#D70F64]/95 text-white py-3 min-h-[44px] rounded-xl text-[9px] font-bold uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#D70F64]/10 text-center cursor-pointer"
                   >
                     Foodpanda
                   </a>
                   <a
                     href="https://food.grab.com/ph/en/restaurants?search=Pastil+ni+Liling"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="bg-[#00B14F] hover:bg-[#00B14F]/95 text-white py-3 min-h-[44px] rounded-xl text-[9px] font-bold uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#00B14F]/10 text-center cursor-pointer"
                   >
                     GrabFood
                   </a>
                 </div>
                 <p className="text-[7.5px] text-center font-bold text-brand-earth/40 uppercase tracking-wider leading-none">
                   Skip direct hub delivery and order from our official store on foodpanda/grab
                 </p>
               </div>
             </div>

            <button 
              type="submit" 
              disabled={loading || items.length === 0}
              className="w-full bg-brand-green text-white py-3 rounded-xl text-[10px] font-semibold uppercase tracking-wider hover:bg-brand-green/90 transition-colors shadow-sm disabled:opacity-30 flex items-center justify-center gap-2"
            >
              {loading ? <CircleNotch weight="bold" className="animate-spin text-sm" /> : `Place Order (${formatCurrency(total)})`}
            </button>
            {error && <p className="text-xs font-medium text-red-500 text-center">{error}</p>}
          </form>
        </section>

        {/* Summary Section */}
        <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit space-y-6 lg:sticky lg:top-24">
          <h2 className="text-base font-bold tracking-tight text-brand-earth">Order Summary</h2>
          
          <div className="space-y-4 max-h-52 overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-semibold text-brand-green bg-brand-green/10 w-5 h-5 rounded-md flex items-center justify-center">{item.quantity}x</span>
                  <span className="text-xs font-medium text-brand-earth/80">{item.name}</span>
                </div>
                 <span className="text-xs font-semibold text-brand-earth">{formatCurrency(parseFloat(item.price) * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="pt-5 border-t border-gray-100 space-y-2.5">
             <div className="flex justify-between text-[11px] text-brand-earth/40">
                <span>Subtotal ({totalQuantity} {totalQuantity === 1 ? 'pc' : 'pcs'})</span>
                <span className="font-semibold text-brand-earth/60">{formatCurrency(subtotal)}</span>
             </div>
             <div className="flex justify-between text-[11px] text-brand-earth/40">
                <span>Delivery Fee</span>
                {isBulkFreeDelivery ? (
                  <span className="font-bold text-brand-green flex items-center gap-1.5 text-[10px]">
                    <span className="line-through text-brand-earth/30 font-normal">₱45.00</span>
                    <span className="bg-brand-green/10 text-brand-green px-1.5 py-0.5 rounded font-black text-[9px]">FREE</span>
                  </span>
                ) : (
                  <span className="font-semibold text-brand-earth/60">{formatCurrency(deliveryFee)}</span>
                )}
             </div>
             <div className="flex justify-between pt-3 border-t border-gray-50 items-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-earth/50">Total</span>
                <span className="text-lg font-bold text-brand-earth">{formatCurrency(total)}</span>
             </div>
          </div>

          {isBulkFreeDelivery ? (
            <div className="p-3.5 bg-brand-green/10 rounded-xl border border-brand-green/20 flex gap-2.5 items-center">
              <CheckCircle size={16} weight="bold" className="text-brand-green shrink-0" />
              <p className="text-[10px] font-semibold text-brand-green">
                Bulk Catering Promo Applied: Free delivery for 100+ pcs!
              </p>
            </div>
          ) : totalQuantity > 0 && totalQuantity < 100 ? (
            <div className="p-3 bg-brand-yellow/10 rounded-xl border border-brand-yellow/20 flex gap-2.5 items-center">
              <Sparkle size={15} weight="bold" className="text-brand-yellow shrink-0" />
              <p className="text-[10px] text-brand-earth/70">
                Ordering for catering? Add <strong className="text-brand-earth">{100 - totalQuantity} more pcs</strong> for <strong>Free Delivery</strong>!
              </p>
            </div>
          ) : null}

          <div className="p-4 bg-brand-yellow/10 rounded-xl border border-brand-yellow/20 flex gap-3 items-start">
            <MapPin size={16} className="text-brand-yellow shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed text-brand-earth/60">
              Orders are typically delivered within <span className="font-semibold text-brand-earth">30-45 minutes</span> depending on your distance from our nearest hub.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
