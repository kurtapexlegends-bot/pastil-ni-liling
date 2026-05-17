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

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'applications' | 'orders' | 'products' | 'hubs' | 'supply_chain'>('applications');
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

  const fetchAll = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const [appRes, orderRes, prodRes, hubRes, franRes, ingRes, batchRes, recipeRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/admin/applications", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://127.0.0.1:8000/api/admin/orders", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://127.0.0.1:8000/api/admin/products", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://127.0.0.1:8000/api/admin/hubs", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://127.0.0.1:8000/api/admin/franchisees", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://127.0.0.1:8000/api/admin/inventory/ingredients", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://127.0.0.1:8000/api/admin/inventory/batches", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://127.0.0.1:8000/api/admin/inventory/recipes", { headers: { "Authorization": `Bearer ${token}` } })
      ]);

      const appData = await appRes.json();
      const orderData = await orderRes.json();
      const prodData = await prodRes.json();
      const hubData = await hubRes.json();
      const franData = await franRes.json();
      const ingData = await ingRes.json();
      const batchData = await batchRes.json();
      const recipeData = await recipeRes.json();

      if (appData.success) setApplications(appData.data);
      if (orderData.success) setOrders(orderData.data);
      if (prodData.success) setProducts(prodData.data);
      if (hubData.success) setHubs(hubData.data);
      if (franData.success) setFranchisees(franData.data);
      if (ingData.success) setIngredients(ingData.data);
      if (batchData.success) setBatches(batchData.data);
      if (recipeData.success) setRecipes(recipeData.data);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-brand-earth border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] uppercase tracking-wider font-semibold text-brand-earth/40">Syncing HQ Console...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-gray-100 bg-white flex flex-col justify-between p-6 select-none shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center border border-brand-green/20">
              <span className="text-[11px] font-bold text-brand-green uppercase">HQ</span>
            </div>
            <div>
              <h1 className="text-xs font-bold text-brand-earth uppercase tracking-wider leading-none">Liling's Pastil</h1>
              <p className="text-[9px] font-semibold text-brand-earth/30 uppercase tracking-widest mt-0.5">Control Center</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('applications')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeTab === 'applications'
                  ? 'bg-brand-earth text-white shadow-sm'
                  : 'text-brand-earth/50 hover:bg-gray-50 hover:text-brand-earth'
              }`}
            >
              Partner Applications
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeTab === 'orders'
                  ? 'bg-brand-earth text-white shadow-sm'
                  : 'text-brand-earth/50 hover:bg-gray-50 hover:text-brand-earth'
              }`}
            >
              Order Management
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeTab === 'products'
                  ? 'bg-brand-earth text-white shadow-sm'
                  : 'text-brand-earth/50 hover:bg-gray-50 hover:text-brand-earth'
              }`}
            >
              Product Catalog
            </button>

            <button
              onClick={() => setActiveTab('hubs')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeTab === 'hubs'
                  ? 'bg-brand-earth text-white shadow-sm'
                  : 'text-brand-earth/50 hover:bg-gray-50 hover:text-brand-earth'
              }`}
            >
              Franchise Branches
            </button>

            <button
              onClick={() => setActiveTab('supply_chain')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeTab === 'supply_chain'
                  ? 'bg-brand-earth text-white shadow-sm'
                  : 'text-brand-earth/50 hover:bg-gray-50 hover:text-brand-earth'
              }`}
            >
              Supply Chain & Batches
            </button>
          </nav>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full border border-gray-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-brand-earth/40 transition-colors"
        >
          Sign Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-brand-earth uppercase tracking-wide">
              {activeTab === 'applications' && "Franchise Partnerships"}
              {activeTab === 'orders' && "Order Pipeline"}
              {activeTab === 'products' && "Product Catalog"}
              {activeTab === 'hubs' && "Physical Franchise Spokes"}
              {activeTab === 'supply_chain' && "Commissary Logistics & Batches"}
            </h2>
            <p className="text-[10px] text-brand-earth/40 font-semibold uppercase tracking-wider mt-0.5">
              {activeTab === 'applications' && "Review investment capabilities and applicant targets"}
              {activeTab === 'orders' && "Real-time dispatch and delivery monitoring across hubs"}
              {activeTab === 'products' && "HQ Centralized command and live branch sync"}
              {activeTab === 'hubs' && "Interactive control of regional operations hubs"}
              {activeTab === 'supply_chain' && "FIFO Batch integrity tracking and recipe formula config"}
            </p>
          </div>

          {activeTab === 'products' && (
            <button
              onClick={() => {
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
              className="bg-brand-earth hover:bg-brand-green text-white px-4 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-colors shadow-sm"
            >
              Add Product
            </button>
          )}

          {activeTab === 'hubs' && (
            <button
              onClick={() => {
                setHubForm({
                  id: null,
                  name: "",
                  address: "",
                  franchisee_id: franchisees[0]?.id?.toString() || "",
                  status: "active"
                });
                setIsHubModalOpen(true);
              }}
              className="bg-brand-earth hover:bg-brand-green text-white px-4 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-colors shadow-sm"
            >
              Create Franchise Hub
            </button>
          )}
        </header>

        {/* Stats Grid */}
        <StatsGrid activeTab={activeTab} applications={applications} orders={orders} products={products} hubs={hubs} ingredients={ingredients} batches={batches} />

        {/* Tab-specific Content */}
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
      </main>

      {/* Product Management Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-brand-earth/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-100 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-earth">
                {productForm.id ? "Edit Catalog Item" : "Create Central Product"}
              </h3>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="text-brand-earth/40 hover:text-brand-earth text-lg font-bold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={saveProduct} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/50">Product Name</label>
                <input 
                  type="text" 
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="e.g., Liling's Classic Garlic Chili Oil"
                  className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-brand-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/50">Category</label>
                  <select 
                    value={productForm.category}
                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none bg-white focus:ring-1 focus:ring-brand-green"
                  >
                    <option value="pastil">Pastil</option>
                    <option value="bagoong">Bagoong</option>
                    <option value="chili_oil">Chili Oil</option>
                    <option value="wholesale_bulk">Wholesale Bulk</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/50">Central Stock</label>
                  <input 
                    type="number" 
                    value={productForm.stock}
                    onChange={(e) => setProductForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    required
                    min="0"
                    className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-brand-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/50">Retail Price (₱)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    required
                    min="0"
                    className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-brand-green"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/50">Wholesale Price (₱)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={productForm.wholesale_price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, wholesale_price: parseFloat(e.target.value) || 0 }))}
                    disabled={!productForm.is_wholesale}
                    min="0"
                    className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-brand-green disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>

              <div className="flex gap-4 items-center py-1">
                <label className="flex items-center gap-2 text-xs font-medium text-brand-earth/60 select-none">
                  <input 
                    type="checkbox" 
                    checked={productForm.is_wholesale}
                    onChange={(e) => setProductForm(prev => ({ ...prev, is_wholesale: e.target.checked }))}
                    className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
                  />
                  Available for Wholesale
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-brand-earth/60 select-none">
                  <input 
                    type="checkbox" 
                    checked={productForm.is_active}
                    onChange={(e) => setProductForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
                  />
                  Active/Published
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/50">Product Description</label>
                <textarea 
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  placeholder="e.g., Preservative-free chicken flakes stored in premium coconut oil."
                  className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-brand-green resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsProductModalOpen(false)}
                  className="border border-gray-100 px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-wider hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-brand-earth hover:bg-brand-green text-white px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-wider transition-colors shadow-sm"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hub Management Modal */}
      {isHubModalOpen && (
        <div className="fixed inset-0 bg-brand-earth/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-100 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-earth">
                {hubForm.id ? "Edit Franchise Hub" : "Create Franchise Hub"}
              </h3>
              <button 
                onClick={() => setIsHubModalOpen(false)}
                className="text-brand-earth/40 hover:text-brand-earth text-lg font-bold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={saveHub} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/50">Hub Branch Name</label>
                <input 
                  type="text" 
                  value={hubForm.name}
                  onChange={(e) => setHubForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="e.g., Liling Manila North Hub"
                  className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-brand-green"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/50">Assigned Franchise Partner</label>
                <select 
                  value={hubForm.franchisee_id}
                  onChange={(e) => setHubForm(prev => ({ ...prev, franchisee_id: e.target.value }))}
                  required
                  className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none bg-white focus:ring-1 focus:ring-brand-green"
                >
                  <option value="" disabled>Select a Franchisee</option>
                  {franchisees.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/50">Physical Address</label>
                <input 
                  type="text" 
                  value={hubForm.address}
                  onChange={(e) => setHubForm(prev => ({ ...prev, address: e.target.value }))}
                  required
                  placeholder="e.g., 102 Taft Avenue, Manila City"
                  className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-brand-green"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/50">Hub Status</label>
                <select 
                  value={hubForm.status}
                  onChange={(e) => setHubForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none bg-white focus:ring-1 focus:ring-brand-green"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsHubModalOpen(false)}
                  className="border border-gray-100 px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-wider hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-brand-earth hover:bg-brand-green text-white px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-wider transition-colors shadow-sm"
                >
                  Save Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
