import { Hub, FranchiseeUser } from "../../app/admin/types";

interface FranchiseBranchesProps {
  hubs: Hub[];
  franchisees: FranchiseeUser[];
  setHubForm: (h: Hub) => void;
  setIsHubModalOpen: (open: boolean) => void;
  deleteHub: (id: number) => Promise<void>;
}

export default function FranchiseBranches({ hubs, franchisees, setHubForm, setIsHubModalOpen, deleteHub }: FranchiseBranchesProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Branch Name</th>
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Assigned Franchise Partner</th>
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Physical Address</th>
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Status</th>
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hubs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-xs text-brand-earth/40 font-normal">
                  No active branch hubs created.
                </td>
              </tr>
            ) : (
              hubs.map((hub) => (
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
                        onClick={() => {
                          setHubForm({
                            id: hub.id,
                            name: hub.name,
                            address: hub.address,
                            franchisee_id: hub.franchisee_id.toString(),
                            status: hub.status
                          });
                          setIsHubModalOpen(true);
                        }}
                        className="border border-gray-100 hover:bg-gray-50 text-brand-earth px-2.5 py-1.5 rounded-md text-[9px] font-semibold uppercase tracking-wider transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteHub(hub.id!)}
                        className="border border-red-100 text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-md text-[9px] font-semibold uppercase tracking-wider transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
