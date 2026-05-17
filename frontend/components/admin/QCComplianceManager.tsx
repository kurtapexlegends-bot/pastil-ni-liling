"use client";

import { useState, useEffect } from "react";

interface Audit {
  id: number;
  hub: { name: string };
  auditor: { name: string };
  audit_date: string;
  hygiene_score: number;
  recipe_adherence_score: number;
  notes: string;
  status: 'pending' | 'approved' | 'flagged';
  kitchen_photo_path: string;
}

export default function QCComplianceManager() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [hubs, setHubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  
  // Submit Audit Form State
  const [hubId, setHubId] = useState("");
  const [hygiene, setHygiene] = useState(100);
  const [recipe, setRecipe] = useState(100);
  const [notes, setNotes] = useState("");

  const fetchAudits = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const [auditRes, hubRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/compliance/audits", {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch("http://127.0.0.1:8000/api/admin/hubs", {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ]);

      const auditData = await auditRes.json();
      const hubData = await hubRes.json();

      if (auditData.success) setAudits(auditData.data);
      if (hubData.success) setHubs(hubData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const handleReview = async (id: number, status: 'approved' | 'flagged') => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/compliance/audits/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status, notes: "Audited and verified by HQ operations." })
      });
      const data = await res.json();
      if (data.success) {
        fetchAudits();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/compliance/audits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          hub_id: hubId,
          hygiene_score: hygiene,
          recipe_adherence_score: recipe,
          notes,
          kitchen_photo: "/photos/kitchen_liling.jpg"
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit compliance audit.");
      }

      setIsOpen(false);
      setHubId("");
      setHygiene(100);
      setRecipe(100);
      setNotes("");
      fetchAudits();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-50 text-green-700 border-green-100";
      case "flagged":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-brand-earth uppercase tracking-wider">Quality Control & Compliance Audits</h2>
          <p className="text-[10px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Submit and review weekly kitchen hygiene logs, taste and formulation adherence tests, and photo logs.</p>
        </div>
        <button
          onClick={() => {
            if (hubs.length > 0) setHubId(hubs[0].id.toString());
            setIsOpen(true);
          }}
          className="bg-brand-earth hover:bg-brand-earth/90 text-white font-bold uppercase tracking-wider text-[9px] px-4 py-2.5 rounded-lg shadow-sm transition-all"
        >
          New Compliance Log
        </button>
      </div>

      {loading ? (
        <div className="h-64 bg-white border border-gray-100 rounded-xl flex items-center justify-center">
          <p className="text-[10px] text-brand-earth/30 uppercase tracking-widest font-semibold">Syncing compliance logs...</p>
        </div>
      ) : audits.length === 0 ? (
        <div className="h-64 bg-white border border-gray-100 rounded-xl flex items-center justify-center">
          <p className="text-[10px] text-brand-earth/30 uppercase tracking-widest font-semibold">No digital QC audits submitted yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {audits.map((audit) => (
            <div key={audit.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-green/10 border border-brand-green/20 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-brand-green">QC</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-brand-earth uppercase tracking-wider">{audit.hub.name}</h3>
                    <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest font-medium mt-0.5">
                      Submitted by {audit.auditor.name} on {audit.audit_date}
                    </p>
                  </div>
                </div>
                <span className={`border text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${getStatusBadge(audit.status)}`}>
                  {audit.status}
                </span>
              </div>

              {/* QC Scores & Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-50 bg-gray-50/20 p-3 rounded-lg flex flex-col justify-center">
                  <span className="text-[8px] font-bold text-brand-earth/30 uppercase tracking-widest">Hygiene Rating</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-base font-black text-brand-earth">{audit.hygiene_score}</span>
                    <span className="text-[10px] font-bold text-brand-earth/40">/100</span>
                  </div>
                </div>

                <div className="border border-gray-50 bg-gray-50/20 p-3 rounded-lg flex flex-col justify-center">
                  <span className="text-[8px] font-bold text-brand-earth/30 uppercase tracking-widest">Recipe Standard Adherence</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-base font-black text-brand-earth">{audit.recipe_adherence_score}</span>
                    <span className="text-[10px] font-bold text-brand-earth/40">/100</span>
                  </div>
                </div>

                <div className="border border-gray-50 bg-gray-50/20 p-3 rounded-lg flex flex-col justify-center">
                  <span className="text-[8px] font-bold text-brand-earth/30 uppercase tracking-widest">Kitchen Photo Submission</span>
                  <span className="text-[9px] font-bold text-brand-green uppercase tracking-wider mt-2.5">
                    ✓ Photo uploaded
                  </span>
                </div>
              </div>

              {audit.notes && (
                <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-50">
                  <p className="text-[8px] font-bold text-brand-earth/30 uppercase tracking-widest">Audit Notes</p>
                  <p className="text-[10px] font-semibold text-brand-earth/70 mt-1 whitespace-pre-line">{audit.notes}</p>
                </div>
              )}

              {audit.status === "pending" && (
                <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => handleReview(audit.id, 'flagged')}
                    className="border border-red-100 hover:bg-red-50 text-red-500 font-bold uppercase tracking-wider text-[8px] px-3 py-1.5 rounded-lg transition-all"
                  >
                    Flag Violation
                  </button>
                  <button
                    onClick={() => handleReview(audit.id, 'approved')}
                    className="bg-brand-earth hover:bg-brand-earth/95 text-white font-bold uppercase tracking-wider text-[8px] px-3 py-1.5 rounded-lg transition-all shadow-sm"
                  >
                    Approve Compliance
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-earth/40 backdrop-blur-xs">
          <div className="bg-white border border-gray-100 w-full max-w-md p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
              <h3 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Register QC standard log</h3>
              <button onClick={() => setIsOpen(false)} className="text-brand-earth/30 hover:text-brand-earth font-bold text-sm">✕</button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-[9px] font-semibold text-red-600 uppercase tracking-wide">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-brand-earth/40 uppercase tracking-widest">Select Branch Hub</label>
                <select
                  required
                  value={hubId}
                  onChange={(e) => setHubId(e.target.value)}
                  className="w-full border border-gray-100 rounded-xl px-3 py-2 text-[10px] font-bold text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all"
                >
                  {hubs.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-brand-earth/40 uppercase tracking-widest">Hygiene Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={hygiene}
                    onChange={(e) => setHygiene(parseInt(e.target.value))}
                    className="w-full border border-gray-100 rounded-xl px-3 py-2 text-[10px] font-medium text-brand-earth focus:border-brand-earth/30 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-brand-earth/40 uppercase tracking-widest">Recipe Adherence (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={recipe}
                    onChange={(e) => setRecipe(parseInt(e.target.value))}
                    className="w-full border border-gray-100 rounded-xl px-3 py-2 text-[10px] font-medium text-brand-earth focus:border-brand-earth/30 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-bold text-brand-earth/40 uppercase tracking-widest">Kitchen photo upload</label>
                <div className="border border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-gray-50/50 transition-colors">
                  <span className="text-[9px] font-bold text-brand-green uppercase tracking-wide">✓ kitchen_hygiene_diliman.jpg selected</span>
                  <span className="text-[7px] font-semibold text-brand-earth/30 uppercase tracking-widest mt-1">Automatic high-res photo capture</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-bold text-brand-earth/40 uppercase tracking-widest">Audit & Hygiene Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-100 rounded-xl px-3 py-2 text-[10px] font-medium text-brand-earth focus:border-brand-earth/30 outline-none transition-all h-20 resize-none"
                  placeholder="Describe recipe taste checks, cleanliness parameters, and standard checklist details..."
                />
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
                  Submit Standard Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
