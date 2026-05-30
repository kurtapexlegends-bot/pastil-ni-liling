"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Audit, Anomaly, Hub } from "./types";
import AuditList from "./AuditList";
import AnomalyTable from "./AnomalyTable";
import NewAuditModal from "./NewAuditModal";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { ArrowUpRight } from "@phosphor-icons/react";

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
    throw new Error("Failed to sync compliance registry.");
  }
  return res.json();
};

export default function QCComplianceManager() {
  const [activeSubTab, setActiveSubTab] = useState<'audits' | 'anomalies'>('audits');
  
  const { data: auditRes, mutate: mutateAudits } = useSWR(
    "http://127.0.0.1:8000/api/compliance/audits",
    fetcher
  );
  
  const { data: hubRes } = useSWR(
    "http://127.0.0.1:8000/api/admin/hubs",
    fetcher
  );

  const { data: anomalyRes, mutate: mutateAnomalies } = useSWR(
    "http://127.0.0.1:8000/api/compliance/anomalies",
    fetcher
  );

  const audits = auditRes?.success ? auditRes.data : [];
  const hubs = hubRes?.success ? hubRes.data : [];
  const anomalies = anomalyRes?.success ? anomalyRes.data : [];
  const loading = !auditRes && !hubRes && !anomalyRes;

  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      try {
        const parsedUser = JSON.parse(userRaw);
        const role = parsedUser.roles?.[0]?.name || "Customer";
        setUserRole(role);
      } catch (e) {
        console.error(e);
      }
    }
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
        mutateAudits();
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
        mutateAnomalies();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitAudit = async (data: { hub_id: string; hygiene_score: number; recipe_adherence_score: number; notes: string; kitchen_photo?: string }) => {
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
        kitchen_photo: data.kitchen_photo || "/photos/kitchen_liling.jpg"
      })
    });

    const resData = await res.json();
    if (!res.ok || !resData.success) {
      throw new Error(resData.message || "Failed to submit compliance audit.");
    }

    mutateAudits();
  };

  const handleExportAuditsCSV = () => {
    const headers = ["Stall Branch", "Hygiene Rating", "Recipe Adherence", "Auditor", "Date", "Status", "Notes"];
    const rows = audits.map((audit: any) => [
      `"${audit.hub.name}"`,
      audit.hygiene_score,
      audit.recipe_adherence_score,
      `"${audit.auditor.name}"`,
      `"${audit.audit_date}"`,
      `"${audit.status}"`,
      `"${audit.notes || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map((e: any) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hygiene_QC_Audits_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAnomaliesCSV = () => {
    const headers = ["Stall Branch", "Offline ID", "Product", "Requested Qty", "Available Qty", "Status", "Notes"];
    const rows = anomalies.map((anom: any) => [
      `"${anom.hub_name}"`,
      `"${anom.offline_order_id}"`,
      `"${anom.product_name}"`,
      anom.requested_quantity,
      anom.available_quantity,
      `"${anom.status}"`,
      `"${anom.notes || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map((e: any) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Sync_Reconciliation_Anomalies_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Sleek, Premium Mode Toggle Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white p-3 rounded-2xl border border-gray-100/80 shadow-sm gap-4">
        <SegmentedControl
          value={activeSubTab}
          onChange={setActiveSubTab}
          options={[
            { id: "audits", label: "QC Standard Audits" },
            { id: "anomalies", label: `POS Sync Reconciliation (${anomalies.length})` }
          ]}
        />
        <div className="flex items-center gap-2">
          {activeSubTab === 'audits' ? (
            <>
              {audits.length > 0 && (
                <button
                  onClick={handleExportAuditsCSV}
                  className="border border-gray-200 hover:bg-gray-50 text-brand-earth/70 font-bold uppercase tracking-widest text-[8px] px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                >
                  <ArrowUpRight size={12} weight="bold" />
                  Export CSV
                </button>
              )}
              <button
                onClick={() => setIsOpen(true)}
                className="bg-brand-earth hover:bg-brand-earth/95 text-white font-bold uppercase tracking-wider text-[9px] px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer shrink-0 active:scale-[0.98]"
              >
                New Compliance Log
              </button>
            </>
          ) : (
            anomalies.length > 0 && (
              <button
                onClick={handleExportAnomaliesCSV}
                className="border border-gray-200 hover:bg-gray-50 text-brand-earth/70 font-bold uppercase tracking-widest text-[8px] px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
              >
                <ArrowUpRight size={12} weight="bold" />
                Export CSV
              </button>
            )
          )}
        </div>
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
