"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'applications' | 'orders'>('applications');
  const [applications, setApplications] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchAll = async () => {
      try {
        const [appRes, orderRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/admin/applications", { headers: { "Authorization": `Bearer ${token}` } }),
          fetch("http://127.0.0.1:8000/api/admin/orders", { headers: { "Authorization": `Bearer ${token}` } })
        ]);

        const appData = await appRes.json();
        const orderData = await orderRes.json();

        if (appData.success) setApplications(appData.data);
        if (orderData.success) setOrders(orderData.data);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [router]);

  const updateOrderStatus = async (id: number, status: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://127.0.0.1:8000/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ status })
    });

    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    }
  };

  const updateAppStatus = async (id: number, status: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://127.0.0.1:8000/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ status })
    });

    if (res.ok) {
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-brand-earth">ADMIN ACCESS...</div>;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-brand-earth flex">
      {/* Sidebar */}
      <aside className="w-80 bg-brand-earth text-white p-12 flex flex-col justify-between shrink-0 h-screen sticky top-0">
        <div className="space-y-12">
          <div className="flex items-center gap-4">
            <Image src="/logo.jpg" alt="Logo" width={48} height={48} className="rounded-2xl" />
            <h1 className="text-xl font-black tracking-tighter leading-none">HQ<br />Portal</h1>
          </div>
          
          <nav className="space-y-4">
            <button 
              onClick={() => setActiveTab('applications')}
              className={`w-full text-left px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'applications' ? 'bg-white text-brand-earth shadow-xl' : 'text-white/40 hover:text-white'}`}
            >
              Applications
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-white text-brand-earth shadow-xl' : 'text-white/40 hover:text-white'}`}
            >
              Retail Orders
            </button>
          </nav>
        </div>

        <button 
          onClick={() => { localStorage.clear(); router.push('/login'); }}
          className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-16 overflow-y-auto">
        <header className="mb-16 space-y-4">
           <h2 className="text-5xl font-black tracking-tighter capitalize">{activeTab}</h2>
           <p className="text-xs font-bold uppercase tracking-widest text-brand-earth/40">Real-time business management</p>
        </header>

        {activeTab === 'applications' ? (
          <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-brand-earth/40 border-b border-gray-100">Applicant</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-brand-earth/40 border-b border-gray-100">Location</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-brand-earth/40 border-b border-gray-100">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-brand-earth/40 border-b border-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-6 border-b border-gray-100">
                      <p className="text-sm font-black tracking-tight">{app.name}</p>
                      <p className="text-[10px] font-bold text-brand-earth/40">{app.email}</p>
                    </td>
                    <td className="px-8 py-6 border-b border-gray-100">
                      <p className="text-xs font-bold">{app.location}</p>
                    </td>
                    <td className="px-8 py-6 border-b border-gray-100">
                      <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${app.status === 'approved' ? 'bg-green-100 text-green-700' : app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 border-b border-gray-100">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateAppStatus(app.id, 'approved')}
                          className="bg-brand-earth text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-green transition-all"
                        >Approve</button>
                        <button 
                          onClick={() => updateAppStatus(app.id, 'rejected')}
                          className="border border-gray-100 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all"
                        >Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-brand-earth/40 border-b border-gray-100">Order ID</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-brand-earth/40 border-b border-gray-100">Items</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-brand-earth/40 border-b border-gray-100">Total</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-brand-earth/40 border-b border-gray-100">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-brand-earth/40 border-b border-gray-100">Fulfillment</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-6 border-b border-gray-100">
                      <p className="text-sm font-black tracking-tight">#{order.id}</p>
                      <p className="text-[10px] font-bold text-brand-earth/40">{order.contact_number}</p>
                    </td>
                    <td className="px-8 py-6 border-b border-gray-100">
                      <p className="text-xs font-bold">{order.items.length} items</p>
                    </td>
                    <td className="px-8 py-6 border-b border-gray-100 font-black">
                      ₱{parseFloat(order.total_amount).toFixed(2)}
                    </td>
                    <td className="px-8 py-6 border-b border-gray-100">
                      <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                        order.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6 border-b border-gray-100">
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="bg-gray-50 border-none rounded-xl text-[9px] font-black uppercase tracking-widest px-4 py-2 outline-none focus:ring-2 focus:ring-brand-green"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
