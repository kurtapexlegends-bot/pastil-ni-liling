import React from 'react';
import { ProductIngredient } from "@/types/admin";
import { BookOpen } from "@phosphor-icons/react";
import EmptyState from "@/components/ui/EmptyState";

interface RecipeFormulationListProps {
  recipes: ProductIngredient[];
}

export default function RecipeFormulationList({ recipes }: RecipeFormulationListProps) {
  if (recipes.length === 0) {
    return (
      <EmptyState 
        icon={BookOpen} 
        title="No Recipes Mapped" 
        description="Commissary ingredients mapping, multipliers, and retail jar specifications will appear here." 
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm animate-in fade-in duration-300">
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
            {recipes.map((recipe) => (
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
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
