"use client";

import { useState } from "react";
import { Product, Ingredient } from "../../../../app/admin/types";
import Modal from "../../../ui/Modal";

interface RecipeMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  ingredients: Ingredient[];
  onSubmit: (data: {
    product_id: number;
    ingredient_id: number;
    quantity_required: number;
  }) => Promise<void>;
  loading: boolean;
}

export default function RecipeMapModal({
  isOpen,
  onClose,
  products,
  ingredients,
  onSubmit,
  loading
}: RecipeMapModalProps) {
  const [form, setForm] = useState({
    product_id: "",
    ingredient_id: "",
    quantity_required: 0.1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id || !form.ingredient_id) return;
    await onSubmit({
      product_id: parseInt(form.product_id),
      ingredient_id: parseInt(form.ingredient_id),
      quantity_required: form.quantity_required
    });
    setForm({ product_id: "", ingredient_id: "", quantity_required: 0.1 });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Recipe Map"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Product Specification</label>
          <select
            required
            value={form.product_id}
            onChange={(e) => setForm({ ...form, product_id: e.target.value })}
            className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-bold text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
          >
            <option value="" disabled>-- Choose Product Jar --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id!}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Required Ingredient</label>
          <select
            required
            value={form.ingredient_id}
            onChange={(e) => setForm({ ...form, ingredient_id: e.target.value })}
            className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-bold text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
          >
            <option value="" disabled>-- Choose Commissary Material --</option>
            {ingredients.map((ing) => (
              <option key={ing.id} value={ing.id}>{ing.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">
            Multiplier Amount (per individual produced unit)
          </label>
          <input
            type="number"
            step="0.0001"
            required
            placeholder="e.g. 0.1 for 100g in kg unit"
            value={form.quantity_required}
            onChange={(e) => setForm({ ...form, quantity_required: parseFloat(e.target.value) || 0 })}
            className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
          />
        </div>

        <div className="flex gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-100 hover:bg-gray-50 text-brand-earth/70 font-bold uppercase tracking-wider text-[9px] py-2.5 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white font-bold uppercase tracking-wider text-[9px] py-2.5 rounded-xl transition-all shadow-xl shadow-brand-green/10 disabled:opacity-50"
          >
            Save Mapping
          </button>
        </div>
      </form>
    </Modal>
  );
}
