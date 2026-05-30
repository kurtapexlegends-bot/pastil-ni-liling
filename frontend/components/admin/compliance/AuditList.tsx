import React, { useState, useEffect } from 'react';
import { Audit } from './types';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import { ShieldCheck } from '@phosphor-icons/react';

interface AuditListProps {
  audits: Audit[];
  userRole: string;
  onReview: (id: number, status: 'approved' | 'flagged') => Promise<void>;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
    case "resolved":
      return "bg-green-50 text-green-700 border-green-100/60";
    case "flagged":
      return "bg-red-50 text-red-700 border-red-100/60";
    default:
      return "bg-amber-50 text-amber-700 border-amber-100/60";
  }
};

const getScoreGrade = (score: number) => {
  if (score >= 90) return { label: 'Grade A', color: 'text-emerald-700 bg-emerald-50 border-emerald-100/60', accent: 'bg-emerald-500' };
  if (score >= 75) return { label: 'Grade B', color: 'text-amber-700 bg-amber-50 border-amber-100/60', accent: 'bg-amber-500' };
  return { label: 'Critical Fail', color: 'text-rose-700 bg-rose-50 border-rose-100/60', accent: 'bg-rose-500' };
};

export default function AuditList({ audits, userRole, onReview }: AuditListProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [audits]);

  const totalPages = Math.ceil(audits.length / pageSize);
  const paginatedAudits = audits.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (audits.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="No QC Compliance Logs Found"
        description="Branch audits will appear here once submitted by authorized officers."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-300">
      {paginatedAudits.map((audit) => {
        const hygieneGrade = getScoreGrade(audit.hygiene_score);
        const recipeGrade = getScoreGrade(audit.recipe_adherence_score);
        
        return (
          <div key={audit.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md hover:border-gray-200/60 transition-all duration-200">
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
              {/* Hygiene Metric */}
              <div className="border border-gray-50 bg-gray-50/20 p-3 rounded-xl flex flex-col justify-between h-20">
                <div className="flex justify-between items-start">
                  <span className="text-[8px] font-bold text-brand-earth/30 uppercase tracking-widest">Hygiene Rating</span>
                  <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${hygieneGrade.color}`}>
                    {hygieneGrade.label}
                  </span>
                </div>
                <div className="mt-1">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-sm font-black text-brand-earth">{audit.hygiene_score}</span>
                    <span className="text-[9px] font-medium text-brand-earth/30">/100</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1 rounded-full mt-2 overflow-hidden">
                    <div className={`h-full ${hygieneGrade.accent}`} style={{ width: `${audit.hygiene_score}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Recipe Adherence Metric */}
              <div className="border border-gray-50 bg-gray-50/20 p-3 rounded-xl flex flex-col justify-between h-20">
                <div className="flex justify-between items-start">
                  <span className="text-[8px] font-bold text-brand-earth/30 uppercase tracking-widest">Recipe Adherence</span>
                  <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${recipeGrade.color}`}>
                    {recipeGrade.label}
                  </span>
                </div>
                <div className="mt-1">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-sm font-black text-brand-earth">{audit.recipe_adherence_score}</span>
                    <span className="text-[9px] font-medium text-brand-earth/30">/100</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1 rounded-full mt-2 overflow-hidden">
                    <div className={`h-full ${recipeGrade.accent}`} style={{ width: `${audit.recipe_adherence_score}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Photo Submission Preview */}
              <div className="border border-gray-50 bg-gray-50/20 p-2.5 rounded-xl flex items-center gap-3 h-20">
                <div 
                  onClick={() => setSelectedPhoto(audit.kitchen_photo_path || '/photos/kitchen_liling.jpg')}
                  className="w-14 h-14 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden shrink-0 cursor-pointer relative group/img"
                >
                  <img 
                    src={audit.kitchen_photo_path || '/photos/kitchen_liling.jpg'} 
                    alt="Kitchen submission" 
                    className="w-full h-full object-cover group-hover/img:scale-110 transition-all duration-300" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </div>
                </div>
                <div className="text-left flex-1 min-w-0">
                  <span className="text-[8px] font-bold text-brand-earth/30 uppercase tracking-widest block">Cleanliness Photo</span>
                  <span className="text-[8px] font-bold text-brand-green uppercase tracking-wider mt-1 block truncate">Verified Submission</span>
                  <button 
                    onClick={() => setSelectedPhoto(audit.kitchen_photo_path || '/photos/kitchen_liling.jpg')}
                    className="text-[7px] font-semibold text-brand-earth/40 hover:text-brand-earth uppercase tracking-widest mt-0.5 underline block"
                  >
                    Inspect Large
                  </button>
                </div>
              </div>
            </div>

            {audit.notes && (
              <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-50">
                <p className="text-[8px] font-bold text-brand-earth/30 uppercase tracking-widest">Audit Notes</p>
                <p className="text-[10px] font-semibold text-brand-earth/70 mt-1 whitespace-pre-line leading-relaxed">{audit.notes}</p>
              </div>
            )}

            {audit.status === "pending" && (userRole === "Admin" || userRole === "HQ operations") && (
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                <button
                  onClick={() => onReview(audit.id, 'flagged')}
                  className="border border-red-100 hover:bg-red-50 text-red-500 font-bold uppercase tracking-wider text-[8px] px-3 py-1.5 rounded-lg transition-all active:scale-[0.98]"
                >
                  Flag Violation
                </button>
                <button
                  onClick={() => onReview(audit.id, 'approved')}
                  className="bg-brand-earth hover:bg-brand-earth/95 text-white font-bold uppercase tracking-wider text-[8px] px-3 py-1.5 rounded-lg transition-all shadow-sm active:scale-[0.98]"
                >
                  Approve Compliance
                </button>
              </div>
            )}
          </div>
        );
      })}

      {audits.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            totalItems={audits.length}
          />
        </div>
      )}

      {/* High-Res Fullscreen Inspection Lightbox Overlay */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-earth/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="relative max-w-3xl max-h-[90vh] p-2 bg-white rounded-3xl shadow-2xl m-4 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" 
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white text-brand-earth hover:text-black transition-all shadow-md z-10 active:scale-90"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img src={selectedPhoto} alt="Kitchen Inspection Preview" className="max-w-full max-h-[80vh] object-contain rounded-2xl" />
            <div className="p-4 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-earth/40">Cleanliness Verification Photo</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
