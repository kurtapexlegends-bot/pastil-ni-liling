import { Shift } from "./types";
import { formatCurrency } from "@/lib/format";
import EmptyState from "@/components/ui/EmptyState";
import { Calendar, ArrowUpRight } from "@phosphor-icons/react";

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

  const handleExportCSV = () => {
    const headers = ["Employee", "Branch Location", "Clock-In", "Clock-Out", "Hourly Rate", "Status"];
    const rows = shifts.map(s => {
      const name = `"${s.user.name}"`;
      const hubName = `"${s.hub.name}"`;
      const clockIn = s.clock_in ? new Date(s.clock_in).toLocaleString() : '';
      const clockOut = s.clock_out ? new Date(s.clock_out).toLocaleString() : 'Ongoing';
      const rate = s.hourly_rate;
      const status = s.status;
      return [name, hubName, `"${clockIn}"`, `"${clockOut}"`, rate, status];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Work_Shift_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-brand-earth uppercase tracking-wider">Work Shift Registry</h2>
          <p className="text-[10px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Track branch cashier attendance logs, shift hours, and clock-out status.</p>
        </div>
        {shifts.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="border border-gray-200 hover:bg-gray-50 text-brand-earth/70 font-bold uppercase tracking-widest text-[8px] px-4 py-2 rounded-full transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-sm"
          >
            <ArrowUpRight size={12} weight="bold" />
            Export CSV
          </button>
        )}
      </div>

      {shifts.length === 0 ? (
        <EmptyState 
          icon={Calendar} 
          title="No Shift Logs Found" 
          description="Cashier work shifts, attendance hours, and active branch logs will appear here." 
        />
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
                  <td className="p-4 text-[10px] font-bold text-brand-earth">{formatCurrency(s.hourly_rate)}/hr</td>
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
