"use client";

import { useState } from "react";
import { Ingredient, InventoryBatch, ProductIngredient, Product, Hub } from "@/types/admin";
import SegmentedControl from "@/components/ui/SegmentedControl";
import AddIngredientModal from "./modals/AddIngredientModal";
import RestockModal from "./modals/RestockModal";
import ProductionIntakeModal from "./modals/ProductionIntakeModal";
import RecipeMapModal from "./modals/RecipeMapModal";
import IngredientList from "./IngredientList";
import BatchTrackerList from "./BatchTrackerList";
import RecipeFormulationList from "./RecipeFormulationList";

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
        <SegmentedControl
          value={activeSubTab}
          onChange={setActiveSubTab}
          options={[
            { id: "ingredients", label: "Commissary Ingredients" },
            { id: "batches", label: "FIFO Batches Tracker" },
            { id: "recipes", label: "Recipe Formulations" }
          ]}
        />

        <div className="flex gap-2">
          {activeSubTab === 'ingredients' && (
            <>
              <button
                onClick={() => setIsIngredientModalOpen(true)}
                className="bg-white border border-gray-100 text-brand-earth hover:bg-gray-50 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
              >
                Add Ingredient Type
              </button>
              <button
                onClick={() => setIsRestockModalOpen(true)}
                className="bg-brand-green text-white hover:bg-brand-green/90 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
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
                className="bg-white border border-amber-200 text-amber-700 hover:bg-amber-50/50 hover:border-amber-300 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                Scan Near-Expiries
              </button>
              <button
                onClick={() => setIsBatchModalOpen(true)}
                className="bg-brand-green text-white hover:bg-brand-green/90 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
              >
                Log Production Intake
              </button>
            </>
          )}

          {activeSubTab === 'recipes' && (
            <button
              onClick={() => setIsRecipeModalOpen(true)}
              className="bg-brand-green text-white hover:bg-brand-green/90 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
            >
              Configure Recipe Map
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl text-xs flex justify-between items-center shadow-sm">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="font-bold hover:text-emerald-950">×</button>
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl text-xs flex justify-between items-center shadow-sm">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold hover:text-rose-950">×</button>
        </div>
      )}

      {/* Main SubTab Content */}
      {activeSubTab === 'ingredients' && (
        <IngredientList ingredients={ingredients} />
      )}

      {activeSubTab === 'batches' && (
        <BatchTrackerList batches={batches} />
      )}

      {activeSubTab === 'recipes' && (
        <RecipeFormulationList recipes={recipes} />
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
