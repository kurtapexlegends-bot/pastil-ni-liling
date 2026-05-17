"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartItem } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hubs, setHubs] = useState<any[]>([]);
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

    // Fetch active fulfillment hubs
    fetch("http://127.0.0.1:8000/api/hubs")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHubs(data.data);
          if (data.data.length > 0) {
            setSelectedHubId(data.data[0].id.toString());
          }
        }
      })
      .catch(err => console.error("Error loading hubs", err));
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
        setError(data.message || "Failed to place order. Please check your details.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-brand-earth flex flex-col">
      <nav className="h-16 bg-white border-b border-gray-100 flex items-center px-6">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <Link href="/menu" className="flex items-center gap-2 group">
            <span className="text-sm text-brand-earth/60 group-hover:text-brand-earth transition-colors">←</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-earth/60 group-hover:text-brand-earth transition-colors">Back to Menu</span>
          </Link>
          <div className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="Logo" width={24} height={24} className="rounded-full" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-earth/80">Pastil ni Liling</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-2 gap-12 w-full flex-1">
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
                     <span className="text-[8px] bg-brand-green/15 text-brand-green border border-brand-green/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">📍 Auto-Routing Active</span>
                   )}
                   {geoStatus === "requested" && (
                     <span className="text-[8px] bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">🛰 Locating...</span>
                   )}
                 </div>
                 <select
                   required
                   value={selectedHubId}
                   onChange={(e) => setSelectedHubId(e.target.value)}
                   className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-brand-green outline-none transition-colors shadow-sm"
                 >
                   {hubs.length === 0 ? (
                     <option value="">No active hubs available</option>
                   ) : (
                     hubs.map((hub) => (
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
                   className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-brand-green outline-none transition-colors h-20 resize-none shadow-sm"
                   placeholder="Street, Barangay, City, Landmark"
                   value={formData.shipping_address}
                   onChange={(e) => setFormData({...formData, shipping_address: e.target.value})}
                 />
               </div>
               <div className="space-y-1.5">
                 <label className="text-[10px] font-semibold uppercase tracking-wider text-brand-earth/50">Contact Number</label>
                 <input 
                   required
                   className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-brand-green outline-none transition-colors shadow-sm"
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
                        className={`py-2 rounded-lg border text-[9px] font-semibold uppercase tracking-wider transition-colors ${
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
            </div>

            <button 
              type="submit" 
              disabled={loading || items.length === 0}
              className="w-full bg-brand-green text-white py-3 rounded-xl text-[10px] font-semibold uppercase tracking-wider hover:bg-brand-green/90 transition-colors shadow-sm disabled:opacity-30"
            >
              {loading ? "Processing..." : `Place Order (₱${total.toFixed(2)})`}
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
                <span className="text-xs font-semibold text-brand-earth">₱{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="pt-5 border-t border-gray-100 space-y-2.5">
             <div className="flex justify-between text-[11px] text-brand-earth/40">
                <span>Subtotal</span>
                <span className="font-semibold text-brand-earth/60">₱{subtotal.toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-[11px] text-brand-earth/40">
                <span>Delivery Fee</span>
                <span className="font-semibold text-brand-earth/60">₱{deliveryFee.toFixed(2)}</span>
             </div>
             <div className="flex justify-between pt-3 border-t border-gray-50 items-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-earth/50">Total</span>
                <span className="text-lg font-bold text-brand-earth">₱{total.toFixed(2)}</span>
             </div>
          </div>

          <div className="p-4 bg-brand-yellow/10 rounded-xl border border-brand-yellow/20 flex gap-3 items-start">
            <span className="text-base leading-none">📍</span>
            <p className="text-[10px] leading-relaxed text-brand-earth/60">
              Orders are typically delivered within <span className="font-semibold text-brand-earth">30-45 minutes</span> depending on your distance from our nearest hub.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
