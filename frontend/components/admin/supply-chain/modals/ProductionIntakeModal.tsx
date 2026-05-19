"use client";

import { useState, useEffect } from "react";
import { Product, Hub } from "../../../../app/admin/types";
import Modal from "../../../ui/Modal";

interface ProductionIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  hubs: Hub[];
  onSubmit: (data: {
    batch_number: string;
    product_id: number;
    hub_id: number | null;
    initial_quantity: number;
    manufacture_date: string;
    expiry_date: string;
  }) => Promise<void>;
  loading: boolean;
}

const generateBatchNumber = () => {
  return `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
};

export default function ProductionIntakeModal({
  isOpen,
  onClose,
  products,
  hubs,
  onSubmit,
  loading
}: ProductionIntakeModalProps) {
  const [form, setForm] = useState({
    batch_number: "",
    product_id: "",
    hub_id: "",
    initial_quantity: 100,
    manufacture_date: "",
    expiry_date: ""
  });

  // Re-generate batch number when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({
        batch_number: generateBatchNumber(),
        product_id: "",
        hub_id: "",
        initial_quantity: 100,
        manufacture_date: new Date().toISOString().slice(0, 10),
        expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id) return;
    await onSubmit({
      batch_number: form.batch_number,
      product_id: parseInt(form.product_id),
      hub_id: form.hub_id ? parseInt(form.hub_id) : null,
      initial_quantity: form.initial_quantity,
      manufacture_date: form.manufacture_date,
      expiry_date: form.expiry_date
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Production Intake"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Batch Serial Code</label>
          <input
            type="text"
            required
            value={form.batch_number}
            onChange={(e) => setForm({ ...form, batch_number: e.target.value })}
            className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Product Intaked</label>
          <select
            required
            value={form.product_id}
            onChange={(e) => setForm({ ...form, product_id: e.target.value })}
            className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-bold text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
          >
            <option value="" disabled>-- Choose Product --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id!}>{p.name} ({p.is_wholesale ? 'Wholesale Restock' : 'Retail Jar'})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Intake Destination</label>
            <select
              value={form.hub_id}
              onChange={(e) => setForm({ ...form, hub_id: e.target.value })}
              className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-bold text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
            >
              <option value="">HQ Commissary (Central)</option>
              {hubs.map((h) => (
                <option key={h.id} value={h.id!}>{h.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Manufacture Qty (jars)</label>
            <input
              type="number"
              required
              value={form.initial_quantity}
              onChange={(e) => setForm({ ...form, initial_quantity: parseInt(e.target.value) || 0 })}
              className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Mfg Date</label>
            <input
              type="date"
              required
              value={form.manufacture_date}
              onChange={(e) => setForm({ ...form, manufacture_date: e.target.value })}
              className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm text-center"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Expiry Date</label>
            <input
              type="date"
              required
              value={form.expiry_date}
              onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
              className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm text-center"
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
            Log Batch
          </button>
        </div>
      </form>
    </Modal>
  );
}
