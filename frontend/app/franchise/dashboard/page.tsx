"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Warning, Package, Truck, DeviceTablet, ShieldCheck, Coins, List } from "@phosphor-icons/react";
import CartDrawer from "@/components/CartDrawer";
import { Product, CartItem } from "@/types";
import QCComplianceManager from "@/components/admin/QCComplianceManager";
import ExpenseTracker from "@/components/admin/ExpenseTracker";
import { deleteCookie } from "@/components/cookieHelper";
import { usePOS } from "@/hooks/usePOS";
import { useWholesaleCart } from "@/hooks/useWholesaleCart";

// Modularized components
import LogisticsTab from "@/components/franchise/LogisticsTab";
import POSCashierTab from "@/components/franchise/POSCashierTab";
import ShiftsPayrollTab from "@/components/franchise/ShiftsPayrollTab";
import Sidebar from "@/components/franchise/Sidebar";
import AlertModal from "@/components/ui/AlertModal";
import DashboardSkeleton from "@/components/ui/DashboardSkeleton";

export default function FranchiseDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const isCashier = user?.roles?.some((r: any) => r.name === 'Branch Cashier') || false;
  const isFranchisee = user?.roles?.some((r: any) => r.name === 'Franchisee') || false;
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePortalTab, setActivePortalTab] = useState<'logistics' | 'pos' | 'compliance' | 'payroll' | 'expenses'>('logistics');

  const [alertState, setAlertState] = useState<{isOpen: boolean, message: string, type: 'info'|'success'|'error'}>({isOpen: false, message: "", type: "info"});
  const customAlert = (message: string, type: 'info'|'success'|'error' = 'info') => setAlertState({isOpen: true, message, type});

  const fetcher = (url: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token");
    return fetch(url, { headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" } }).then(res => res.json());
  };

  const { data: ordersRes, mutate: mutateOrders } = useSWR(user ? "http://127.0.0.1:8000/api/franchise/commissary-orders" : null, fetcher);
  const orders = ordersRes?.success ? ordersRes.data : [];

  const { data: invRes, mutate: mutateInventory } = useSWR(user ? "http://127.0.0.1:8000/api/franchise/inventory" : null, fetcher, { refreshInterval: 60000 });
  const hub = invRes?.success ? invRes.hub : null;
  const hubInventory = invRes?.success ? invRes.data : [];

  const { data: prodRes, mutate: mutateProducts } = useSWR(activePortalTab === 'logistics' && user ? "http://127.0.0.1:8000/api/products" : null, fetcher);
  const products = prodRes?.success ? prodRes.data.filter((p: any) => p.is_wholesale) : [];

  const { data: custRes, mutate: mutateCustomerOrders } = useSWR(activePortalTab === 'logistics' && user ? "http://127.0.0.1:8000/api/franchise/orders" : null, fetcher, { refreshInterval: 60000 });
  const customerOrders = custRes?.success ? custRes.data : [];

  const {
    cartItems, isCartOpen, setIsCartOpen, isCheckingOut,
    handleAddToCart, updateQuantity, removeFromCart, handleCheckout: processCheckout
  } = useWholesaleCart(customAlert);

  const {
    posCart, offlineQueue, isOnline, isSyncing, isPOSCheckingOut,
    posPaymentMethod, setPosPaymentMethod, posChannel, setPosChannel,
    handleManualSync, handleAddToPOSCart, updatePOSCartQuantity,
    updatePOSCartFlavor, removeFromPOSCart, handlePOSCheckout
  } = usePOS(hubInventory, mutateInventory, customAlert);

  const handleCheckout = () => processCheckout(hub, user, mutateOrders, mutateInventory);

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

    setLoading(false);
  }, [router]);



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
        mutateCustomerOrders();
        customAlert(`Order status updated to: ${nextStatus}`);
      } else {
        customAlert("Failed to update status: " + (data.message || "Unknown error"), "error");
        mutateCustomerOrders();
      }
    } catch (err) {
      console.error(err);
      customAlert("Error updating order status.");
    }
  };



  const handleLogout = () => {
    localStorage.clear();
    deleteCookie("token");
    deleteCookie("user_role");
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-50/30 flex overflow-hidden">
        {/* We can show a skeleton immediately */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

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
        isWholesale={true}
        isCheckingOut={isCheckingOut}
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
                  <p className="text-sm font-bold text-brand-earth">{orders.filter((o: any) => o.status !== 'delivered').length}</p>
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
              isSyncing={isSyncing}
              isPOSCheckingOut={isPOSCheckingOut}
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
            <Package 
              key={posCart.reduce((sum, item) => sum + item.quantity, 0)}
              size={16} 
              weight="bold" 
              className="animate-in zoom-in-75 duration-300"
            />
            Review Order Receipt ({posCart.reduce((sum, item) => sum + item.quantity, 0)} items)
          </button>
        </div>
      )}

      <AlertModal 
        isOpen={alertState.isOpen}
        title={alertState.type === 'error' ? "Action Failed" : alertState.type === 'success' ? "Success" : "Information"}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
