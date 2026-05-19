"use client";

import { useState } from "react";
import Modal from "../../../ui/Modal";

interface AddIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; unit: string; stock: number; min_stock: number; unit_cost: number }) => Promise<void>;
  loading: boolean;
}

export default function AddIngredientModal({
  isOpen,
  onClose,
  onSubmit,
  loading
}: AddIngredientModalProps) {
  const [form, setForm] = useState({
    name: "",
    unit: "kg",
    stock: 0,
    min_stock: 10,
    unit_cost: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    // Reset form after successful submission
    setForm({ name: "", unit: "kg", stock: 0, min_stock: 10, unit_cost: 0 });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Ingredient Type"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Ingredient Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Fresh Chicken Breast"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Unit of Measure</label>
            <input
              type="text"
              required
              placeholder="e.g. kg, liters, units"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Initial Stock</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: parseFloat(e.target.value) || 0 })}
              className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Low-Stock Alert Level</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.min_stock}
              onChange={(e) => setForm({ ...form, min_stock: parseFloat(e.target.value) || 0 })}
              className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Unit Cost (PHP)</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.unit_cost}
              onChange={(e) => setForm({ ...form, unit_cost: parseFloat(e.target.value) || 0 })}
              className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
            />
          </div>
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
            Save Ingredient
          </button>
        </div>
      </form>
    </Modal>
  );
}
