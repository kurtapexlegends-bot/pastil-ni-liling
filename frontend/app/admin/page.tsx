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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col gap-2 items-center justify-center bg-[#fafafa] font-sans text-brand-earth/60">
        <div className="w-5 h-5 border-2 border-brand-green border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[10px] font-semibold uppercase tracking-wider">Accessing HQ Portal...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-brand-earth flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col justify-between shrink-0 h-screen sticky top-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="Logo" width={28} height={28} className="rounded-lg" />
            <h1 className="text-sm font-semibold tracking-tight text-brand-earth leading-none">HQ Portal</h1>
          </div>
          
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('applications')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'applications' 
                  ? 'bg-brand-earth text-white shadow-sm' 
                  : 'text-brand-earth/50 hover:bg-gray-50 hover:text-brand-earth'
              }`}
            >
              Applications
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'orders' 
                  ? 'bg-brand-earth text-white shadow-sm' 
                  : 'text-brand-earth/50 hover:bg-gray-50 hover:text-brand-earth'
              }`}
            >
              Retail Orders
            </button>
          </nav>
        </div>

        <button 
          onClick={() => { localStorage.clear(); router.push('/login'); }}
          className="w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider text-brand-earth/40 hover:text-red-600 transition-colors"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-8 space-y-0.5">
           <h2 className="text-2xl font-bold tracking-tight text-brand-earth capitalize">{activeTab}</h2>
           <p className="text-xs text-brand-earth/40">Real-time business management and fulfillment</p>
        </header>

        {activeTab === 'applications' ? (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Applicant</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Location</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Status</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 border-b border-gray-100">
                      <p className="text-sm font-semibold text-brand-earth">{app.name}</p>
                      <p className="text-[10px] font-medium text-brand-earth/40">{app.email}</p>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100">
                      <p className="text-xs text-brand-earth/60 font-medium">{app.location}</p>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-semibold uppercase tracking-wider ${
                        app.status === 'approved' 
                          ? 'bg-green-50 text-green-700 border border-green-100' 
                          : app.status === 'rejected' 
                          ? 'bg-red-50 text-red-700 border border-red-100' 
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateAppStatus(app.id, 'approved')}
                          className="bg-brand-earth hover:bg-brand-green text-white px-3 py-1.5 rounded-lg text-[9px] font-semibold uppercase tracking-wider transition-colors"
                        >Approve</button>
                        <button 
                          onClick={() => updateAppStatus(app.id, 'rejected')}
                          className="border border-gray-100 px-3 py-1.5 rounded-lg text-[9px] font-semibold uppercase tracking-wider hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors"
                        >Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Order ID</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Items</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Total</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Status</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Fulfillment</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 border-b border-gray-100">
                      <p className="text-sm font-semibold text-brand-earth">#{order.id}</p>
                      <p className="text-[10px] font-medium text-brand-earth/40">{order.contact_number}</p>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100">
                      <p className="text-xs text-brand-earth/60 font-medium">{order.items.length} items</p>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100 font-semibold text-brand-earth">
                      ₱{parseFloat(order.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-semibold uppercase tracking-wider ${
                        order.status === 'delivered' ? 'bg-green-50 text-green-700 border border-green-100' : 
                        order.status === 'out_for_delivery' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 
                        'bg-yellow-50 text-yellow-700 border border-yellow-100'
                      }`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100">
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="bg-gray-50 border border-gray-100 rounded-lg text-[9px] font-semibold uppercase tracking-wider px-3 py-1.5 outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
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
