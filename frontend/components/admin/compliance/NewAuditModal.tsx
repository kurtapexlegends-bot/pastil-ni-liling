import React, { useState, useEffect, useRef } from 'react';
import Modal from '../../ui/Modal';
import { Hub } from './types';

interface NewAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  hubs: Hub[];
  onSubmitAudit: (data: { hub_id: string; hygiene_score: number; recipe_adherence_score: number; notes: string; kitchen_photo?: string }) => Promise<void>;
  error?: string;
}

const getScoreGrade = (score: number) => {
  if (score >= 90) return { label: 'Grade A', color: 'bg-emerald-50 text-emerald-700 border-emerald-100/60' };
  if (score >= 75) return { label: 'Grade B', color: 'bg-amber-50 text-amber-700 border-amber-100/60' };
  return { label: 'Critical Fail', color: 'bg-rose-50 text-rose-700 border-rose-100/60' };
};

export default function NewAuditModal({ isOpen, onClose, hubs, onSubmitAudit, error }: NewAuditModalProps) {
  const [hubId, setHubId] = useState("");
  const [hygiene, setHygiene] = useState(100);
  const [recipe, setRecipe] = useState(100);
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setPhoto(null);
      setPhotoName("");
      setLocalError("");
    }
  }, [isOpen]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhoto(null);
    setPhotoName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
        kitchen_photo: photo || "/photos/kitchen_liling.jpg",
      });
      onClose();
    } catch (err: any) {
      setLocalError(err.message || "Failed to submit compliance audit.");
    } finally {
      setSubmitting(false);
    }
  };

  const hygieneGrade = getScoreGrade(hygiene);
  const recipeGrade = getScoreGrade(recipe);

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

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Select Branch Hub</label>
          <select
            required
            value={hubId}
            onChange={(e) => setHubId(e.target.value)}
            className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-bold text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm cursor-pointer"
          >
            {hubs.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {/* Hygiene Score slider */}
          <div className="space-y-2 border border-gray-50 bg-gray-50/10 p-3.5 rounded-2xl">
            <div className="flex justify-between items-center">
              <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Hygiene Score</label>
              <div className="flex items-center gap-2">
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider transition-all duration-300 ${hygieneGrade.color}`}>
                  {hygieneGrade.label}
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={hygiene === 0 ? "" : hygiene}
                    placeholder="0"
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                      setHygiene(Math.max(0, Math.min(100, val)));
                    }}
                    className="w-12 border border-gray-100/85 rounded-xl py-0.5 text-[10px] font-black text-brand-earth bg-white focus:border-brand-earth/30 outline-none text-center shadow-sm select-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-[9px] font-normal text-brand-earth/30">/100</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                required
                value={hygiene}
                onChange={(e) => setHygiene(parseInt(e.target.value) || 0)}
                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-earth transition-all"
              />
            </div>
          </div>

          {/* Recipe Adherence slider */}
          <div className="space-y-2 border border-gray-50 bg-gray-50/10 p-3.5 rounded-2xl">
            <div className="flex justify-between items-center">
              <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Recipe Adherence</label>
              <div className="flex items-center gap-2">
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider transition-all duration-300 ${recipeGrade.color}`}>
                  {recipeGrade.label}
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={recipe === 0 ? "" : recipe}
                    placeholder="0"
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                      setRecipe(Math.max(0, Math.min(100, val)));
                    }}
                    className="w-12 border border-gray-100/85 rounded-xl py-0.5 text-[10px] font-black text-brand-earth bg-white focus:border-brand-earth/30 outline-none text-center shadow-sm select-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-[9px] font-normal text-brand-earth/30">/100</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                required
                value={recipe}
                onChange={(e) => setRecipe(parseInt(e.target.value) || 0)}
                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-earth transition-all"
              />
            </div>
          </div>
        </div>

        {/* Interactive Photo Upload Container */}
        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Kitchen Photo Upload</label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handlePhotoChange}
            className="hidden"
            id="kitchen-photo-input"
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-gray-200 hover:border-brand-earth/30 rounded-2xl p-4 flex flex-col items-center justify-center bg-white hover:bg-gray-50/30 transition-all cursor-pointer select-none group min-h-[92px]"
          >
            {photo ? (
              <div className="w-full flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-bold text-brand-earth truncate max-w-[180px]">{photoName}</p>
                    <p className="text-[7px] font-semibold text-brand-green uppercase tracking-widest mt-0.5">Ready for upload</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="p-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 text-brand-earth/40 hover:text-red-500 transition-all active:scale-95"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="text-center flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-brand-earth/5 flex items-center justify-center text-brand-earth/40 group-hover:bg-brand-earth/10 transition-colors mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-[9px] font-bold text-brand-earth uppercase tracking-wide">Select Kitchen Photo</span>
                <span className="text-[7px] font-semibold text-brand-earth/30 uppercase tracking-widest mt-1">PNG, JPG up to 10MB</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Audit & Hygiene Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all h-20 resize-none shadow-sm"
            placeholder="Describe recipe taste checks, cleanliness parameters, and standard checklist details..."
          />
        </div>

        <div className="flex gap-3 pt-2">
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
