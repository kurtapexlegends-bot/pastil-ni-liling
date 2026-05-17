"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import { Product, CartItem } from "@/types";

export default function FranchiseDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    const isFranchisee = parsedUser.roles.some((r: any) => r.name === "Franchisee");
    
    if (!isFranchisee) {
      router.push("/dashboard");
      return;
    }

    setUser(parsedUser);

    const fetchAll = async () => {
      try {
        const [prodRes, orderRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/products"),
          fetch("http://127.0.0.1:8000/api/orders", { headers: { "Authorization": `Bearer ${token}` } })
        ]);

        const prodData = await prodRes.json();
        const orderData = await orderRes.json();

        if (prodData.success) {
          // Filter only wholesale products
          setProducts(prodData.data.filter((p: any) => p.is_wholesale));
        }
        if (orderData.success) setOrders(orderData.data);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [router]);

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-brand-earth">PARTNER ACCESS...</div>;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-brand-earth flex flex-col">
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />

      <nav className="h-20 bg-white border-b border-gray-100 flex items-center px-8 shrink-0">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo.jpg" alt="Logo" width={32} height={32} className="rounded-full" />
            <span className="text-xs font-black uppercase tracking-tighter">Franchisee Portal</span>
          </div>
          <div className="flex items-center gap-8">
            <div onClick={() => setIsCartOpen(true)} className="relative cursor-pointer">
              <span className="text-xl">📦</span>
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-green text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </div>
            <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-[10px] font-black uppercase tracking-widest text-red-500">Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto w-full px-8 py-12 space-y-16">
        <header className="flex justify-between items-end">
           <div className="space-y-4">
              <h1 className="text-6xl font-black tracking-tighter">Salamat, <span className="text-brand-green">{user?.name?.split(' ')[0]}!</span></h1>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-earth/40">Manage your branch inventory & bulk supplies</p>
           </div>
           <div className="flex gap-4">
              <div className="bg-white border border-gray-100 p-6 rounded-[2rem] text-right space-y-1 shadow-sm">
                 <p className="text-[10px] font-black uppercase tracking-widest text-brand-earth/40">Active Orders</p>
                 <p className="text-2xl font-black">{orders.filter(o => o.status !== 'delivered').length}</p>
              </div>
           </div>
        </header>

        <section className="grid lg:grid-cols-3 gap-16">
           {/* Wholesale Menu */}
           <div className="lg:col-span-2 space-y-8">
              <h2 className="text-2xl font-black tracking-tighter">Restock Inventory</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {products.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={handleAddToCart}
                    onClick={() => handleAddToCart(product)} // Instant add for wholesale
                  />
                ))}
              </div>
           </div>

           {/* Bulk History */}
           <div className="space-y-8">
              <h2 className="text-2xl font-black tracking-tighter">Recent Supplies</h2>
              <div className="space-y-4">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex justify-between items-center group hover:border-brand-green transition-all">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-earth/40">#{order.id}</p>
                        <p className="text-xs font-bold">₱{parseFloat(order.total_amount).toFixed(2)}</p>
                     </div>
                     <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.status}
                     </span>
                  </div>
                ))}
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}
