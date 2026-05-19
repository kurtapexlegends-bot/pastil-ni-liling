"use client";

import { useState } from "react";
import { Ingredient } from "../../../../app/admin/types";
import Modal from "../../../ui/Modal";

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
  onSubmit: (ingredientId: number, qty: number) => Promise<void>;
  loading: boolean;
}

export default function RestockModal({
  isOpen,
  onClose,
  ingredients,
  onSubmit,
  loading
}: RestockModalProps) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [qty, setQty] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(selectedId);
    if (!id || qty <= 0) return;
    await onSubmit(id, qty);
    setSelectedId("");
    setQty(0);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Restock Commissary"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Select Ingredient</label>
          <select
            required
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-bold text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
          >
            <option value="" disabled>-- Choose Ingredient --</option>
            {ingredients.map((ing) => (
              <option key={ing.id} value={ing.id}>{ing.name} (Currently: {ing.stock} {ing.unit})</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Restock Quantity</label>
          <input
            type="number"
            step="0.01"
            required
            placeholder="e.g. 50"
            value={qty || ""}
            onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
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
            Record Intake
          </button>
        </div>
      </form>
    </Modal>
  );
}
