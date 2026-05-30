import { useState } from "react";
import { Hub, FranchiseeUser } from "@/types/admin";
import { Storefront, Plus } from "@phosphor-icons/react";
import HubModal from "./HubModal";
import { useConfirm } from "../../../hooks/useConfirm";
import { toast } from "sonner";
import EmptyState from "@/components/ui/EmptyState";

interface FranchiseBranchesProps {
  hubs: Hub[];
  franchisees: FranchiseeUser[];
  saveHub: (h: Hub) => Promise<boolean>;
  deleteHub: (id: number) => Promise<boolean>;
}

export default function FranchiseBranches({ hubs, franchisees, saveHub, deleteHub }: FranchiseBranchesProps) {
  const { confirm } = useConfirm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hubForm, setHubForm] = useState<Hub>({
    id: null,
    name: "",
    address: "",
    franchisee_id: "",
    status: "active"
  });

  const handleAddHub = () => {
    setHubForm({
      id: null,
      name: "",
      address: "",
      franchisee_id: franchisees[0]?.id?.toString() || "",
      status: "active"
    });
    setIsModalOpen(true);
  };

  const handleEditHub = (hub: Hub) => {
    setHubForm({
      id: hub.id,
      name: hub.name,
      address: hub.address,
      franchisee_id: hub.franchisee_id.toString(),
      status: hub.status
    });
    setIsModalOpen(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    const success = await saveHub(hubForm);
    setIsSaving(false);
    if (success) {
      setIsModalOpen(false);
      toast.success(hubForm.id ? "Branch updated successfully" : "Branch created successfully");
    } else {
      toast.error("Failed to save branch");
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: "Delete Branch",
      message: "Are you sure you want to delete this franchise branch? This action cannot be undone.",
      isDestructive: true
    });
    
    if (isConfirmed) {
      const success = await deleteHub(id);
      if (success) {
        toast.success("Branch deleted successfully");
      } else {
        toast.error("Failed to delete branch");
      }
    }
  };

  return (
    <div className="space-y-4">
      {hubs.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleAddHub}
            className="flex items-center gap-2 bg-brand-earth hover:bg-brand-green text-white px-4 py-2.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all shadow-sm shrink-0 active:scale-[0.98]"
          >
            <Plus size={14} weight="bold" />
            Create Franchise Hub
          </button>
        </div>
      )}

      {hubs.length === 0 ? (
        <EmptyState
          icon={Storefront}
          title="No Branch Hubs Created"
          description="Active franchise outlets, assigned franchisees, physical location data, and status indicators will appear here."
          action={{
            label: "Create Franchise Hub",
            onClick: handleAddHub
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">{"Branch Name"}</th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">{"Assigned Franchise Partner"}</th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">{"Physical Address"}</th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">{"Status"}</th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">{"Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {hubs.map((hub) => (
                  <tr key={hub.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 border-b border-gray-100 text-xs font-semibold text-brand-earth">
                      {hub.name}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100">
                      <p className="text-xs font-semibold text-brand-earth">{hub.franchisee?.name || 'Unassigned'}</p>
                      <p className="text-[10px] text-brand-earth/40">{hub.franchisee?.email}</p>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100 text-xs text-brand-earth/60 font-medium">
                      {hub.address}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100">
                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-semibold uppercase tracking-wider ${
                        hub.status === 'active' ? 'bg-green-50 text-green-700 border border-green-100/50' : 'bg-red-50 text-red-700 border border-red-100/50'
                      }`}>
                        {hub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEditHub(hub)}
                          className="border border-gray-100 hover:bg-gray-50 text-brand-earth px-2.5 py-1.5 rounded-md text-[9px] font-semibold uppercase tracking-wider transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(hub.id!)}
                          className="border border-red-100 text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-md text-[9px] font-semibold uppercase tracking-wider transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <HubModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        hubForm={hubForm}
        setHubForm={setHubForm}
        franchisees={franchisees}
        saveHub={handleSave}
      />
    </div>
  );
}