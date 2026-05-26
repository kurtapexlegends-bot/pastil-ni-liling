import React from 'react';
import { Audit } from './types';

interface AuditListProps {
  audits: Audit[];
  userRole: string;
  onReview: (id: number, status: 'approved' | 'flagged') => Promise<void>;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
    case "resolved":
      return "bg-green-50 text-green-700 border-green-100";
    case "flagged":
      return "bg-red-50 text-red-700 border-red-100";
    default:
      return "bg-amber-50 text-amber-700 border-amber-100";
  }
};

export default function AuditList({ audits, userRole, onReview }: AuditListProps) {
  if (audits.length === 0) {
    return (
      <div className="h-64 bg-white border border-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-[10px] text-brand-earth/30 uppercase tracking-widest font-semibold">No digital QC audits submitted yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-300">
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
                Photo uploaded
              </span>
            </div>
          </div>

          {audit.notes && (
            <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-50">
              <p className="text-[8px] font-bold text-brand-earth/30 uppercase tracking-widest">Audit Notes</p>
              <p className="text-[10px] font-semibold text-brand-earth/70 mt-1 whitespace-pre-line">{audit.notes}</p>
            </div>
          )}

          {audit.status === "pending" && (userRole === "Admin" || userRole === "HQ operations") && (
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
              <button
                onClick={() => onReview(audit.id, 'flagged')}
                className="border border-red-100 hover:bg-red-50 text-red-500 font-bold uppercase tracking-wider text-[8px] px-3 py-1.5 rounded-lg transition-all"
              >
                Flag Violation
              </button>
              <button
                onClick={() => onReview(audit.id, 'approved')}
                className="bg-brand-earth hover:bg-brand-earth/95 text-white font-bold uppercase tracking-wider text-[8px] px-3 py-1.5 rounded-lg transition-all shadow-sm"
              >
                Approve Compliance
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
