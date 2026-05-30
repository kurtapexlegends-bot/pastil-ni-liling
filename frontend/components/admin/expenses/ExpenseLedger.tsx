import { Expense } from "./types";
import { formatCurrency } from "@/lib/format";
import { ArrowUpRight } from "@phosphor-icons/react";

interface ExpenseLedgerProps {
  expenses: Expense[];
  loading: boolean;
  handleDelete: (id: number) => void;
}

export function ExpenseLedger({ expenses, loading, handleDelete }: ExpenseLedgerProps) {
  const handleExportCSV = () => {
    const headers = ["Date", "Category", "Details", "Amount"];
    const rows = expenses.map(exp => {
      const dateStr = new Date(exp.date).toLocaleDateString();
      const category = `"${exp.category}"`;
      const details = `"${exp.description || ''}"`;
      const amount = exp.amount;
      return [dateStr, category, details, amount];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Branch_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Branch Expense Journal</h3>
          <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Chronological log of registered branch spending</p>
        </div>
        {expenses.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="border border-gray-200 hover:bg-gray-50 text-brand-earth/70 font-bold uppercase tracking-widest text-[8px] px-4 py-2 rounded-full transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-sm"
          >
            <ArrowUpRight size={12} weight="bold" />
            Export CSV
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-xs text-brand-earth/40 py-8 text-center">Loading registered ledger entries...</p>
      ) : expenses.length === 0 ? (
        <div className="py-12 border border-dashed border-gray-100 rounded-xl text-center space-y-1.5 bg-gray-50/20">
          <p className="text-xs font-medium text-brand-earth/40">Ledger is clean</p>
          <p className="text-[9px] text-brand-earth/30">No operational expenses logged for this branch yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Date</th>
                <th className="pb-3 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Category</th>
                <th className="pb-3 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Details</th>
                <th className="pb-3 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 text-right">Amount</th>
                <th className="pb-3 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40"></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id} className="border-b border-gray-50/50 hover:bg-gray-50/20 group">
                  <td className="py-3 text-xs font-medium text-brand-earth/60">{new Date(exp.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td className="py-3 text-xs font-semibold text-brand-earth/80">
                    <span className="bg-brand-earth/5 text-brand-earth/60 px-2 py-0.5 rounded-full text-[9px] font-medium capitalize">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-brand-earth/50 max-w-[200px] truncate" title={exp.description || ""}>
                    {exp.description || "-"}
                  </td>
                  <td className="py-3 text-xs font-bold text-brand-earth text-right">{formatCurrency(exp.amount)}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="text-[9px] font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider opacity-0 group-hover:opacity-100"
                    >
                      Remove
                    </button>
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
