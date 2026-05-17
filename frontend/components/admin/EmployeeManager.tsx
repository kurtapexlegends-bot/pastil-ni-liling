"use client";

import { useState, useEffect } from "react";

interface Employee {
  id: number;
  name: string;
  email: string;
  roles: Array<{ name: string }>;
}

export default function EmployeeManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Branch Cashier");
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchEmployees = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/admin/employees", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("token");
    if (!token) return;

    const isEdit = editingId !== null;
    const url = isEdit 
      ? `http://127.0.0.1:8000/api/admin/employees/${editingId}`
      : "http://127.0.0.1:8000/api/admin/employees";
    const method = isEdit ? "PUT" : "POST";

    try {
      const payload: any = { name, email, role };
      if (!isEdit || password) {
        payload.password = password;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save personnel details.");
      }

      setIsOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole("Branch Cashier");
      setEditingId(null);
      fetchEmployees();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setName(emp.name);
    setEmail(emp.email);
    setPassword("");
    setRole(emp.roles[0]?.name || "Branch Cashier");
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to terminate this employee's credentials?")) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/admin/employees/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchEmployees();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case "Admin":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "HQ operations":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "Franchisee":
        return "bg-green-50 text-green-700 border-green-100";
      case "Branch Cashier":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getRoleLabel = (roleName: string) => {
    if (roleName === "Admin") return "Super Admin";
    if (roleName === "Franchisee") return "Franchise Partner";
    return roleName;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-brand-earth uppercase tracking-wider">Employee Directory</h2>
          <p className="text-[10px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Configure access tokens, user credentials, and custom RBAC permission settings.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setName("");
            setEmail("");
            setPassword("");
            setRole("Branch Cashier");
            setIsOpen(true);
          }}
          className="bg-brand-earth hover:bg-brand-earth/90 text-white font-bold uppercase tracking-wider text-[9px] px-4 py-2.5 rounded-lg shadow-sm transition-all"
        >
          Add Personnel
        </button>
      </div>

      {loading ? (
        <div className="h-64 bg-white border border-gray-100 rounded-xl flex items-center justify-center">
          <p className="text-[10px] text-brand-earth/30 uppercase tracking-widest font-semibold">Syncing employee registry...</p>
        </div>
      ) : employees.length === 0 ? (
        <div className="h-64 bg-white border border-gray-100 rounded-xl flex items-center justify-center">
          <p className="text-[10px] text-brand-earth/30 uppercase tracking-widest font-semibold">No employees currently registered.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Name</th>
                <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Email</th>
                <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Permission Role</th>
                <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-gray-50 hover:bg-gray-50/20 transition-colors">
                  <td className="p-4 text-[10px] font-bold text-brand-earth">{emp.name}</td>
                  <td className="p-4 text-[10px] font-medium text-brand-earth/60">{emp.email}</td>
                  <td className="p-4">
                    <span className={`inline-block border text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${getRoleBadgeColor(emp.roles[0]?.name || "Branch Cashier")}`}>
                      {getRoleLabel(emp.roles[0]?.name || "Branch Cashier")}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(emp)}
                      className="border border-gray-100 bg-white hover:bg-gray-50 text-brand-earth font-bold uppercase tracking-wider text-[8px] px-2.5 py-1.5 rounded-md shadow-sm transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="border border-red-100 hover:bg-red-50 text-red-500 font-bold uppercase tracking-wider text-[8px] px-2.5 py-1.5 rounded-md transition-all"
                    >
                      Terminate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-earth/40 backdrop-blur-xs">
          <div className="bg-white border border-gray-100 w-full max-w-md p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
              <h3 className="text-xs font-bold text-brand-earth uppercase tracking-wider">
                {editingId ? "Update Employee Details" : "Register New Employee"}
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-brand-earth/30 hover:text-brand-earth font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-[9px] font-semibold text-red-600 uppercase tracking-wide">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-brand-earth/40 uppercase tracking-widest">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-100 rounded-xl px-3 py-2 text-[10px] font-medium text-brand-earth focus:border-brand-earth/30 outline-none transition-all"
                  placeholder="e.g. Juan dela Cruz"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-bold text-brand-earth/40 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-100 rounded-xl px-3 py-2 text-[10px] font-medium text-brand-earth focus:border-brand-earth/30 outline-none transition-all"
                  placeholder="e.g. juan@pastilnililing.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-bold text-brand-earth/40 uppercase tracking-widest">
                  {editingId ? "New Password (Optional)" : "Password"}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-100 rounded-xl px-3 py-2 text-[10px] font-medium text-brand-earth focus:border-brand-earth/30 outline-none transition-all"
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-bold text-brand-earth/40 uppercase tracking-widest">Permission Level (RBAC Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-gray-100 rounded-xl px-3 py-2 text-[10px] font-bold text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all"
                >
                  <option value="Admin">Super Admin</option>
                  <option value="HQ operations">HQ Operations Director</option>
                  <option value="Franchisee">Franchise Partner</option>
                  <option value="Branch Cashier">Branch Cashier</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 border border-gray-100 hover:bg-gray-50 text-brand-earth/70 font-bold uppercase tracking-wider text-[9px] py-2.5 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-earth hover:bg-brand-earth/95 text-white font-bold uppercase tracking-wider text-[9px] py-2.5 rounded-xl transition-all"
                >
                  Save Personnel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
