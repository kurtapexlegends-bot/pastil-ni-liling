"use client";

import dynamic from "next/dynamic";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product, FranchiseApplication, Hub, Order, FranchiseeUser, Ingredient, InventoryBatch, ProductIngredient } from "./types";
import StatsGrid from "../../components/admin/StatsGrid";
const FranchiseApplications = dynamic(() => import("../../components/admin/FranchiseApplications"), { loading: () => <p className="p-8 text-xs text-brand-earth/40 animate-pulse">Loading module...</p> });
const OrderManagement = dynamic(() => import("../../components/admin/OrderManagement"), { loading: () => <p className="p-8 text-xs text-brand-earth/40 animate-pulse">Loading module...</p> });
const ProductCatalog = dynamic(() => import("../../components/admin/ProductCatalog"), { loading: () => <p className="p-8 text-xs text-brand-earth/40 animate-pulse">Loading module...</p> });
const FranchiseBranches = dynamic(() => import("../../components/admin/FranchiseBranches"), { loading: () => <p className="p-8 text-xs text-brand-earth/40 animate-pulse">Loading module...</p> });
const SupplyChainManager = dynamic(() => import("../../components/admin/SupplyChainManager"), { loading: () => <p className="p-8 text-xs text-brand-earth/40 animate-pulse">Loading module...</p> });
import DashboardLayout from "../../components/admin/DashboardLayout";
import ProductModal from "../../components/admin/ProductModal";
import HubModal from "../../components/admin/HubModal";
const EmployeeManager = dynamic(() => import("../../components/admin/EmployeeManager"), { loading: () => <p className="p-8 text-xs text-brand-earth/40 animate-pulse">Loading module...</p> });
const QCComplianceManager = dynamic(() => import("../../components/admin/QCComplianceManager"), { loading: () => <p className="p-8 text-xs text-brand-earth/40 animate-pulse">Loading module...</p> });
const BranchPayrollManager = dynamic(() => import("../../components/admin/BranchPayrollManager"), { loading: () => <p className="p-8 text-xs text-brand-earth/40 animate-pulse">Loading module...</p> });
const AnalyticsEngine = dynamic(() => import("../../components/admin/AnalyticsEngine"), {
  ssr: false,
  loading: () => <div className="h-96 flex flex-col items-center justify-center text-xs font-semibold text-brand-earth/40 animate-pulse bg-white rounded-2xl border border-gray-100 shadow-sm">
    <div className="w-12 h-12 rounded-full border-4 border-brand-green border-t-transparent animate-spin mb-4"></div>
    <p>Crunching Business Intelligence...</p>
  </div>
});
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DashboardSkeleton from "@/components/ui/DashboardSkeleton";
import { deleteCookie } from "@/components/cookieHelper";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'applications' | 'orders' | 'products' | 'hubs' | 'supply_chain' | 'employees' | 'compliance' | 'payroll' | 'analytics'>('analytics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals / Form States
  const [productForm, setProductForm] = useState<Product>({
    id: null,
    name: "",
    description: "",
    price: 0,
    wholesale_price: 0,
    stock: 0,
    category: "pastil",
    is_wholesale: false,
    is_active: true
  });
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [hubForm, setHubForm] = useState<Hub>({
    id: null,
    name: "",
    address: "",
    franchisee_id: "",
    status: "active"
  });
  const [isHubModalOpen, setIsHubModalOpen] = useState(false);

  const [hasToken, setHasToken] = useState(false);
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, title: string, message: string, action: () => void}>({
    isOpen: false, title: "", message: "", action: () => {}
  });

  const fetcher = (url: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token");
    return fetch(url, { headers: { "Authorization": `Bearer ${token}` } }).then(res => res.json());
  };

  const { data: appsRes, mutate: mutateApps } = useSWR(hasToken && activeTab === 'applications' ? "http://127.0.0.1:8000/api/admin/applications" : null, fetcher);
  const applications = appsRes?.data || [];

  const { data: ordersRes, mutate: mutateOrders } = useSWR(hasToken && activeTab === 'orders' ? "http://127.0.0.1:8000/api/admin/orders" : null, fetcher);
  const orders = ordersRes?.data || [];

  const { data: b2bOrdersRes, mutate: mutateB2bOrders } = useSWR(hasToken && activeTab === 'orders' ? "http://127.0.0.1:8000/api/admin/commissary-orders" : null, fetcher);
  const b2bOrders = b2bOrdersRes?.data || [];

  const { data: prodsRes, mutate: mutateProducts } = useSWR(hasToken && activeTab === 'products' ? "http://127.0.0.1:8000/api/admin/products" : null, fetcher);
  const products = prodsRes?.data || [];

  const { data: hubsRes, mutate: mutateHubs } = useSWR(hasToken && activeTab === 'hubs' ? "http://127.0.0.1:8000/api/admin/hubs" : null, fetcher);
  const hubs = hubsRes?.data || [];

  const { data: franRes, mutate: mutateFranchisees } = useSWR(hasToken && activeTab === 'hubs' ? "http://127.0.0.1:8000/api/admin/franchisees" : null, fetcher);
  const franchisees = franRes?.data || [];

  const { data: ingRes, mutate: mutateIngredients } = useSWR(hasToken && activeTab === 'supply_chain' ? "http://127.0.0.1:8000/api/admin/inventory/ingredients" : null, fetcher);
  const ingredients = ingRes?.data || [];

  const { data: batRes, mutate: mutateBatches } = useSWR(hasToken && activeTab === 'supply_chain' ? "http://127.0.0.1:8000/api/admin/inventory/batches" : null, fetcher);
  const batches = batRes?.data || [];

  const { data: recRes, mutate: mutateRecipes } = useSWR(hasToken && activeTab === 'supply_chain' ? "http://127.0.0.1:8000/api/admin/inventory/recipes" : null, fetcher);
  const recipes = recRes?.data || [];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    const roles = parsedUser.roles || [];
    const hasAdminAccess = roles.some((r: any) => r.name === "Admin" || r.name === "HQ operations");
    if (!hasAdminAccess) {
      router.push("/dashboard");
      return;
    }
    setHasToken(true);
    setLoading(false);
  }, [router]);

  const updateOrderStatus = async (id: number, status: string, isB2B: boolean = false) => {
    const token = localStorage.getItem("token");
    const endpoint = isB2B 
      ? `http://127.0.0.1:8000/api/admin/commissary-orders/${id}`
      : `http://127.0.0.1:8000/api/admin/orders/${id}`;

    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ status })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      if (isB2B) {
        mutateB2bOrders();
      } else {
        mutateOrders();
      }
    } else {
      setConfirmState({
        isOpen: true,
        title: "Transition Rejected",
        message: data.message || "Invalid state transition.",
        action: () => setConfirmState(prev => ({ ...prev, isOpen: false }))
      });
      // Force UI to revert back to true server state
      if (isB2B) {
        mutateB2bOrders();
      } else {
        mutateOrders();
      }
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
      mutateApps();
    }
  };

  // Product CRUD
  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const isEdit = productForm.id !== null;
    const url = isEdit 
      ? `http://127.0.0.1:8000/api/admin/products/${productForm.id}`
      : "http://127.0.0.1:8000/api/admin/products";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        ...productForm,
        price: parseFloat(productForm.price.toString()),
        wholesale_price: productForm.is_wholesale ? parseFloat(productForm.wholesale_price.toString()) : null,
        stock: parseInt(productForm.stock.toString()),
      })
    });

    if (res.ok) {
      setIsProductModalOpen(false);
      mutateProducts();
    }
  };

  const deleteProduct = (id: number) => {
    setConfirmState({
      isOpen: true,
      title: "Delete Product",
      message: "Are you sure you want to delete this product? This action cannot be undone and will remove it from the catalog.",
      action: async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://127.0.0.1:8000/api/admin/products/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) mutateProducts();
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Hub CRUD
  const saveHub = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const isEdit = hubForm.id !== null;
    const url = isEdit 
      ? `http://127.0.0.1:8000/api/admin/hubs/${hubForm.id}`
      : "http://127.0.0.1:8000/api/admin/hubs";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        ...hubForm,
        franchisee_id: parseInt(hubForm.franchisee_id.toString())
      })
    });

    if (res.ok) {
      setIsHubModalOpen(false);
      mutateHubs();
    }
  };

  const deleteHub = (id: number) => {
    setConfirmState({
      isOpen: true,
      title: "Delete Branch Hub",
      message: "Are you sure you want to delete this branch? This action cannot be undone.",
      action: async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://127.0.0.1:8000/api/admin/hubs/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) mutateHubs();
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Supply Chain Mutations
  const addIngredient = async (data: any) => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://127.0.0.1:8000/api/admin/inventory/ingredients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to create ingredient.");
    }
  };

  const restockIngredient = async (id: number, qty: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://127.0.0.1:8000/api/admin/inventory/ingredients/${id}/restock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ quantity: qty })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to restock ingredient.");
    }
  };

  const addBatch = async (data: any) => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://127.0.0.1:8000/api/admin/inventory/batches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to register production batch.");
    }
  };

  const addRecipe = async (data: any) => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://127.0.0.1:8000/api/admin/inventory/recipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to configure recipe formulation.");
    }
  };

  const triggerMarkdown = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://127.0.0.1:8000/api/admin/inventory/batches/markdown", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to trigger markdown scan.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    deleteCookie("token");
    deleteCookie("user_role");
    router.push("/login");
  };

  if (!hasToken) {
    return null;
  }

  const isDataLoading = 
    (activeTab === 'applications' && !appsRes) ||
    (activeTab === 'orders' && !ordersRes) ||
    (activeTab === 'products' && !prodsRes) ||
    (activeTab === 'hubs' && (!hubsRes || !franRes)) ||
    (activeTab === 'supply_chain' && (!ingRes || !batRes || !recRes));

  return (
    <>
      <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      handleLogout={handleLogout}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      headerProps={{
        onAddProduct: () => {
          setProductForm({
            id: null,
            name: "",
            description: "",
            price: 0,
            wholesale_price: 0,
            stock: 0,
            category: "pastil",
            is_wholesale: false,
            is_active: true
          });
          setIsProductModalOpen(true);
        },
        onCreateHub: () => {
          setHubForm({
            id: null,
            name: "",
            address: "",
            franchisee_id: franchisees[0]?.id?.toString() || "",
            status: "active"
          });
          setIsHubModalOpen(true);
        }
      }}
    >
        {isDataLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Stats Grid */}
            <StatsGrid activeTab={activeTab} applications={applications} orders={orders} products={products} hubs={hubs} ingredients={ingredients} batches={batches} />

            {/* Tab-specific Content with Premium Slide-Up Motion Transitions */}
            <div key={activeTab} className="animate-slide-up space-y-6">
          {activeTab === 'analytics' && (
            <AnalyticsEngine />
          )}

          {activeTab === 'applications' && (
            <FranchiseApplications applications={applications} updateAppStatus={updateAppStatus} />
          )}

          {activeTab === 'orders' && (
            <OrderManagement orders={orders} b2bOrders={b2bOrders} updateOrderStatus={updateOrderStatus} />
          )}

          {activeTab === 'products' && (
            <ProductCatalog 
              products={products} 
              setProductForm={setProductForm} 
              setIsProductModalOpen={setIsProductModalOpen} 
              deleteProduct={deleteProduct} 
            />
          )}

          {activeTab === 'hubs' && (
            <div className="space-y-8">
              <FranchiseBranches 
                hubs={hubs} 
                franchisees={franchisees} 
                setHubForm={setHubForm} 
                setIsHubModalOpen={setIsHubModalOpen} 
                deleteHub={deleteHub} 
              />
            </div>
          )}

          {activeTab === 'supply_chain' && (
            <SupplyChainManager
              ingredients={ingredients}
              batches={batches}
              recipes={recipes}
              products={products}
              hubs={hubs}
              fetchIngredients={async () => { await mutateIngredients(); }}
              fetchBatches={async () => { await mutateBatches(); }}
              fetchRecipes={async () => { await mutateRecipes(); }}
              addIngredient={addIngredient}
              restockIngredient={restockIngredient}
              addBatch={addBatch}
              addRecipe={addRecipe}
              triggerMarkdown={triggerMarkdown}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeeManager />
          )}

          {activeTab === 'compliance' && (
            <QCComplianceManager />
          )}

          {activeTab === 'payroll' && (
            <BranchPayrollManager />
          )}
        </div>
        </>
        )}
      </DashboardLayout>

      <ConfirmationModal 
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmState.action}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productForm={productForm}
        setProductForm={setProductForm}
        saveProduct={saveProduct}
      />

      <HubModal
        isOpen={isHubModalOpen}
        onClose={() => setIsHubModalOpen(false)}
        hubForm={hubForm}
        setHubForm={setHubForm}
        franchisees={franchisees}
        saveHub={saveHub}
      />
    </>
  );
}
