import React, { useState, useEffect } from 'react';
import { Anomaly } from './types';
import EmptyState from '@/components/ui/EmptyState';
import { ShieldCheck } from '@phosphor-icons/react';
import Pagination from '@/components/ui/Pagination';

interface AnomalyTableProps {
  anomalies: Anomaly[];
  userRole: string;
  onResolveAnomaly: (id: number, notes: string) => Promise<void>;
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

export default function AnomalyTable({ anomalies, userRole, onResolveAnomaly }: AnomalyTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [anomalies]);

  const totalPages = Math.ceil(anomalies.length / pageSize);
  const paginatedAnomalies = anomalies.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (anomalies.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="POS Sync Reconciled"
        description="Offline sales records are fully verified. No inventory sync anomalies or discrepancies recorded."
      />
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm animate-in fade-in duration-300">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/40 text-[9px] font-bold uppercase tracking-wider text-brand-earth/50">
            <th className="p-4">Stall Branch</th>
            <th className="p-4">Offline ID</th>
            <th className="p-4">Product</th>
            <th className="p-4 text-center">Req vs Avail</th>
            <th className="p-4">Status</th>
            <th className="p-4">Notes</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedAnomalies.map((anom) => (
            <tr key={anom.id} className="border-b border-gray-50 text-xs hover:bg-gray-50/20 transition-colors">
              <td className="p-4 font-bold text-brand-earth">{anom.hub_name}</td>
              <td className="p-4 font-medium text-brand-earth/70">{anom.offline_order_id}</td>
              <td className="p-4 font-semibold text-brand-earth">{anom.product_name}</td>
              <td className="p-4 text-center">
                <span className="font-bold text-red-500">{anom.requested_quantity}</span>
                <span className="text-brand-earth/30 font-medium"> / {anom.available_quantity}</span>
              </td>
              <td className="p-4">
                <span className={`border text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${getStatusBadge(anom.status)}`}>
                  {anom.status}
                </span>
              </td>
              <td className="p-4 text-[10px] text-brand-earth/60 font-medium max-w-xs truncate">{anom.notes}</td>
              <td className="p-4 text-right">
                {anom.status === 'pending' && (userRole === 'Admin' || userRole === 'HQ operations') ? (
                  <button
                    onClick={() => {
                      const desc = prompt("Enter resolution notes:", "Reconciled with restock batch.");
                      if (desc !== null) onResolveAnomaly(anom.id, desc);
                    }}
                    className="bg-brand-earth hover:bg-brand-green text-white font-bold uppercase tracking-wider text-[8px] px-2.5 py-1.5 rounded-md transition-all shadow-sm active:scale-[0.98]"
                  >
                    Resolve
                  </button>
                ) : (
                  <span className="text-[10px] text-brand-earth/30 uppercase tracking-widest font-semibold">No actions</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {anomalies.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          totalItems={anomalies.length}
        />
      )}
    </div>
  );
}
