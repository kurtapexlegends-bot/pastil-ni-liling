"use client";

import { useState } from "react";
import useSWR from "swr";
import Modal from "../../ui/Modal";
import { useConfirm } from "../../../hooks/useConfirm";
import { Eye, EyeSlash, UsersThree } from "@phosphor-icons/react";
import EmptyState from "@/components/ui/EmptyState";

interface UserRecord {
  id: number;
  name: string;
  email: string;
  roles: Array<{ name: string }>;
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Missing authentication token.");
  
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error("Failed to sync user registry.");
  }
  return res.json();
};

export default function UserManager() {
  const { data: userRes, error: swrError, mutate } = useSWR(
    "http://127.0.0.1:8000/api/admin/employees",
    fetcher
  );

  const usersList = userRes?.success ? userRes.data : [];
  const loading = !userRes && !swrError;

  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Branch Cashier");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { confirm } = useConfirm();

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
        throw new Error(data.message || "Failed to save user credentials.");
      }

      setIsOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole("Branch Cashier");
      setEditingId(null);
      
      // Instantly mutate SWR cache to update grids and directory lists in real-time
      mutate();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (user: UserRecord) => {
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setRole(user.roles[0]?.name || "Branch Cashier");
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: "Terminate User Session",
      message: "Are you sure you want to terminate this user's credentials? This action cannot be undone.",
      confirmText: "Terminate",
      isDestructive: true
    });

    if (!confirmed) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/admin/employees/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        mutate();
      } else {
        setError(data.message || "Failed to terminate user credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to communicate with the server.");
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
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingId(null);
            setName("");
            setEmail("");
            setPassword("");
            setRole("Branch Cashier");
            setIsOpen(true);
          }}
          className="bg-brand-earth hover:bg-brand-earth/95 text-white font-bold uppercase tracking-wider text-[9px] px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer active:scale-[0.98]"
        >
          Add User
        </button>
      </div>

      {error && !isOpen && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-[9px] font-semibold text-red-600 uppercase tracking-wide">
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-64 bg-white border border-gray-100 rounded-xl flex items-center justify-center">
          <p className="text-[10px] text-brand-earth/30 uppercase tracking-widest font-semibold">Syncing user directory...</p>
        </div>
      ) : usersList.length === 0 ? (
        <EmptyState
          icon={UsersThree}
          title="No Registered Users"
          description="Authorized platform staff, hub operations personnel, and system administrator profiles will appear here."
        />
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Name</th>
                <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Email</th>
                <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">Permission Role</th>
                <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-brand-earth/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((user: UserRecord) => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/20 transition-colors">
                  <td className="p-4 text-[10px] font-bold text-brand-earth">{user.name}</td>
                  <td className="p-4 text-[10px] font-medium text-brand-earth/60">{user.email}</td>
                  <td className="p-4">
                    <span className={`inline-block border text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${getRoleBadgeColor(user.roles[0]?.name || "Branch Cashier")}`}>
                      {getRoleLabel(user.roles[0]?.name || "Branch Cashier")}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="border border-gray-100 bg-white hover:bg-gray-50 text-brand-earth font-bold uppercase tracking-wider text-[8px] px-2.5 py-1.5 rounded-md shadow-sm transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
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
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingId ? "Update User Details" : "Register New User"}
      >
        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-100 rounded-lg text-[9px] font-semibold text-red-600 uppercase tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
              placeholder="e.g. John Smith"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
              placeholder="e.g. example@pnl.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">
              {editingId ? "New Password (Optional)" : "Password"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required={!editingId}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-100 rounded-2xl pl-4 pr-10 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
                placeholder="Minimum 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 text-brand-earth/30 hover:text-brand-green transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
              >
                {showPassword ? <EyeSlash size={16} weight="bold" /> : <Eye size={16} weight="bold" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Permission Level (RBAC Role)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-bold text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
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
              className="flex-1 bg-brand-earth hover:bg-brand-earth/95 text-white font-bold uppercase tracking-wider text-[9px] py-2.5 rounded-xl transition-all shadow-xl shadow-brand-earth/10"
            >
              Save User
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
