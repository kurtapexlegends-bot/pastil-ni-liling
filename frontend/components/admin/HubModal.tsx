import { Hub, FranchiseeUser } from "../../app/admin/types";

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
  saveHub
}: HubModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-brand-earth/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-100 max-w-md w-full p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-earth">
            {hubForm.id ? "Edit Franchise Hub" : "Create Franchise Hub"}
          </h3>
          <button 
            onClick={onClose}
            className="text-brand-earth/40 hover:text-brand-earth text-lg font-bold"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={saveHub} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/50">Hub Branch Name</label>
            <input 
              type="text" 
              value={hubForm.name}
              onChange={(e) => setHubForm(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="e.g., Liling Manila North Hub"
              className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/50">Assigned Franchise Partner</label>
            <select 
              value={hubForm.franchisee_id}
              onChange={(e) => setHubForm(prev => ({ ...prev, franchisee_id: e.target.value }))}
              required
              className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none bg-white focus:ring-1 focus:ring-brand-green text-brand-earth"
            >
              <option value="" disabled>Select a Franchisee</option>
              {franchisees.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/50">Physical Address</label>
            <input 
              type="text" 
              value={hubForm.address}
              onChange={(e) => setHubForm(prev => ({ ...prev, address: e.target.value }))}
              required
              placeholder="e.g., 102 Taft Avenue, Manila City"
              className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/50">Hub Status</label>
            <select 
              value={hubForm.status}
              onChange={(e) => setHubForm(prev => ({ ...prev, status: e.target.value }))}
              className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none bg-white focus:ring-1 focus:ring-brand-green text-brand-earth"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2 justify-end">
            <button 
              type="button" 
              onClick={onClose}
              className="border border-gray-100 px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-wider hover:bg-gray-50 transition-colors text-brand-earth"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-brand-earth hover:bg-brand-green text-white px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-wider transition-colors shadow-sm"
            >
              Save Hub
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
