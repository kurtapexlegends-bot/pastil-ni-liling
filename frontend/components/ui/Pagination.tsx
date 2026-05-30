import React from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalItems: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 border-t border-gray-50 bg-white">
      <p className="text-[10px] font-bold text-brand-earth/40 uppercase tracking-wider">
        Showing <span className="text-brand-earth font-black">{startItem}</span> to{" "}
        <span className="text-brand-earth font-black">{endItem}</span> of{" "}
        <span className="text-brand-earth font-black">{totalItems}</span> entries
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center text-brand-earth/60 hover:border-brand-green hover:text-brand-green transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.9]"
        >
          <CaretLeft size={12} weight="bold" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-7 h-7 rounded-full border text-[10px] font-bold transition-all active:scale-[0.9] ${
              currentPage === page
                ? "bg-brand-earth border-brand-earth text-white shadow-sm font-black"
                : "bg-white border-gray-100 text-brand-earth/50 hover:border-brand-green hover:text-brand-green"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center text-brand-earth/60 hover:border-brand-green hover:text-brand-green transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.9]"
        >
          <CaretRight size={12} weight="bold" />
        </button>
      </div>
    </div>
  );
}
