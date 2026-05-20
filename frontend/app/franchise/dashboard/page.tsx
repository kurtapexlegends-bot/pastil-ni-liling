"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Warning, Package, Truck, DeviceTablet, ShieldCheck, Coins } from "@phosphor-icons/react";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import { Product, CartItem } from "@/types";
import QCComplianceManager from "@/components/admin/QCComplianceManager";
import BranchPayrollManager from "@/components/admin/BranchPayrollManager";
import ExpenseTracker from "@/components/admin/ExpenseTracker";
import { deleteCookie } from "@/components/cookieHelper";

export default function FranchiseDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [hub, setHub] = useState<any>(null);
  const [hubInventory, setHubInventory] = useState<any[]>([]);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // POS State
  const [activePortalTab, setActivePortalTab] = useState<'logistics' | 'pos' | 'compliance' | 'payroll' | 'expenses'>('logistics');
  const [posCart, setPosCart] = useState<any[]>([]);
  const [posPaymentMethod, setPosPaymentMethod] = useState<string>("cash");
  const [posChannel, setPosChannel] = useState<string>("walk_in");
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const triggerQueueSyncDirectly = async (token: string) => {
    const queue = localStorage.getItem("pos_offline_queue");
    if (!queue) return;

    const parsedQueue = JSON.parse(queue);
    if (parsedQueue.length === 0) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/pos/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ orders: parsedQueue })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.removeItem("pos_offline_queue");
        setOfflineQueue([]);
        
        // Refresh local inventory levels
        const invRes = await fetch("http://127.0.0.1:8000/api/franchise/inventory", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const invData = await invRes.json();
        if (invData.success) {
          setHub(invData.hub);
          setHubInventory(invData.data);
        }
      }
    } catch (err) {
      console.warn("Failed to automatic sync queue", err);
    }
  };

  const handleManualSync = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    await triggerQueueSyncDirectly(token);
    setLoading(false);
    alert("Offline queue sync check completed.");
  };

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

    // Initial load for Offline POS Queue
    const savedQueue = localStorage.getItem("pos_offline_queue");
    if (savedQueue) {
      setOfflineQueue(JSON.parse(savedQueue));
    }

    setIsOnline(navigator.onLine);

    const fetchAll = async () => {
      try {
        const [prodRes, orderRes, invRes, custRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/products"),
          fetch("http://127.0.0.1:8000/api/orders", { headers: { "Authorization": `Bearer ${token}` } }),
          fetch("http://127.0.0.1:8000/api/franchise/inventory", { headers: { "Authorization": `Bearer ${token}` } }),
          fetch("http://127.0.0.1:8000/api/franchise/orders", { headers: { "Authorization": `Bearer ${token}` } })
        ]);

        const prodData = await prodRes.json();
        const orderData = await orderRes.json();
        const invData = await invRes.json();
        const custData = await custRes.json();

        if (prodData.success) {
          setProducts(prodData.data.filter((p: any) => p.is_wholesale));
        }
        if (orderData.success) {
          setOrders(orderData.data.filter((o: any) => o.type === 'wholesale'));
        }
        if (invData.success) {
          setHub(invData.hub);
          setHubInventory(invData.data);
        }
        if (custData.success) {
          setCustomerOrders(custData.data);
        }
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();

    const handleOnline = () => {
      setIsOnline(true);
      triggerQueueSyncDirectly(token);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (navigator.onLine) {
      triggerQueueSyncDirectly(token);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [router]);

  const handleAddToPOSCart = (prod: any) => {
    setPosCart(prev => {
      const existing = prev.find(item => item.id === prod.product_id);
      if (existing) {
        if (existing.quantity >= prod.stock_quantity) {
          alert(`Cannot exceed available branch stock of ${prod.stock_quantity} units.`);
          return prev;
        }
        return prev.map(item =>
          item.id === prod.product_id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: prod.product.id, name: prod.product.name, price: prod.product.price, quantity: 1, maxStock: prod.stock_quantity, flavor_modifier: "Original" }];
    });
  };

  const updatePOSCartQuantity = (id: number, delta: number) => {
    setPosCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty > item.maxStock) {
          alert(`Cannot exceed available branch stock of ${item.maxStock} units.`);
          return item;
        }
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  const updatePOSCartFlavor = (id: number, flavor: string) => {
    setPosCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, flavor_modifier: flavor };
      }
      return item;
    }));
  };

  const removeFromPOSCart = (id: number) => {
    setPosCart(prev => prev.filter(item => item.id !== id));
  };

  const handlePOSCheckout = async () => {
    if (posCart.length === 0) return;
    const offlineId = "pos-offline-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
    const totalAmount = posCart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    const newPOSOrder = {
      offline_id: offlineId,
      total_amount: totalAmount,
      payment_method: posPaymentMethod,
      channel: posChannel,
      items: posCart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: parseFloat(item.price),
        flavor_modifier: item.flavor_modifier || "Original"
      }))
    };

    setHubInventory(prev => prev.map(invItem => {
      const cartMatch = posCart.find(c => c.id === invItem.product_id);
      if (cartMatch) {
        return {
          ...invItem,
          stock_quantity: Math.max(0, invItem.stock_quantity - cartMatch.quantity)
        };
      }
      return invItem;
    }));

    const updatedQueue = [...offlineQueue, newPOSOrder];
    setOfflineQueue(updatedQueue);
    localStorage.setItem("pos_offline_queue", JSON.stringify(updatedQueue));
    setPosCart([]);

    if (navigator.onLine) {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("http://127.0.0.1:8000/api/pos/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ orders: [newPOSOrder] })
        });

        const data = await res.json();
        if (data.success) {
          const clearedQueue = updatedQueue.filter(o => o.offline_id !== offlineId);
          setOfflineQueue(clearedQueue);
          localStorage.setItem("pos_offline_queue", JSON.stringify(clearedQueue));
          
          const invRes = await fetch("http://127.0.0.1:8000/api/franchise/inventory", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const invData = await invRes.json();
          if (invData.success) {
            setHub(invData.hub);
            setHubInventory(invData.data);
          }
        }
      } catch (err) {
        console.warn("Stall offline, order saved locally.", err);
      }
    } else {
      alert("Offline Mode: Order saved locally. It will automatically sync once online!");
    }
  };

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

  const handleUpdateCustomerOrderStatus = async (orderId: number, nextStatus: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/franchise/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      const data = await res.json();
      if (data.success) {
        const refreshRes = await fetch("http://127.0.0.1:8000/api/franchise/orders", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const refreshData = await refreshRes.json();
        if (refreshData.success) {
          setCustomerOrders(refreshData.data);
        }
        alert(`Order status updated to: ${nextStatus}`);
      } else {
        alert("Failed to update status: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error updating order status.");
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + (parseFloat(item.wholesale_price || item.price) * item.quantity),
      0
    );

    try {
      const res = await fetch("http://127.0.0.1:8000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          type: "wholesale",
          total_amount: totalAmount,
          shipping_address: hub?.address || "Franchise Branch Address",
          contact_number: user?.contact_number || "09171234567",
          payment_method: "cod",
          items: cartItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: parseFloat(item.wholesale_price || item.price)
          }))
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("Bulk Restock Order Placed successfully!");
        setCartItems([]);
        setIsCartOpen(false);
        
        // Refresh orders and inventory
        const [orderRes, invRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/orders", { headers: { "Authorization": `Bearer ${token}` } }),
          fetch("http://127.0.0.1:8000/api/franchise/inventory", { headers: { "Authorization": `Bearer ${token}` } })
        ]);
        const orderData = await orderRes.json();
        const invData = await invRes.json();
        if (orderData.success) setOrders(orderData.data.filter((o: any) => o.type === 'wholesale'));
        if (invData.success) {
          setHub(invData.hub);
          setHubInventory(invData.data);
        }
      } else {
        alert("Failed to place order: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error placing order.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-medium text-xs text-brand-earth/60 tracking-wider">Loading Partner Portal...</div>;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-brand-earth flex flex-col">
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems.map(item => ({ ...item, price: item.wholesale_price || item.price }))}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
        checkoutText="Place Bulk Order"
      />

      <nav className="h-16 bg-white border-b border-gray-100 flex items-center px-6 shrink-0">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="Logo" width={28} height={28} className="rounded-full" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-earth/80">Franchisee Portal</span>
          </div>
          <div className="flex items-center gap-6">
            <div onClick={() => setIsCartOpen(true)} className="relative cursor-pointer hover:opacity-80 transition-opacity flex items-center">
              <Package size={20} className="text-brand-earth hover:text-brand-green transition-colors" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-green text-white text-[8px] font-semibold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </div>
            <button onClick={() => { localStorage.clear(); deleteCookie("token"); deleteCookie("user_role"); router.push('/login'); }} className="text-[10px] font-semibold uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors">Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto w-full px-6 py-10 space-y-10">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-50">
           <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-brand-earth">Salamat, <span className="text-brand-green">{user?.name?.split(' ')[0]}</span></h1>
              <p className="text-xs text-brand-earth/50">Manage your branch inventory, B2C live checkouts, and terminal sales</p>
           </div>
           <div className="w-full sm:w-auto">
              <div className="bg-white border border-gray-100 p-4 rounded-xl text-left sm:text-right space-y-0.5 shadow-sm">
                 <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Active Wholesale Orders</p>
                 <p className="text-lg font-bold text-brand-earth">{orders.filter(o => o.status !== 'delivered').length}</p>
              </div>
           </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 gap-6 overflow-x-auto scrollbar-none whitespace-nowrap pb-px">
          <button
            onClick={() => setActivePortalTab('logistics')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
              activePortalTab === 'logistics'
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-brand-earth/40 hover:text-brand-earth/70'
            }`}
          >
            <Truck size={16} weight="duotone" />
            Logistics
          </button>
          <button
            onClick={() => setActivePortalTab('pos')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
              activePortalTab === 'pos'
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-brand-earth/40 hover:text-brand-earth/70'
            }`}
          >
            <DeviceTablet size={16} weight="duotone" />
            POS Cashier
            {offlineQueue.length > 0 && (
              <span className="bg-brand-yellow text-brand-earth text-[8px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                {offlineQueue.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActivePortalTab('compliance')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
              activePortalTab === 'compliance'
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-brand-earth/40 hover:text-brand-earth/70'
            }`}
          >
            <ShieldCheck size={16} weight="duotone" />
            QC Compliance
          </button>
          <button
            onClick={() => setActivePortalTab('payroll')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
              activePortalTab === 'payroll'
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-brand-earth/40 hover:text-brand-earth/70'
            }`}
          >
            <Coins size={16} weight="duotone" />
            Shifts & Payroll
          </button>
          <button
            onClick={() => setActivePortalTab('expenses')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activePortalTab === 'expenses'
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-brand-earth/40 hover:text-brand-earth/70'
            }`}
          >
            Expenses
          </button>
        </div>

        {activePortalTab === 'logistics' && (
          <>
            {/* Live Retail Orders Section */}
            <section className="space-y-4">
               <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold tracking-tight text-brand-earth">Live Routed B2C Orders</h2>
                  <span className="bg-brand-green/10 text-brand-green text-[9px] font-semibold px-2.5 py-0.5 rounded-full tracking-wide">
                     {customerOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length} Active
                  </span>
               </div>
               
               {customerOrders.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center space-y-1 shadow-sm">
                     <p className="text-xs text-brand-earth/40">No active customer orders routed to your hub yet.</p>
                  </div>
               ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                     {customerOrders.map(order => (
                        <div key={order.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                           <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                 <div className="space-y-0.5">
                                    <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/30">Order #{order.id}</p>
                                    <p className="text-xs font-semibold text-brand-earth">{order.user?.name || 'Guest Customer'}</p>
                                    <p className="text-[10px] text-brand-earth/50">{order.contact_number}</p>
                                    <p className="text-[9px] text-brand-earth/40 leading-relaxed line-clamp-1">{order.shipping_address}</p>
                                 </div>
                                 <span className={`px-2 py-0.5 rounded-full text-[8px] font-semibold uppercase tracking-wider ${
                                    order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                                    order.status === 'preparing' ? 'bg-orange-50 text-orange-600' :
                                    order.status === 'out_for_delivery' ? 'bg-blue-50 text-blue-600' :
                                    'bg-yellow-50 text-yellow-600'
                                 }`}>
                                    {order.status}
                                 </span>
                              </div>
                              
                              <div className="pt-3 border-t border-gray-50 space-y-1.5">
                                 {order.items?.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center text-[10px] text-brand-earth/70">
                                       <span className="font-medium">{item.quantity}x {item.product?.name}</span>
                                       <span className="font-semibold">₱{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                           
                           <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                              <div className="text-left">
                                 <p className="text-[8px] uppercase tracking-wider text-brand-earth/30">Total</p>
                                 <p className="text-xs font-bold text-brand-earth">₱{parseFloat(order.total_amount).toFixed(2)}</p>
                              </div>
                              
                              <div className="flex gap-1.5">
                                 {order.status === 'pending' && (
                                    <button 
                                      onClick={() => handleUpdateCustomerOrderStatus(order.id, 'preparing')}
                                      className="bg-brand-earth text-white px-3 py-1.5 rounded-lg text-[9px] font-semibold uppercase tracking-wider hover:bg-brand-green transition-all"
                                    >
                                       Start Preparing
                                    </button>
                                 )}
                                 {order.status === 'preparing' && (
                                    <button 
                                      onClick={() => handleUpdateCustomerOrderStatus(order.id, 'out_for_delivery')}
                                      className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-semibold uppercase tracking-wider hover:bg-blue-700 transition-all"
                                    >
                                       Ship Order
                                    </button>
                                 )}
                                 {order.status === 'out_for_delivery' && (
                                    <button 
                                      onClick={() => handleUpdateCustomerOrderStatus(order.id, 'delivered')}
                                      className="bg-brand-green text-white px-3 py-1.5 rounded-lg text-[9px] font-semibold uppercase tracking-wider hover:bg-brand-green/80 transition-all"
                                    >
                                       Deliver
                                    </button>
                                 )}
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </section>

            <section className="grid lg:grid-cols-3 gap-12 pt-4">
               {/* Wholesale Catalog */}
               <div className="lg:col-span-2 space-y-6">
                  <h2 className="text-lg font-bold tracking-tight text-brand-earth">Request Restock Supplies (Commissary Bulk)</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {products.map(product => (
                      <ProductCard 
                        key={product.id} 
                        product={{ ...product, price: product.wholesale_price || product.price }} 
                        onAddToCart={handleAddToCart}
                        onClick={() => handleAddToCart(product)} 
                      />
                    ))}
                  </div>
               </div>

               {/* Branch Stock and History */}
               <div className="space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold tracking-tight text-brand-earth">Active Spoke Inventory</h2>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                       <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                          <div>
                             <p className="text-xs font-semibold text-brand-earth">{hub?.name || 'Loading Branch...'}</p>
                             <p className="text-[9px] text-brand-earth/40 uppercase tracking-wider">{hub?.address || 'Locating...'}</p>
                          </div>
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                       </div>
                       <div className="space-y-3">
                          {hubInventory.length === 0 ? (
                            <p className="text-[10px] text-brand-earth/40 py-2 text-center">No retail stock yet. Place a bulk order to restock!</p>
                          ) : (
                            hubInventory.map((item: any) => (
                               <div key={item.id} className="flex justify-between items-center text-[11px] text-brand-earth/70">
                                  <span className="font-medium">{item.product?.name}</span>
                                  <span className={`font-semibold px-2 py-0.5 rounded-full text-[9px] ${item.stock_quantity < 50 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                    {item.stock_quantity} units
                                  </span>
                               </div>
                            ))
                          )}
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-lg font-bold tracking-tight text-brand-earth">Recent Commissary Shipments</h2>
                    <div className="space-y-3">
                      {orders.length === 0 ? (
                        <p className="text-[10px] text-brand-earth/40 py-2 text-center">No recent orders</p>
                      ) : (
                        orders.slice(0, 5).map(order => (
                          <div key={order.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center group hover:border-brand-green/30 transition-all shadow-sm">
                             <div className="space-y-0.5">
                                <p className="text-[9px] font-semibold text-brand-earth/30">Order #{order.id}</p>
                                <p className="text-xs font-semibold text-brand-earth">₱{parseFloat(order.total_amount).toFixed(2)}</p>
                             </div>
                             <span className={`px-2 py-0.5 rounded-full text-[8px] font-semibold uppercase tracking-wider ${order.status === 'delivered' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                {order.status}
                             </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
               </div>
            </section>
          </>
        )}

        {activePortalTab === 'pos' && (
          <div className="grid lg:grid-cols-3 gap-12 pt-4">
            {/* Cashier Menu Grid */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold tracking-tight text-brand-earth">Branch Shelf Catalog</h2>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                    isOnline ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                    {isOnline ? 'Network Live' : 'Offline Buffering Active'}
                  </span>
                </div>
              </div>

              {offlineQueue.length > 0 && (
                <div className="bg-brand-yellow/10 border border-brand-yellow/20 p-4 rounded-xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <Warning size={20} className="text-brand-yellow" weight="fill" />
                    <div>
                      <p className="text-xs font-semibold text-brand-earth">Local offline receipts waiting to sync</p>
                      <p className="text-[9px] text-brand-earth/50">Stall is running offline. {offlineQueue.length} sales are saved locally and will sync once internet recovers.</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleManualSync}
                    className="bg-brand-earth text-white px-3 py-1.5 rounded-lg text-[9px] font-semibold uppercase tracking-wider hover:bg-brand-green transition-all shadow-sm"
                  >
                    Retry Sync
                  </button>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {hubInventory.length === 0 ? (
                  <div className="col-span-2 bg-white border border-gray-100 p-8 rounded-2xl text-center space-y-2">
                    <p className="text-xs text-brand-earth/40">No retail stock available at this branch.</p>
                    <p className="text-[10px] text-brand-earth/30">Order supplies from HQ commissary using the Logistics tab first.</p>
                  </div>
                ) : (
                  hubInventory.map((item: any) => (
                    <div 
                      key={item.id} 
                      onClick={() => item.stock_quantity > 0 && handleAddToPOSCart(item)}
                      className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-brand-green/30 hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer relative ${
                        item.stock_quantity === 0 ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-[8px] bg-brand-earth/5 text-brand-earth/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{item.product?.category}</span>
                          <h3 className="text-sm font-bold text-brand-earth tracking-tight">{item.product?.name}</h3>
                          <p className="text-xs font-bold text-brand-green">₱{parseFloat(item.product?.price).toFixed(2)}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          item.stock_quantity === 0 
                            ? 'bg-red-50 text-red-600' 
                            : item.stock_quantity < 30 
                            ? 'bg-yellow-50 text-yellow-600' 
                            : 'bg-green-50 text-green-600'
                        }`}>
                          {item.stock_quantity === 0 ? 'Out of Stock' : `${item.stock_quantity} available`}
                        </span>
                      </div>
                      <div className="flex justify-end pt-2 border-t border-gray-50">
                        <button 
                          disabled={item.stock_quantity === 0}
                          className="bg-brand-green text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-sm hover:bg-brand-green/90 transition-colors disabled:opacity-0"
                        >
                          + Add to Receipt
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Live Receipt Drawer */}
            <div className="space-y-6">
              <div id="pos-receipt-drawer" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 lg:sticky lg:top-24 scroll-mt-6">
                <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-brand-earth/80">Active Receipt</h2>
                  <span className="text-[9px] font-semibold bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full">
                    {posCart.reduce((sum, item) => sum + item.quantity, 0)} Items
                  </span>
                </div>

                {posCart.length === 0 ? (
                  <div className="py-12 text-center space-y-1.5 flex flex-col items-center justify-center">
                    <Package size={28} className="text-brand-earth/30" />
                    <p className="text-xs font-medium text-brand-earth/40">Receipt is empty</p>
                    <p className="text-[9px] text-brand-earth/30">Tap products on the left to build order receipt</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                      {posCart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-xs py-1 border-b border-gray-50/50">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-brand-earth">{item.name}</p>
                            <div className="flex gap-2 items-center">
                              <p className="text-[10px] text-brand-earth/40">₱{parseFloat(item.price).toFixed(2)} each</p>
                              <span className="text-[9px] text-brand-earth/30">|</span>
                              <select
                                value={item.flavor_modifier || "Original"}
                                onChange={(e) => updatePOSCartFlavor(item.id, e.target.value)}
                                className="text-[9px] font-semibold text-brand-green bg-transparent border-none outline-none focus:ring-0 p-0 cursor-pointer"
                              >
                                <option value="Original">Original</option>
                                <option value="Spicy">Spicy</option>
                                <option value="Toasted">Toasted</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-100 rounded-lg overflow-hidden bg-gray-50/50 shadow-sm">
                              <button 
                                type="button" 
                                onClick={() => updatePOSCartQuantity(item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-brand-earth/60 font-bold transition-colors"
                              >
                                -
                              </button>
                              <span className="px-2.5 text-[10px] font-bold text-brand-earth">{item.quantity}</span>
                              <button 
                                type="button" 
                                onClick={() => updatePOSCartQuantity(item.id, 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-brand-earth/60 font-bold transition-colors"
                              >
                                +
                              </button>
                            </div>
                            <span className="font-bold text-brand-earth w-14 text-right">₱{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                            <button 
                              type="button" 
                              onClick={() => removeFromPOSCart(item.id)}
                              className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 font-bold text-sm transition-colors rounded-full hover:bg-red-50"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-gray-50 space-y-4">
                      {/* POS Sales Channel Selector */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-brand-earth/40">POS Sales Channel</span>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: "walk_in", label: "Walk-in" },
                            { value: "grab", label: "Grab" },
                            { value: "foodpanda", label: "Foodpanda" },
                            { value: "shopee", label: "Shopee" },
                            { value: "tiktok", label: "TikTok" }
                          ].map((ch) => (
                            <button
                              key={ch.value}
                              type="button"
                              onClick={() => setPosChannel(ch.value)}
                              className={`py-1.5 rounded-lg border text-[9px] font-semibold uppercase tracking-wider transition-colors ${
                                posChannel === ch.value 
                                  ? 'bg-brand-earth text-white border-brand-earth shadow-sm' 
                                  : 'bg-white border-gray-100 text-brand-earth/40 hover:border-brand-green'
                              }`}
                            >
                              {ch.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Payment Selector */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-brand-earth/40">Booths Payment Type</span>
                        <div className="grid grid-cols-2 gap-2">
                          {['cash', 'gcash', 'paymaya', 'cod'].map((method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => setPosPaymentMethod(method)}
                              className={`py-2 rounded-lg border text-[9px] font-semibold uppercase tracking-wider transition-colors ${
                                posPaymentMethod === method 
                                  ? 'bg-brand-earth text-white border-brand-earth shadow-sm' 
                                  : 'bg-white border-gray-100 text-brand-earth/40 hover:border-brand-green'
                              }`}
                            >
                              {method}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Total calculation */}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-earth/40">Amount Due</span>
                        <span className="text-xl font-bold text-brand-earth">
                          ₱{posCart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0).toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handlePOSCheckout}
                        className="w-full bg-brand-green text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-brand-green/90 transition-colors shadow-sm"
                      >
                        Complete Cashier Checkout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activePortalTab === 'compliance' && (
          <QCComplianceManager />
        )}

        {activePortalTab === 'payroll' && (
          <div className="space-y-6 pt-4">
            {/* Cashier Attendance Console */}
            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Cashier Attendance Console</h3>
                <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Clock in to register shift hours and qualify for POS commissions.</p>
              </div>

              <div className="flex gap-4 items-center">
                <button
                  onClick={async () => {
                    const token = localStorage.getItem("token");
                    if (!token) return;
                    try {
                      const res = await fetch("http://127.0.0.1:8000/api/payroll/shifts/clock-in", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ hub_id: hub?.id || 1 })
                      });
                      const data = await res.json();
                      alert(data.message);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="bg-brand-green hover:bg-brand-green/90 text-white font-bold uppercase tracking-wider text-[9px] px-4 py-2.5 rounded-lg transition-all shadow-sm"
                >
                  Clock In Shift
                </button>

                <button
                  onClick={async () => {
                    const token = localStorage.getItem("token");
                    if (!token) return;
                    try {
                      const res = await fetch("http://127.0.0.1:8000/api/payroll/shifts/clock-out", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${token}`
                        }
                      });
                      const data = await res.json();
                      alert(data.message);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold uppercase tracking-wider text-[9px] px-4 py-2.5 rounded-lg transition-all shadow-sm"
                >
                  Clock Out Shift
                </button>
              </div>
            </div>

            <BranchPayrollManager />
          </div>
        )}

        {activePortalTab === 'expenses' && (
          <ExpenseTracker />
        )}
      </main>

      {/* Floating Bottom Receipt Review Dock for Mobile POS */}
      {activePortalTab === 'pos' && posCart.length > 0 && (
        <div className="fixed bottom-6 right-6 left-6 z-50 lg:hidden animate-in slide-in-from-bottom duration-300">
          <button
            onClick={() => {
              const element = document.getElementById("pos-receipt-drawer");
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="w-full bg-brand-green text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-2 active:scale-95 hover:bg-brand-green/90 transition-all border border-brand-green/10"
          >
            <Package size={16} weight="bold" />
            Review Order Receipt ({posCart.reduce((sum, item) => sum + item.quantity, 0)} items)
          </button>
        </div>
      )}
    </div>
  );
}
