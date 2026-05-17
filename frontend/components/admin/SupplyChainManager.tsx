import { useState } from "react";
import { Ingredient, InventoryBatch, ProductIngredient, Product, Hub } from "../../app/admin/types";

interface SupplyChainManagerProps {
  ingredients: Ingredient[];
  batches: InventoryBatch[];
  recipes: ProductIngredient[];
  products: Product[];
  hubs: Hub[];
  fetchIngredients: () => Promise<void>;
  fetchBatches: () => Promise<void>;
  fetchRecipes: () => Promise<void>;
  addIngredient: (data: any) => Promise<void>;
  restockIngredient: (id: number, qty: number) => Promise<void>;
  addBatch: (data: any) => Promise<void>;
  addRecipe: (data: any) => Promise<void>;
  triggerMarkdown: () => Promise<void>;
}

export default function SupplyChainManager({
  ingredients,
  batches,
  recipes,
  products,
  hubs,
  fetchIngredients,
  fetchBatches,
  fetchRecipes,
  addIngredient,
  restockIngredient,
  addBatch,
  addRecipe,
  triggerMarkdown
}: SupplyChainManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'ingredients' | 'batches' | 'recipes'>('ingredients');

  // Modals state
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  // Form states
  const [ingredientForm, setIngredientForm] = useState({ name: "", unit: "kg", stock: 0, min_stock: 10, unit_cost: 0 });
  const [selectedIngredientId, setSelectedIngredientId] = useState<number | null>(null);
  const [restockQty, setRestockQty] = useState(0);
  const [batchForm, setBatchForm] = useState({
    batch_number: `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    product_id: "",
    hub_id: "",
    initial_quantity: 100,
    manufacture_date: new Date().toISOString().slice(0, 10),
    expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  });
  const [recipeForm, setRecipeForm] = useState({ product_id: "", ingredient_id: "", quantity_required: 0.1 });

  // Error/Success state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await addIngredient(ingredientForm);
      setSuccessMsg("Raw ingredient type added successfully!");
      setIsIngredientModalOpen(false);
      setIngredientForm({ name: "", unit: "kg", stock: 0, min_stock: 10, unit_cost: 0 });
      await fetchIngredients();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to add ingredient.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestockIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredientId || restockQty <= 0) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await restockIngredient(selectedIngredientId, restockQty);
      setSuccessMsg("HQ Commissary restock recorded successfully!");
      setIsRestockModalOpen(false);
      setSelectedIngredientId(null);
      setRestockQty(0);
      await fetchIngredients();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to restock ingredient.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchForm.product_id) {
      setErrorMsg("Please select a product.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await addBatch({
        ...batchForm,
        product_id: parseInt(batchForm.product_id),
        hub_id: batchForm.hub_id ? parseInt(batchForm.hub_id) : null,
        initial_quantity: parseInt(batchForm.initial_quantity as any)
      });
      setSuccessMsg("Manufacture batch intake completed and ingredients depleted!");
      setIsBatchModalOpen(false);
      setBatchForm({
        batch_number: `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        product_id: "",
        hub_id: "",
        initial_quantity: 100,
        manufacture_date: new Date().toISOString().slice(0, 10),
        expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      });
      await fetchBatches();
      await fetchIngredients();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to record batch. Make sure ingredients are sufficient.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeForm.product_id || !recipeForm.ingredient_id) {
      setErrorMsg("Please select product and ingredient.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await addRecipe({
        product_id: parseInt(recipeForm.product_id),
        ingredient_id: parseInt(recipeForm.ingredient_id),
        quantity_required: parseFloat(recipeForm.quantity_required as any)
      });
      setSuccessMsg("Product recipe formula updated successfully!");
      setIsRecipeModalOpen(false);
      setRecipeForm({ product_id: "", ingredient_id: "", quantity_required: 0.1 });
      await fetchRecipes();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save recipe formula.");
    } finally {
      setLoading(false);
    }
  };

  const handleScanMarkdowns = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await triggerMarkdown();
      setSuccessMsg("Batch markdown scan completed! Dispatched 30% discounts for near-expiry jars.");
      await fetchBatches();
    } catch (err: any) {
      setErrorMsg(err.message || "Markdown trigger failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs & HQ Scan Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex border-b border-gray-100 gap-6">
          <button
            onClick={() => setActiveSubTab('ingredients')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeSubTab === 'ingredients' ? 'border-b-2 border-brand-green text-brand-green font-bold' : 'text-brand-earth/40 hover:text-brand-earth'
            }`}
          >
            Commissary Ingredients
          </button>
          <button
            onClick={() => setActiveSubTab('batches')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeSubTab === 'batches' ? 'border-b-2 border-brand-green text-brand-green font-bold' : 'text-brand-earth/40 hover:text-brand-earth'
            }`}
          >
            FIFO Batches Tracker
          </button>
          <button
            onClick={() => setActiveSubTab('recipes')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeSubTab === 'recipes' ? 'border-b-2 border-brand-green text-brand-green font-bold' : 'text-brand-earth/40 hover:text-brand-earth'
            }`}
          >
            Recipe Formulations
          </button>
        </div>

        <div className="flex gap-2">
          {activeSubTab === 'ingredients' && (
            <>
              <button
                onClick={() => setIsIngredientModalOpen(true)}
                className="bg-white border border-gray-100 text-brand-earth hover:bg-gray-50 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
              >
                Add Ingredient Type
              </button>
              <button
                onClick={() => setIsRestockModalOpen(true)}
                className="bg-brand-green text-white hover:bg-brand-green/90 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
              >
                Restock Commissary
              </button>
            </>
          )}

          {activeSubTab === 'batches' && (
            <>
              <button
                onClick={handleScanMarkdowns}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm disabled:opacity-50"
              >
                Scan Near-Expiries (Markdown)
              </button>
              <button
                onClick={() => setIsBatchModalOpen(true)}
                className="bg-brand-green text-white hover:bg-brand-green/90 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
              >
                Log Production Intake
              </button>
            </>
          )}

          {activeSubTab === 'recipes' && (
            <button
              onClick={() => setIsRecipeModalOpen(true)}
              className="bg-brand-green text-white hover:bg-brand-green/90 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
            >
              Configure Recipe Map
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-green-50 border border-green-100 text-green-700 p-4 rounded-xl text-xs flex justify-between items-center shadow-sm">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="font-bold hover:text-green-900">×</button>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl text-xs flex justify-between items-center shadow-sm">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold hover:text-red-900">×</button>
        </div>
      )}

      {/* Main SubTab Content */}
      {activeSubTab === 'ingredients' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Ingredient Name</th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Current Stock</th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Depletion Limit</th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Unit Cost</th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Status</th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Commissary Spoke</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-brand-earth/40 font-normal">
                      No raw ingredients registered. Click "Add Ingredient Type" to begin.
                    </td>
                  </tr>
                ) : (
                  ingredients.map((ingredient) => {
                    const isLowStock = Number(ingredient.stock) <= Number(ingredient.min_stock);
                    return (
                      <tr key={ingredient.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4 border-b border-gray-100 text-xs font-semibold text-brand-earth">
                          {ingredient.name}
                        </td>
                        <td className="px-6 py-4 border-b border-gray-100 text-xs font-medium text-brand-earth/70">
                          {Number(ingredient.stock).toFixed(2)} {ingredient.unit}
                        </td>
                        <td className="px-6 py-4 border-b border-gray-100 text-xs font-medium text-brand-earth/40">
                          {Number(ingredient.min_stock).toFixed(2)} {ingredient.unit}
                        </td>
                        <td className="px-6 py-4 border-b border-gray-100 text-xs font-semibold text-brand-green">
                          ₱ {Number(ingredient.unit_cost || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 border-b border-gray-100">
                          <span className={`px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider ${
                            isLowStock ? 'bg-amber-50 text-amber-700 border border-amber-100/50' : 'bg-green-50 text-green-700 border border-green-100/50'
                          }`}>
                            {isLowStock ? 'Low Stock Depletion' : 'Optimal'}
                          </span>
                        </td>
                        <td className="px-6 py-4 border-b border-gray-100 text-[10px] text-brand-earth/40">
                          HQ Commissary Hub
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'batches' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Batch Code</th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Product Name</th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Current Qty</th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Hub Destination</th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Mfg & Expiry</th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Markdown Badge</th>
                </tr>
              </thead>
              <tbody>
                {batches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-brand-earth/40 font-normal">
                      No active FIFO manufacturing batches tracked yet. Click "Log Production Intake".
                    </td>
                  </tr>
                ) : (
                  batches.map((batch) => {
                    const expiryDateObj = new Date(batch.expiry_date);
                    const daysRemaining = Math.ceil((expiryDateObj.getTime() - Date.now()) / (1000 * 3600 * 24));
                    const isNearExpiry = daysRemaining <= 3 && daysRemaining >= 0;
                    return (
                      <tr key={batch.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4 border-b border-gray-100 text-xs font-semibold text-brand-earth">
                          {batch.batch_number}
                        </td>
                        <td className="px-6 py-4 border-b border-gray-100 text-xs font-medium text-brand-earth/70">
                          {batch.product?.name || `Product ID: ${batch.product_id}`}
                        </td>
                        <td className="px-6 py-4 border-b border-gray-100 text-xs font-semibold text-brand-earth">
                          {batch.quantity} <span className="text-brand-earth/30 font-normal">/ {batch.initial_quantity} jars</span>
                        </td>
                        <td className="px-6 py-4 border-b border-gray-100 text-xs text-brand-earth/60 font-medium">
                          {batch.hub?.name || 'HQ Commissary (Central)'}
                        </td>
                        <td className="px-6 py-4 border-b border-gray-100 text-[10px] text-brand-earth/50">
                          <div>Mfg: {batch.manufacture_date.slice(0, 10)}</div>
                          <div>Exp: {batch.expiry_date.slice(0, 10)} ({daysRemaining} days left)</div>
                        </td>
                        <td className="px-6 py-4 border-b border-gray-100">
                          {batch.discount_triggered ? (
                            <span className="px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                              30% OFF Flash Sale
                            </span>
                          ) : isNearExpiry ? (
                            <span className="px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200 animate-pulse">
                              Pending Discount
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-lg text-[8px] font-semibold uppercase tracking-wider text-brand-earth/30">
                              Optimal Shelf Life
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'recipes' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Retail Jar Specification</th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Required Ingredient</th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Ingredient Multiplier (Per Jar)</th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Commissary Source</th>
                </tr>
              </thead>
              <tbody>
                {recipes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-xs text-brand-earth/40 font-normal">
                      No recipes mapped. Click "Configure Recipe Map" to assign commissary depletion rules.
                    </td>
                  </tr>
                ) : (
                  recipes.map((recipe) => (
                    <tr key={recipe.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4 border-b border-gray-100 text-xs font-semibold text-brand-earth">
                        {recipe.product?.name || `Product ID: ${recipe.product_id}`}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-100 text-xs font-medium text-brand-earth/70">
                        {recipe.ingredient?.name || `Ingredient ID: ${recipe.ingredient_id}`}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-100 text-xs font-semibold text-brand-green">
                        {recipe.quantity_required} {recipe.ingredient?.unit || ''}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-100 text-[10px] text-brand-earth/40">
                        Auto-Depleted from Commissary Stock
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Ingredient Modal */}
      {isIngredientModalOpen && (
        <div className="fixed inset-0 bg-brand-earth/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-earth mb-4">Add Ingredient Type</h3>
            <form onSubmit={handleCreateIngredient} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-earth/40">Ingredient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Chicken Breast"
                  value={ingredientForm.name}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-earth/40">Unit of Measure</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. kg, liters, units"
                    value={ingredientForm.unit}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, unit: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-earth/40">Initial Stock</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={ingredientForm.stock}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, stock: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-earth/40">Low-Stock Alert Level</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={ingredientForm.min_stock}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, min_stock: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-earth/40">Unit Cost (PHP)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={ingredientForm.unit_cost}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, unit_cost: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsIngredientModalOpen(false)}
                  className="flex-1 border border-gray-100 text-brand-earth hover:bg-gray-50 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-brand-green text-white hover:bg-brand-green/90 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  Save Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Ingredient Modal */}
      {isRestockModalOpen && (
        <div className="fixed inset-0 bg-brand-earth/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-earth mb-4">Restock Commissary</h3>
            <form onSubmit={handleRestockIngredient} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-earth/40">Select Ingredient</label>
                <select
                  required
                  value={selectedIngredientId || ""}
                  onChange={(e) => setSelectedIngredientId(parseInt(e.target.value) || null)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
                >
                  <option value="">-- Choose Ingredient --</option>
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>{ing.name} (Currently: {ing.stock} {ing.unit})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-earth/40">Restock Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 50"
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="flex-1 border border-gray-100 text-brand-earth hover:bg-gray-50 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-brand-green text-white hover:bg-brand-green/90 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  Record Intake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Production Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-brand-earth/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-earth mb-4">Log Production Intake</h3>
            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-earth/40">Batch Serial Code</label>
                <input
                  type="text"
                  required
                  value={batchForm.batch_number}
                  onChange={(e) => setBatchForm({ ...batchForm, batch_number: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-brand-green text-brand-earth font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-earth/40">Product Intaked</label>
                <select
                  required
                  value={batchForm.product_id}
                  onChange={(e) => setBatchForm({ ...batchForm, product_id: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id!}>{p.name} ({p.is_wholesale ? 'Wholesale Restock' : 'Retail Jar'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-earth/40">Intake Destination</label>
                  <select
                    value={batchForm.hub_id}
                    onChange={(e) => setBatchForm({ ...batchForm, hub_id: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
                  >
                    <option value="">HQ Commissary (Central)</option>
                    {hubs.map((h) => (
                      <option key={h.id} value={h.id!}>{h.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-earth/40">Manufacture Qty (jars)</label>
                  <input
                    type="number"
                    required
                    value={batchForm.initial_quantity}
                    onChange={(e) => setBatchForm({ ...batchForm, initial_quantity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-earth/40">Mfg Date</label>
                  <input
                    type="date"
                    required
                    value={batchForm.manufacture_date}
                    onChange={(e) => setBatchForm({ ...batchForm, manufacture_date: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-earth/40">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={batchForm.expiry_date}
                    onChange={(e) => setBatchForm({ ...batchForm, expiry_date: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="flex-1 border border-gray-100 text-brand-earth hover:bg-gray-50 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-brand-green text-white hover:bg-brand-green/90 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  Log Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configure Recipe Modal */}
      {isRecipeModalOpen && (
        <div className="fixed inset-0 bg-brand-earth/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-earth mb-4">Configure Recipe Map</h3>
            <form onSubmit={handleCreateRecipe} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-earth/40">Product Specification</label>
                <select
                  required
                  value={recipeForm.product_id}
                  onChange={(e) => setRecipeForm({ ...recipeForm, product_id: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
                >
                  <option value="">-- Choose Product Jar --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id!}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-earth/40">Required Ingredient</label>
                <select
                  required
                  value={recipeForm.ingredient_id}
                  onChange={(e) => setRecipeForm({ ...recipeForm, ingredient_id: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
                >
                  <option value="">-- Choose Commissary Material --</option>
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>{ing.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-earth/40">
                  Multiplier Amount (per individual produced unit)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  placeholder="e.g. 0.1 for 100g in kg unit"
                  value={recipeForm.quantity_required}
                  onChange={(e) => setRecipeForm({ ...recipeForm, quantity_required: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecipeModalOpen(false)}
                  className="flex-1 border border-gray-100 text-brand-earth hover:bg-gray-50 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-brand-green text-white hover:bg-brand-green/90 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  Save Mapping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
