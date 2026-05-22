"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { deleteCookie } from "@/components/cookieHelper";
import { ShoppingBag } from "@phosphor-icons/react";
import CustomerDashboardSkeleton from "@/components/CustomerDashboardSkeleton";

const fetcher = (url: string) => {
  const token = localStorage.getItem("token");
  return fetch(url, { headers: { "Authorization": `Bearer ${token}` } }).then(res => res.json());
};

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const { data: ordersRes } = useSWR(user ? "http://127.0.0.1:8000/api/orders" : null, fetcher);
  const orders = ordersRes?.data || [];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    const roles = parsedUser.roles || [];
    const isAdmin = roles.some((r: any) => r.name === "Admin" || r.name === "HQ operations");
    const isFranchiseAccess = roles.some((r: any) => r.name === "Franchisee" || r.name === "Branch Cashier");

    if (isAdmin) {
      router.push("/admin");
      return;
    }

    if (isFranchiseAccess) {
      router.push("/franchise/dashboard");
      return;
    }

    setUser(parsedUser);
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'out_for_delivery': return 'bg-blue-100 text-blue-700';
      case 'paid': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    deleteCookie("token");
    deleteCookie("user_role");
    router.push("/");
  };


  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-brand-earth flex flex-col">
      <Navbar variant="dashboard" onLogout={handleLogout} />

      <main className="max-w-6xl mx-auto w-full px-8 pt-28 pb-12 flex-1 grid lg:grid-cols-3 gap-12">
        {/* User Sidebar */}
        <aside className="space-y-8">
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="w-20 h-20 bg-brand-earth rounded-3xl flex items-center justify-center text-3xl text-white font-black shadow-xl shadow-brand-earth/20">
              {user?.name?.charAt(0)}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tighter">{user?.name}</h1>
              <p className="text-[10px] font-bold text-brand-earth/40 uppercase tracking-widest">{user?.email}</p>
            </div>
          </div>

          <div className="bg-brand-earth text-white rounded-[2rem] p-8 space-y-4">
             <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Orders</p>
             <p className="text-5xl font-black tracking-tighter">{orders.length}</p>
          </div>
        </aside>

        {/* Orders Feed */}
        <section className="lg:col-span-2 space-y-8">
          <header className="flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tighter">Your Orders</h2>
          </header>

          <div className="space-y-6">
            {!ordersRes ? (
               <CustomerDashboardSkeleton />
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-20 flex flex-col items-center text-center border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-brand-green/5 rounded-full flex items-center justify-center text-brand-green mb-6">
                  <ShoppingBag size={32} weight="fill" />
                </div>
                <h3 className="text-xl font-extrabold tracking-tight mb-2">No orders placed yet</h3>
                <p className="text-xs font-bold text-brand-earth/40">Your order history will appear here once you make a purchase.</p>
                <Link href="/menu" className="mt-8 bg-brand-green hover:bg-brand-earth transition-colors text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-green/20">
                  Start Shopping
                </Link>
              </div>
            ) : (
              orders.map((order: any, idx: number) => (
                <div 
                  key={order.id} 
                  className="bg-white rounded-[2rem] border border-gray-100 p-8 space-y-6 hover:shadow-xl transition-all group animate-in slide-in-from-bottom fade-in duration-700 fill-mode-both"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <header className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-earth/40">Order #{order.id}</p>
                      <p className="text-xs font-bold">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </header>

                  <div className="space-y-4 border-y border-gray-50 py-6">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-xs font-medium">
                        <span className="text-brand-earth/60">{item.quantity}x {item.product.name}</span>
                        <span className="font-bold">₱{parseFloat(item.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <footer className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-earth/40">Total Amount</p>
                    <p className="text-xl font-black tracking-tighter">₱{parseFloat(order.total_amount).toFixed(2)}</p>
                  </footer>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
