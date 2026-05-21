"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Warning, Package, Truck, DeviceTablet, ShieldCheck, Coins, List } from "@phosphor-icons/react";
import CartDrawer from "@/components/CartDrawer";
import { Product, CartItem } from "@/types";
import QCComplianceManager from "@/components/admin/QCComplianceManager";
import ExpenseTracker from "@/components/admin/ExpenseTracker";
import { deleteCookie } from "@/components/cookieHelper";

// Modularized components
import LogisticsTab from "@/components/franchise/LogisticsTab";
import POSCashierTab from "@/components/franchise/POSCashierTab";
import ShiftsPayrollTab from "@/components/franchise/ShiftsPayrollTab";
import Sidebar from "@/components/franchise/Sidebar";

export default function FranchiseDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const isCashier = user?.roles?.some((r: any) => r.name === 'Branch Cashier') || false;
  const isFranchisee = user?.roles?.some((r: any) => r.name === 'Franchisee') || false;
  const [hub, setHub] = useState<any>(null);
  const [hubInventory, setHubInventory] = useState<any[]>([]);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    const isFranchiseAccess = parsedUser.roles?.some((r: any) => r.name === "Franchisee" || r.name === "Branch Cashier") || false;
    
    if (!isFranchiseAccess) {
      router.push("/dashboard");
      return;
    }

    setUser(parsedUser);
    if (parsedUser.roles?.some((r: any) => r.name === "Branch Cashier")) {
      setActivePortalTab('pos');
    } else {
      setActivePortalTab('logistics');
    }

    // Initial load for Offline POS Queue
    const savedQueue = localStorage.getItem("pos_offline_queue");
    if (savedQueue) {
      setOfflineQueue(JSON.parse(savedQueue));
    }

    setIsOnline(navigator.onLine);

    const fetchAll = async () => {
      try {
        const [prodRes, orderRes, invRes, custRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/products", { headers: { "Accept": "application/json" } }),
          fetch("http://127.0.0.1:8000/api/orders", { headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" } }),
          fetch("http://127.0.0.1:8000/api/franchise/inventory", { headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" } }),
          fetch("http://127.0.0.1:8000/api/franchise/orders", { headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" } })
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

  const handleLogout = () => {
    localStorage.clear();
    deleteCookie("token");
    deleteCookie("user_role");
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-xs text-brand-earth/60 tracking-wider">Loading Partner Portal...</div>;

  const isFranchiseAccess = user?.roles?.some((r: any) => r.name === "Franchisee" || r.name === "Branch Cashier") || false;
  if (!isFranchiseAccess) return null;

  return (
    <div className="h-screen bg-gray-50/30 flex overflow-hidden relative">
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems.map(item => ({ ...item, price: item.wholesale_price || item.price }))}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
        checkoutText="Place Bulk Order"
      />

      <Sidebar
        activeTab={activePortalTab}
        setActiveTab={setActivePortalTab}
        handleLogout={handleLogout}
        isFranchisee={isFranchisee}
        isCashier={isCashier}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto h-screen relative">
        <header className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-100 text-brand-earth hover:bg-gray-50 hover:text-brand-green transition-all shadow-sm shrink-0"
              aria-label="Toggle Sidebar Menu"
            >
              <List size={20} weight="bold" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-brand-earth uppercase tracking-wide leading-tight">
                Salamat, <span className="text-brand-green">{user?.name?.split(' ')[0]}</span>
              </h2>
              <p className="text-[10px] text-brand-earth/40 font-semibold uppercase tracking-wider mt-0.5 leading-snug">
                {isCashier
                  ? 'Perform POS sales, track shift sessions, and log operational branch expenses'
                  : 'Manage your branch inventory, B2C live checkouts, and terminal sales'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isFranchisee && (
              <>
                <div className="hidden sm:block text-right bg-white border border-gray-100 p-3.5 rounded-xl shadow-sm">
                  <p className="text-[8px] font-semibold uppercase tracking-wider text-brand-earth/40">Active Wholesale Orders</p>
                  <p className="text-sm font-bold text-brand-earth">{orders.filter(o => o.status !== 'delivered').length}</p>
                </div>

                <div 
                  onClick={() => setIsCartOpen(true)} 
                  className="relative cursor-pointer hover:opacity-80 transition-opacity flex items-center p-2.5 rounded-xl border border-gray-100 bg-white shadow-sm shrink-0"
                >
                  <Package size={20} className="text-brand-earth hover:text-brand-green transition-colors" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-brand-green text-white text-[8px] font-semibold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                      {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </header>

        {/* Tab Content */}
        <div key={activePortalTab} className="animate-slide-up space-y-6">
          {activePortalTab === 'logistics' && isFranchisee && (
            <LogisticsTab
              customerOrders={customerOrders}
              handleUpdateCustomerOrderStatus={handleUpdateCustomerOrderStatus}
              products={products}
              handleAddToCart={handleAddToCart}
              hub={hub}
              hubInventory={hubInventory}
              orders={orders}
            />
          )}

          {activePortalTab === 'pos' && (
            <POSCashierTab
              hubInventory={hubInventory}
              handleAddToPOSCart={handleAddToPOSCart}
              offlineQueue={offlineQueue}
              isOnline={isOnline}
              handleManualSync={handleManualSync}
              posCart={posCart}
              posPaymentMethod={posPaymentMethod}
              setPosPaymentMethod={setPosPaymentMethod}
              posChannel={posChannel}
              setPosChannel={setPosChannel}
              handlePOSCheckout={handlePOSCheckout}
              updatePOSCartFlavor={updatePOSCartFlavor}
              updatePOSCartQuantity={updatePOSCartQuantity}
              removeFromPOSCart={removeFromPOSCart}
            />
          )}

          {activePortalTab === 'compliance' && isFranchisee && (
            <QCComplianceManager />
          )}

          {activePortalTab === 'payroll' && (
            <ShiftsPayrollTab
              hub={hub}
              isFranchisee={isFranchisee}
            />
          )}

          {activePortalTab === 'expenses' && (
            <ExpenseTracker />
          )}
        </div>
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
            className="w-full bg-brand-green text-white py-3.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-2xl flex items-center justify-center gap-2 active:scale-95 hover:bg-brand-green/90 transition-all border border-brand-green/10"
          >
            <Package size={14} weight="bold" />
            Review Order Receipt ({posCart.reduce((sum, item) => sum + item.quantity, 0)} items)
          </button>
        </div>
      )}
    </div>
  );
}
