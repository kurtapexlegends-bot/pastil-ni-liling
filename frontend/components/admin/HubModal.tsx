'use client';

import { Hub, FranchiseeUser } from '../../app/admin/types';
import Modal from '../ui/Modal';

interface HubModalProps {
  isOpen: boolean;
  onClose: () => void;
  hubForm: Hub;
  setHubForm: React.Dispatch<React.SetStateAction<Hub>>;
  franchisees: FranchiseeUser[];
  saveHub: (e: React.FormEvent) => Promise<void>;
}

export default function HubModal({
  isOpen,
  onClose,
  hubForm,
  setHubForm,
  franchisees,
  saveHub,
}: HubModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={hubForm.id ? 'Edit Franchise Branch' : 'Create Franchise Branch'}
    >
      <form onSubmit={saveHub} className="space-y-4">
        {/* Branch Name Input */}
        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">
            Branch Name
          </label>
          <input
            type="text"
            value={hubForm.name}
            onChange={(e) =>
              setHubForm((prev) => ({ ...prev, name: e.target.value }))
            }
            required
            placeholder="e.g., Liling Manila North Hub"
            className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
          />
        </div>

        {/* Assigned Franchise Partner Select */}
        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">
            Franchise Partner
          </label>
          <select
            value={hubForm.franchisee_id}
            onChange={(e) =>
              setHubForm((prev) => ({ ...prev, franchisee_id: e.target.value }))
            }
            required
            className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-bold text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
          >
            <option value="" disabled>
              Select a Franchisee
            </option>
            {franchisees.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        {/* Physical Address Input */}
        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">
            Physical Address
          </label>
          <input
            type="text"
            value={hubForm.address}
            onChange={(e) =>
              setHubForm((prev) => ({ ...prev, address: e.target.value }))
            }
            required
            placeholder="e.g., 102 Taft Avenue, Manila City"
            className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
          />
        </div>

        {/* Hub Status Select */}
        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">
            Operating Status
          </label>
          <select
            value={hubForm.status}
            onChange={(e) =>
              setHubForm((prev) => ({ ...prev, status: e.target.value }))
            }
            className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-bold text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Actions Footer */}
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
            className="flex-1 bg-brand-earth hover:bg-brand-earth/95 text-white font-bold uppercase tracking-wider text-[9px] py-2.5 rounded-xl transition-all shadow-xl shadow-brand-earth/10"
          >
            Save Branch
          </button>
        </div>
      </form>
    </Modal>
  );
}
