"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product, FranchiseApplication, Hub, Order, FranchiseeUser, Ingredient, InventoryBatch, ProductIngredient } from "./types";
import StatsGrid from "../../components/admin/StatsGrid";
import FranchiseApplications from "../../components/admin/FranchiseApplications";
import OrderManagement from "../../components/admin/OrderManagement";
import ProductCatalog from "../../components/admin/ProductCatalog";
import FranchiseBranches from "../../components/admin/FranchiseBranches";
import SupplyChainManager from "../../components/admin/SupplyChainManager";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import ProductModal from "../../components/admin/ProductModal";
import HubModal from "../../components/admin/HubModal";
import EmployeeManager from "../../components/admin/EmployeeManager";
import QCComplianceManager from "../../components/admin/QCComplianceManager";
import BranchPayrollManager from "../../components/admin/BranchPayrollManager";
import AnalyticsEngine from "../../components/admin/AnalyticsEngine";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'applications' | 'orders' | 'products' | 'hubs' | 'supply_chain' | 'employees' | 'compliance' | 'payroll' | 'analytics'>('analytics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [applications, setApplications] = useState<FranchiseApplication[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [franchisees, setFranchisees] = useState<FranchiseeUser[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [recipes, setRecipes] = useState<ProductIngredient[]>([]);
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

  const fetchAll = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const fetchApp = fetch("http://127.0.0.1:8000/api/admin/applications", { headers: { "Authorization": `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { if (data.success) setApplications(data.data); });

      const fetchOrders = fetch("http://127.0.0.1:8000/api/admin/orders", { headers: { "Authorization": `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { if (data.success) setOrders(data.data); });

      const fetchProducts = fetch("http://127.0.0.1:8000/api/admin/products", { headers: { "Authorization": `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { if (data.success) setProducts(data.data); });

      const fetchHubs = fetch("http://127.0.0.1:8000/api/admin/hubs", { headers: { "Authorization": `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { if (data.success) setHubs(data.data); });

      const fetchFranchisees = fetch("http://127.0.0.1:8000/api/admin/franchisees", { headers: { "Authorization": `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { if (data.success) setFranchisees(data.data); });

      const fetchIngredients = fetch("http://127.0.0.1:8000/api/admin/inventory/ingredients", { headers: { "Authorization": `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { if (data.success) setIngredients(data.data); });

      const fetchBatches = fetch("http://127.0.0.1:8000/api/admin/inventory/batches", { headers: { "Authorization": `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { if (data.success) setBatches(data.data); });

      const fetchRecipes = fetch("http://127.0.0.1:8000/api/admin/inventory/recipes", { headers: { "Authorization": `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { if (data.success) setRecipes(data.data); });

      await Promise.allSettled([
        fetchApp,
        fetchOrders,
        fetchProducts,
        fetchHubs,
        fetchFranchisees,
        fetchIngredients,
        fetchBatches,
        fetchRecipes
      ]);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setHasToken(true);
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
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: status as 'pending' | 'reviewed' | 'approved' | 'rejected' } : a));
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
      fetchAll();
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`http://127.0.0.1:8000/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) fetchAll();
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
      fetchAll();
    }
  };

  const deleteHub = async (id: number) => {
    if (!confirm("Are you sure you want to delete this branch?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`http://127.0.0.1:8000/api/admin/hubs/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) fetchAll();
  };

  // Supply Chain Fetchers & Mutations
  const fetchIngredients = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://127.0.0.1:8000/api/admin/inventory/ingredients", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const json = await res.json();
    if (json.success) setIngredients(json.data);
  };

  const fetchBatches = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://127.0.0.1:8000/api/admin/inventory/batches", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const json = await res.json();
    if (json.success) setBatches(json.data);
  };

  const fetchRecipes = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://127.0.0.1:8000/api/admin/inventory/recipes", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const json = await res.json();
    if (json.success) setRecipes(json.data);
  };

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
    router.push("/login");
  };

  if (!hasToken) {
    return null;
  }

  return (
    <div className="h-screen bg-gray-50/30 flex overflow-hidden relative">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto h-screen relative">
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-green/20 overflow-hidden z-50">
            <div className="h-full bg-brand-green animate-pulse w-1/3 rounded-full"></div>
          </div>
        )}
        <AdminHeader
          activeTab={activeTab}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onAddProduct={() => {
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
          }}
          onCreateHub={() => {
            setHubForm({
              id: null,
              name: "",
              address: "",
              franchisee_id: franchisees[0]?.id?.toString() || "",
              status: "active"
            });
            setIsHubModalOpen(true);
          }}
        />

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
            <OrderManagement orders={orders} updateOrderStatus={updateOrderStatus} />
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
            <FranchiseBranches 
              hubs={hubs} 
              franchisees={franchisees} 
              setHubForm={setHubForm} 
              setIsHubModalOpen={setIsHubModalOpen} 
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
              fetchIngredients={fetchIngredients}
              fetchBatches={fetchBatches}
              fetchRecipes={fetchRecipes}
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
      </main>

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
    </div>
  );
}
