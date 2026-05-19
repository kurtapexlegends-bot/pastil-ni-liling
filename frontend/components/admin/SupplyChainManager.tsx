"use client";

import { useState } from "react";
import { Ingredient, InventoryBatch, ProductIngredient, Product, Hub } from "../../app/admin/types";
import AddIngredientModal from "./supply-chain/modals/AddIngredientModal";
import RestockModal from "./supply-chain/modals/RestockModal";
import ProductionIntakeModal from "./supply-chain/modals/ProductionIntakeModal";
import RecipeMapModal from "./supply-chain/modals/RecipeMapModal";

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

  // Modals visibility state
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  // Global Error/Success and Loading states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form submission handler wrappers that bridge isolated modals with root callback states
  const handleCreateIngredientSubmit = async (formData: any) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await addIngredient(formData);
      setSuccessMsg("Raw ingredient type added successfully!");
      setIsIngredientModalOpen(false);
      await fetchIngredients();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to add ingredient.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestockIngredientSubmit = async (ingredientId: number, qty: number) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await restockIngredient(ingredientId, qty);
      setSuccessMsg("HQ Commissary restock recorded successfully!");
      setIsRestockModalOpen(false);
      await fetchIngredients();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to restock ingredient.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatchSubmit = async (batchData: any) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await addBatch(batchData);
      setSuccessMsg("Manufacture batch intake completed and ingredients depleted!");
      setIsBatchModalOpen(false);
      await fetchBatches();
      await fetchIngredients();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to record batch. Make sure ingredients are sufficient.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecipeSubmit = async (recipeData: any) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await addRecipe(recipeData);
      setSuccessMsg("Product recipe formula updated successfully!");
      setIsRecipeModalOpen(false);
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

      {/* Abstracted Modal Forms */}
      <AddIngredientModal
        isOpen={isIngredientModalOpen}
        onClose={() => setIsIngredientModalOpen(false)}
        onSubmit={handleCreateIngredientSubmit}
        loading={loading}
      />

      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        ingredients={ingredients}
        onSubmit={handleRestockIngredientSubmit}
        loading={loading}
      />

      <ProductionIntakeModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        products={products}
        hubs={hubs}
        onSubmit={handleCreateBatchSubmit}
        loading={loading}
      />

      <RecipeMapModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        products={products}
        ingredients={ingredients}
        onSubmit={handleCreateRecipeSubmit}
        loading={loading}
      />
    </div>
  );
}
