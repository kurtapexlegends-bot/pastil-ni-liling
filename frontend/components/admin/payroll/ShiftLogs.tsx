import { Shift } from "./types";

interface ShiftLogsProps {
  shifts: Shift[];
}

export function ShiftLogs({ shifts }: ShiftLogsProps) {
  const formatDateTime = (dtStr: string | null) => {
    if (!dtStr) return "Ongoing Shift";
    return new Date(dtStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
      <div>
        <h2 className="text-sm font-bold text-brand-earth uppercase tracking-wider">Branch Cashier Work Shift Registry</h2>
        <p className="text-[10px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Real-time attendance logs, hourly shifts record, and branch logouts.</p>
      </div>

      {shifts.length === 0 ? (
        <p className="text-[10px] text-brand-earth/30 uppercase tracking-widest font-semibold text-center py-6">No shift logs found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Employee</th>
                <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Branch Location</th>
                <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Clock-In</th>
                <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Clock-Out</th>
                <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Hourly Rate</th>
                <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Status</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/20 transition-colors">
                  <td className="p-4 text-[10px] font-bold text-brand-earth">{s.user.name}</td>
                  <td className="p-4 text-[10px] font-medium text-brand-earth/60">{s.hub.name}</td>
                  <td className="p-4 text-[10px] font-medium text-brand-earth/60">{formatDateTime(s.clock_in)}</td>
                  <td className="p-4 text-[10px] font-medium text-brand-earth/60">{formatDateTime(s.clock_out)}</td>
                  <td className="p-4 text-[10px] font-bold text-brand-earth">₱ {parseFloat(s.hourly_rate).toFixed(2)}/hr</td>
                  <td className="p-4">
                    <span className={`inline-block border text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      s.status === 'active' ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
