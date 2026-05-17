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
  const [hub, setHub] = useState<any>(null);
  const [hubInventory, setHubInventory] = useState<any[]>([]);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
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
            <div onClick={() => setIsCartOpen(true)} className="relative cursor-pointer hover:opacity-80 transition-opacity">
              <span className="text-lg">📦</span>
              {cartItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-green text-white text-[8px] font-semibold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </div>
            <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-[10px] font-semibold uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors">Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto w-full px-6 py-10 space-y-12">
        <header className="flex justify-between items-center pb-4 border-b border-gray-50">
           <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-brand-earth">Salamat, <span className="text-brand-green">{user?.name?.split(' ')[0]}</span></h1>
              <p className="text-xs text-brand-earth/50">Manage your branch inventory and bulk supplies</p>
           </div>
           <div>
              <div className="bg-white border border-gray-100 p-4 rounded-xl text-right space-y-0.5 shadow-sm">
                 <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Active Wholesale Orders</p>
                 <p className="text-lg font-bold text-brand-earth">{orders.filter(o => o.status !== 'delivered').length}</p>
              </div>
           </div>
        </header>

        {/* Live Retail Orders Section */}
        <section className="space-y-4">
           <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold tracking-tight text-brand-earth">Live Retail Orders</h2>
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
              <h2 className="text-lg font-bold tracking-tight text-brand-earth">Restock Inventory</h2>
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
                <h2 className="text-lg font-bold tracking-tight text-brand-earth">Branch Stock Levels</h2>
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
                <h2 className="text-lg font-bold tracking-tight text-brand-earth">Recent Supplies</h2>
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
      </main>
    </div>
  );
}
