"use client";

import { useState, useEffect } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { Expense } from "./types";
import { ExpenseForm } from "./ExpenseForm";
import { ExpenseLedger } from "./ExpenseLedger";

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("materials");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, title: string, message: string, action: () => void}>({
    isOpen: false, title: "", message: "", action: () => {}
  });

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

  const handleDelete = (id: number) => {
    setConfirmState({
      isOpen: true,
      title: "Delete Expense Record",
      message: "Are you sure you want to delete this expense record? This action cannot be undone.",
      action: async () => {
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
            setError(data.message || "Failed to delete expense record.");
          }
        } catch (err) {
          console.error(err);
          setError("Failed to communicate with the server.");
        } finally {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

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
        <ExpenseForm
          categories={categories}
          category={category}
          setCategory={setCategory}
          amount={amount}
          setAmount={setAmount}
          date={date}
          setDate={setDate}
          description={description}
          setDescription={setDescription}
          error={error}
          submitting={submitting}
          handleSubmit={handleSubmit}
        />

        <ExpenseLedger
          expenses={expenses}
          loading={loading}
          handleDelete={handleDelete}
        />
      </div>

      <ConfirmationModal 
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmState.action}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
