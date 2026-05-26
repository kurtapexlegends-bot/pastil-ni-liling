import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal';
import { Hub } from './types';

interface NewAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  hubs: Hub[];
  onSubmitAudit: (data: { hub_id: string; hygiene_score: number; recipe_adherence_score: number; notes: string }) => Promise<void>;
  error?: string;
}

export default function NewAuditModal({ isOpen, onClose, hubs, onSubmitAudit, error }: NewAuditModalProps) {
  const [hubId, setHubId] = useState("");
  const [hygiene, setHygiene] = useState(100);
  const [recipe, setRecipe] = useState(100);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  // Initialize hub selection when hubs are loaded
  useEffect(() => {
    if (hubs.length > 0 && !hubId) {
      setHubId(hubs[0].id.toString());
    }
  }, [hubs, hubId]);

  // Reset form states on close
  useEffect(() => {
    if (!isOpen) {
      setHygiene(100);
      setRecipe(100);
      setNotes("");
      setLocalError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setSubmitting(true);
    try {
      await onSubmitAudit({
        hub_id: hubId,
        hygiene_score: hygiene,
        recipe_adherence_score: recipe,
        notes,
      });
      onClose();
    } catch (err: any) {
      setLocalError(err.message || "Failed to submit compliance audit.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register QC Standard Log"
    >
      {(error || localError) && (
        <div className="p-3 mb-4 bg-red-50 border border-red-100 rounded-2xl text-[9px] font-semibold text-red-600 uppercase tracking-wide">
          {error || localError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Select Branch Hub</label>
          <select
            required
            value={hubId}
            onChange={(e) => setHubId(e.target.value)}
            className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-bold text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
          >
            {hubs.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Hygiene Score (0-100)</label>
            <input
              type="number"
              min="0"
              max="100"
              required
              value={hygiene}
              onChange={(e) => setHygiene(parseInt(e.target.value) || 0)}
              className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Recipe Adherence (0-100)</label>
            <input
              type="number"
              min="0"
              max="100"
              required
              value={recipe}
              onChange={(e) => setRecipe(parseInt(e.target.value) || 0)}
              className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Kitchen Photo Upload</label>
          <div className="border border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-gray-50/50 transition-colors">
            <span className="text-[9px] font-bold text-brand-green uppercase tracking-wide">kitchen_hygiene_diliman.jpg selected</span>
            <span className="text-[7px] font-semibold text-brand-earth/30 uppercase tracking-widest mt-1">Automatic high-res photo capture</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Audit & Hygiene Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all h-24 resize-none shadow-sm"
            placeholder="Describe recipe taste checks, cleanliness parameters, and standard checklist details..."
          />
        </div>

        <div className="flex gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 border border-gray-100 hover:bg-gray-50 text-brand-earth/70 font-bold uppercase tracking-wider text-[9px] py-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white font-bold uppercase tracking-wider text-[9px] py-2.5 rounded-xl transition-all shadow-xl shadow-brand-green/10 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Log"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
