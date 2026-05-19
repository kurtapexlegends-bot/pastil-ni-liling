"use client";

import { useState, useEffect } from "react";

interface Expense {
  id: number;
  hub_id: number | null;
  category: string;
  amount: string;
  date: string;
  description: string | null;
  created_at: string;
  hub?: {
    id: number;
    name: string;
  } | null;
}

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("materials");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: "materials", label: "Raw Materials & Stock" },
    { value: "utilities", label: "Utilities (Water, Power, Gas)" },
    { value: "rent", label: "Stall Rent & Leasing" },
    { value: "salary", label: "Local Crew Salaries" },
    { value: "marketing", label: "Local Marketing & Promos" },
    { value: "logistics", label: "Transportation & Fuel" },
    { value: "other", label: "Other Operational Costs" },
  ];

  const fetchExpenses = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setExpenses(data.data);
      }
    } catch (err) {
      console.error("Failed to load operational expenses.", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Session expired. Please log in again.");
      setSubmitting(false);
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please input a valid expense amount.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category,
          amount: parseFloat(amount),
          date,
          description,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAmount("");
        setDescription("");
        fetchExpenses();
      } else {
        setError(data.message || "Failed to log operational expense.");
      }
    } catch (err) {
      setError("Failed to communicate with the server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense record?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchExpenses();
      } else {
        alert(data.message || "Failed to delete expense record.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate stats
  const totalAmount = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const categoryTotals = expenses.reduce((acc: any, item) => {
    acc[item.category] = (acc[item.category] || 0) + parseFloat(item.amount);
    return acc;
  }, {});

  return (
    <div className="space-y-8 pt-4 animate-in fade-in duration-300">
      {/* Category Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm space-y-1">
          <p className="text-[8px] font-semibold uppercase tracking-wider text-brand-earth/40">Total Operational Expense</p>
          <p className="text-lg font-bold text-brand-earth">₱{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        {categories.slice(0, 3).map((cat) => {
          const amt = categoryTotals[cat.value] || 0;
          return (
            <div key={cat.value} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm space-y-1">
              <p className="text-[8px] font-semibold uppercase tracking-wider text-brand-earth/40">{cat.label}</p>
              <p className="text-sm font-bold text-brand-earth">₱{amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Log Expense Form */}
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

        {/* Expenses List */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Branch Expense Journal</h3>
            <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Chronological log of registered branch spending</p>
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
                      <td className="py-3 text-xs font-bold text-brand-earth text-right">₱{parseFloat(exp.amount).toFixed(2)}</td>
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
      </div>
    </div>
  );
}
