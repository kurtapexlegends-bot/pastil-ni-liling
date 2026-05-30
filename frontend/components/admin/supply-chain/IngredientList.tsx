import React from 'react';
import { Ingredient } from "@/types/admin";
import { Leaf } from "@phosphor-icons/react";
import { formatThousands, formatCurrency } from "@/lib/format";
import EmptyState from "@/components/ui/EmptyState";

interface IngredientListProps {
  ingredients: Ingredient[];
}

export default function IngredientList({ ingredients }: IngredientListProps) {
  if (ingredients.length === 0) {
    return (
      <EmptyState
        icon={Leaf}
        title="No Ingredients Recorded"
        description="Raw ingredients, stock measurements, commissary unit costs, and depletion limits will appear here."
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm animate-in fade-in duration-300">
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
            {ingredients.map((ingredient) => {
              const isLowStock = Number(ingredient.stock) <= Number(ingredient.min_stock);
              return (
                  <tr key={ingredient.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 border-b border-gray-100 text-xs font-semibold text-brand-earth">
                      {ingredient.name}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100 text-xs font-medium text-brand-earth/70">
                      {formatThousands(Number(ingredient.stock).toFixed(2))} {ingredient.unit}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100 text-xs font-medium text-brand-earth/40">
                      {formatThousands(Number(ingredient.min_stock).toFixed(2))} {ingredient.unit}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100 text-xs font-semibold text-brand-green">
                      {formatCurrency(ingredient.unit_cost || 0)}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100">
                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider ${
                        isLowStock ? 'bg-amber-50 text-amber-700 border border-amber-100/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-100/50'
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
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
