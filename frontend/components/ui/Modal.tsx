'use client';

import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidthClass?: string; // e.g., 'max-w-md', 'max-w-lg', 'max-w-2xl'
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidthClass = 'max-w-md',
}: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-brand-earth/30 backdrop-blur-md animate-fade-in sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div 
        className={`bg-white border border-gray-100 w-full rounded-t-3xl rounded-b-none shadow-[0_24px_64px_-16px_rgba(27,45,22,0.18)] relative overflow-hidden flex flex-col max-h-[90vh] animate-slide-up-bottom sm:rounded-3xl sm:max-h-[calc(100vh-8rem)] sm:w-full ${maxWidthClass} sm:animate-slide-up`}
        onClick={(e) => e.stopPropagation()} // Stop click propagation to background
      >
        {/* Mobile Swipe/Pull Handle Indicator */}
        <div className="w-12 h-1 bg-gray-200/80 rounded-full mx-auto my-3 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 pt-2 pb-4 border-b border-gray-100 bg-[#fafafa]/50 sm:pt-5">
          <div>
            <h3 className="text-xs font-black text-brand-earth uppercase tracking-widest font-display">
              {title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close dialog"
            className="w-7 h-7 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-brand-earth/40 hover:text-brand-earth hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Content Container */}
        <div className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
