import React from "react";

interface ExpenseFormProps {
  categories: { value: string; label: string }[];
  category: string;
  setCategory: (val: string) => void;
  amount: string;
  setAmount: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  error: string | null;
  submitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

export function ExpenseForm({
  categories,
  category,
  setCategory,
  amount,
  setAmount,
  date,
  setDate,
  description,
  setDescription,
  error,
  submitting,
  handleSubmit
}: ExpenseFormProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">
      <div>
        <h3 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Log Local Expense</h3>
        <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Register operational and overhead costs</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/60">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-xs font-medium focus:border-brand-green focus:bg-white outline-none transition-all text-brand-earth"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/60">Expense Amount (PHP)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-xs font-medium focus:border-brand-green focus:bg-white outline-none transition-all text-brand-earth"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/60">Date of Expense</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-xs font-medium focus:border-brand-green focus:bg-white outline-none transition-all text-brand-earth"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/60">Description & Details</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Paid cash for drinking water dispenser refilling"
            rows={3}
            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-xs font-medium focus:border-brand-green focus:bg-white outline-none transition-all text-brand-earth resize-none"
          ></textarea>
        </div>

        {error && <p className="text-[9px] font-semibold text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-green text-white py-3 rounded-lg text-[10px] font-semibold uppercase tracking-wider hover:opacity-95 transition-all shadow-sm disabled:opacity-50"
        >
          {submitting ? "Saving Entry..." : "Log Expense Details"}
        </button>
      </form>
    </div>
  );
}
