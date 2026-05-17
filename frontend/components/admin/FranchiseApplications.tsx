import { FranchiseApplication } from "../../app/admin/types";

interface FranchiseApplicationsProps {
  applications: FranchiseApplication[];
  updateAppStatus: (id: number, status: string) => Promise<void>;
}

export default function FranchiseApplications({ applications, updateAppStatus }: FranchiseApplicationsProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Applicant</th>
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Target Location</th>
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Capital Investment</th>
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Experience Summary</th>
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Status</th>
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">HQ Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-xs text-brand-earth/40 font-normal">
                  No franchise applications logged on the system.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4 border-b border-gray-100">
                    <p className="text-xs font-semibold text-brand-earth">{app.first_name} {app.last_name}</p>
                    <p className="text-[10px] text-brand-earth/40">{app.email}</p>
                    <p className="text-[9px] text-brand-earth/40">{app.phone}</p>
                  </td>
                  <td className="px-6 py-4 border-b border-gray-100">
                    <p className="text-[11px] text-brand-earth/60 font-medium">{app.target_location}</p>
                  </td>
                  <td className="px-6 py-4 border-b border-gray-100">
                    <p className="text-[11px] text-brand-earth/60 font-semibold uppercase tracking-wider">₱{app.investment_capacity}</p>
                  </td>
                  <td className="px-6 py-4 border-b border-gray-100 max-w-xs">
                    <p className="text-[10px] text-brand-earth/50 leading-relaxed font-normal line-clamp-2" title={app.experience_summary ?? undefined}>
                      {app.experience_summary || 'N/A'}
                    </p>
                  </td>
                  <td className="px-6 py-4 border-b border-gray-100">
                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-semibold uppercase tracking-wider ${
                      app.status === 'approved' 
                        ? 'bg-green-50 text-green-700 border border-green-100/50' 
                        : app.status === 'rejected' 
                        ? 'bg-red-50 text-red-700 border border-red-100/50' 
                        : 'bg-yellow-50 text-yellow-700 border border-yellow-100/50'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b border-gray-100">
                    {app.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => updateAppStatus(app.id, 'approved')}
                          className="bg-brand-earth hover:bg-brand-green text-white px-2.5 py-1.5 rounded-md text-[9px] font-semibold uppercase tracking-wider transition-colors shadow-sm"
                        >Approve</button>
                        <button 
                          onClick={() => updateAppStatus(app.id, 'rejected')}
                          className="border border-gray-100 px-2.5 py-1.5 rounded-md text-[9px] font-semibold uppercase tracking-wider hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors"
                        >Reject</button>
                      </div>
                    )}
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
