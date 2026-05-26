"use client";

import { useState, useEffect } from "react";
import { Audit, Anomaly, Hub } from "./compliance/types";
import AuditList from "./compliance/AuditList";
import AnomalyTable from "./compliance/AnomalyTable";
import NewAuditModal from "./compliance/NewAuditModal";

export default function QCComplianceManager() {
  const [activeSubTab, setActiveSubTab] = useState<'audits' | 'anomalies'>('audits');
  const [audits, setAudits] = useState<Audit[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    if (!token) return;

    if (userRaw) {
      try {
        const parsedUser = JSON.parse(userRaw);
        const role = parsedUser.roles?.[0]?.name || "Customer";
        setUserRole(role);
      } catch (e) {
        console.error(e);
      }
    }

    try {
      const [auditRes, hubRes, anomalyRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/compliance/audits", {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch("http://127.0.0.1:8000/api/admin/hubs", {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch("http://127.0.0.1:8000/api/compliance/anomalies", {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ]);

      const auditData = await auditRes.json();
      const hubData = await hubRes.json();
      const anomalyData = await anomalyRes.json();

      if (auditData.success) setAudits(auditData.data);
      if (hubData.success) setHubs(hubData.data);
      if (anomalyData.success) setAnomalies(anomalyData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveAnomaly = async (id: number, resolutionNotes: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/compliance/anomalies/${id}/resolve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ notes: resolutionNotes })
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitAudit = async (data: { hub_id: string; hygiene_score: number; recipe_adherence_score: number; notes: string }) => {
    setError("");
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("http://127.0.0.1:8000/api/compliance/audits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        hub_id: data.hub_id,
        hygiene_score: data.hygiene_score,
        recipe_adherence_score: data.recipe_adherence_score,
        notes: data.notes,
        kitchen_photo: "/photos/kitchen_liling.jpg"
      })
    });

    const resData = await res.json();
    if (!res.ok || !resData.success) {
      throw new Error(resData.message || "Failed to submit compliance audit.");
    }

    await fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-brand-earth uppercase tracking-wider">Quality Control & Compliance Audits</h2>
          <p className="text-[10px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Submit and review weekly kitchen hygiene logs, taste adherence tests, and offline POS sync reconciliation logs.</p>
        </div>
        <div className="flex items-center gap-2">
          {activeSubTab === 'audits' && (
            <button
              onClick={() => setIsOpen(true)}
              className="bg-brand-earth hover:bg-brand-earth/90 text-white font-bold uppercase tracking-wider text-[9px] px-4 py-2.5 rounded-lg shadow-sm transition-all"
            >
              New Compliance Log
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveSubTab('audits')}
          className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeSubTab === 'audits' ? 'border-brand-green text-brand-green' : 'border-transparent text-brand-earth/40 hover:text-brand-earth'
          }`}
        >
          QC Standard Audits
        </button>
        <button
          onClick={() => setActiveSubTab('anomalies')}
          className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeSubTab === 'anomalies' ? 'border-brand-green text-brand-green' : 'border-transparent text-brand-earth/40 hover:text-brand-earth'
          }`}
        >
          POS Sync Reconciliation ({anomalies.length})
        </button>
      </div>

      {loading ? (
        <div className="h-64 bg-white border border-gray-100 rounded-xl flex items-center justify-center">
          <p className="text-[10px] text-brand-earth/30 uppercase tracking-widest font-semibold">Syncing compliance logs...</p>
        </div>
      ) : activeSubTab === 'audits' ? (
        <AuditList 
          audits={audits} 
          userRole={userRole} 
          onReview={handleReview} 
        />
      ) : (
        <AnomalyTable 
          anomalies={anomalies} 
          userRole={userRole} 
          onResolveAnomaly={handleResolveAnomaly} 
        />
      )}

      <NewAuditModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        hubs={hubs} 
        onSubmitAudit={handleSubmitAudit} 
        error={error} 
      />
    </div>
  );
}
