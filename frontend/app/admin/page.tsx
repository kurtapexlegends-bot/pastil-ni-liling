"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Types
import { Product, Hub } from "./types";

// Hooks
import { useAdminProducts } from "../../hooks/admin/useAdminProducts";
import { useAdminHubs } from "../../hooks/admin/useAdminHubs";
import { useAdminSupplyChain } from "../../hooks/admin/useAdminSupplyChain";
import { useAdminOrders } from "../../hooks/admin/useAdminOrders";
import { useConfirm } from "../../hooks/useConfirm";
import { toast } from "sonner";

// Components
import DashboardLayout from "../../components/admin/DashboardLayout";
import StatsGrid from "../../components/admin/StatsGrid";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DashboardSkeleton from "@/components/ui/DashboardSkeleton";
import { deleteCookie } from "@/components/cookieHelper";

// Lazy Loaded Modules
const AnalyticsEngine = dynamic(() => import("../../components/admin/AnalyticsEngine"), {
  ssr: false,
  loading: () => (
    <div className="h-96 flex flex-col items-center justify-center text-xs font-semibold text-brand-earth/40 animate-pulse bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="w-12 h-12 rounded-full border-4 border-brand-green border-t-transparent animate-spin mb-4"></div>
      <p>{"Crunching Business Intelligence..."}</p>
    </div>
  )
});
const FranchiseApplications = dynamic(() => import("../../components/admin/FranchiseApplications"), { loading: () => <p className="p-8 text-xs text-brand-earth/40 animate-pulse">{"Loading module..."}</p> });
const OrderManagement = dynamic(() => import("../../components/admin/OrderManagement"), { loading: () => <p className="p-8 text-xs text-brand-earth/40 animate-pulse">{"Loading module..."}</p> });
const ProductCatalog = dynamic(() => import("../../components/admin/ProductCatalog"), { loading: () => <p className="p-8 text-xs text-brand-earth/40 animate-pulse">{"Loading module..."}</p> });
const FranchiseBranches = dynamic(() => import("../../components/admin/FranchiseBranches"), { loading: () => <p className="p-8 text-xs text-brand-earth/40 animate-pulse">{"Loading module..."}</p> });
const SupplyChainManager = dynamic(() => import("../../components/admin/SupplyChainManager"), { loading: () => <p className="p-8 text-xs text-brand-earth/40 animate-pulse">{"Loading module..."}</p> });
const EmployeeManager = dynamic(() => import("../../components/admin/EmployeeManager"), { loading: () => <p className="p-8 text-xs text-brand-earth/40 animate-pulse">{"Loading module..."}</p> });
const QCComplianceManager = dynamic(() => import("../../components/admin/QCComplianceManager"), { loading: () => <p className="p-8 text-xs text-brand-earth/40 animate-pulse">{"Loading module..."}</p> });
const BranchPayrollManager = dynamic(() => import("../../components/admin/BranchPayrollManager"), { loading: () => <p className="p-8 text-xs text-brand-earth/40 animate-pulse">{"Loading module..."}</p> });
const WebsiteContentManager = dynamic(() => import("@/components/admin/WebsiteContentManager"), { loading: () => <p className="p-8 text-xs text-brand-earth/40 animate-pulse">{"Loading module..."}</p> });

export default function AdminDashboard() {
  const router = useRouter();
  
  // Layout State
  const [activeTab, setActiveTab] = useState<'applications' | 'orders' | 'products' | 'hubs' | 'supply_chain' | 'employees' | 'compliance' | 'payroll' | 'analytics' | 'website_content'>('analytics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Auth State
  const [hasToken, setHasToken] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Global Modals State
  const { alert } = useConfirm();

  // Data Hooks
  const { products, saveProduct, deleteProduct, isLoading: isLoadingProducts } = useAdminProducts(hasToken, activeTab === 'products' || activeTab === 'supply_chain' || activeTab === 'analytics');
  const { hubs, franchisees, saveHub, deleteHub, isLoading: isLoadingHubs } = useAdminHubs(hasToken, activeTab === 'hubs' || activeTab === 'supply_chain' || activeTab === 'analytics');
  const { ingredients, batches, recipes, mutateIngredients, mutateBatches, mutateRecipes, addIngredient, restockIngredient, addBatch, addRecipe, triggerMarkdown, isLoading: isLoadingSupply } = useAdminSupplyChain(hasToken, activeTab === 'supply_chain' || activeTab === 'analytics');
  const { applications, orders, b2bOrders, updateOrderStatus, updateAppStatus, isLoading: isLoadingOrders } = useAdminOrders(hasToken, activeTab === 'orders' || activeTab === 'applications' || activeTab === 'analytics');
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData || userData === "undefined" || userData === "null") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      deleteCookie("token");
      deleteCookie("user_role");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return;
    }
    try {
      const parsedUser = JSON.parse(userData);
      const roles = parsedUser?.roles || [];
      const hasAdminAccess = roles.some((r: any) => r.name === "Admin" || r.name === "HQ operations");
      if (!hasAdminAccess) {
        deleteCookie("token");
        deleteCookie("user_role");
        if (typeof window !== "undefined") {
          window.location.href = "/dashboard";
        }
        return;
      }
      setHasToken(true);
      setAuthLoading(false);
    } catch (e) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      deleteCookie("token");
      deleteCookie("user_role");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    deleteCookie("token");
    deleteCookie("user_role");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const handleOrderTransition = async (id: number, status: string, isB2B: boolean = false) => {
    const result = await updateOrderStatus(id, status, isB2B);
    if (!result.success) {
      alert({
        title: "Transition Rejected",
        message: result.message || "Invalid state transition.",
        isDestructive: true
      });
    } else {
      toast.success(`Order #${id} marked as ${status.replace('_', ' ')}`);
    }
  };

  if (!hasToken && authLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center items-center font-sans">
        <div className="w-10 h-10 rounded-full border-4 border-brand-green border-t-transparent animate-spin mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-brand-earth/40 animate-pulse">{"Authenticating Administrator..."}</p>
      </div>
    );
  }

  const isDataLoading = 
    (activeTab === 'products' && isLoadingProducts) ||
    (activeTab === 'hubs' && isLoadingHubs) ||
    (activeTab === 'supply_chain' && isLoadingSupply) ||
    (activeTab === 'orders' && isLoadingOrders);

  return (
    <>
      <DashboardLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        {isDataLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <StatsGrid 
              activeTab={activeTab} 
              applications={applications} 
              orders={orders} 
              products={products} 
              hubs={hubs} 
              ingredients={ingredients} 
              batches={batches} 
            />

            <div key={activeTab} className="animate-slide-up space-y-6">
              {activeTab === 'analytics' && <AnalyticsEngine />}
              
              {activeTab === 'applications' && (
                <FranchiseApplications applications={applications} updateAppStatus={updateAppStatus} />
              )}
              
              {activeTab === 'orders' && (
                <OrderManagement 
                  orders={orders} 
                  b2bOrders={b2bOrders} 
                  updateOrderStatus={handleOrderTransition} 
                />
              )}
              
              {activeTab === 'products' && (
                <ProductCatalog 
                  products={products}
                  saveProduct={saveProduct}
                  deleteProduct={deleteProduct}
                />
              )}
              
              {activeTab === 'hubs' && (
                <FranchiseBranches 
                  hubs={hubs} 
                  franchisees={franchisees}
                  saveHub={saveHub}
                  deleteHub={deleteHub}
                />
              )}
              
              {activeTab === 'supply_chain' && (
                <SupplyChainManager
                  ingredients={ingredients}
                  batches={batches}
                  recipes={recipes}
                  products={products}
                  hubs={hubs}
                  fetchIngredients={mutateIngredients as any}
                  fetchBatches={mutateBatches as any}
                  fetchRecipes={mutateRecipes as any}
                  addIngredient={addIngredient}
                  restockIngredient={restockIngredient}
                  addBatch={addBatch}
                  addRecipe={addRecipe}
                  triggerMarkdown={triggerMarkdown}
                />
              )}

              {activeTab === 'employees' && <EmployeeManager />}
              {activeTab === 'compliance' && <QCComplianceManager />}
              {activeTab === 'payroll' && <BranchPayrollManager />}
              {activeTab === 'website_content' && <WebsiteContentManager />}
              </div>
              </>
              )}
              </DashboardLayout>
              </>
              );
              }
