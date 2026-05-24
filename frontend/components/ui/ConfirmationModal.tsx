'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Warning, Info } from "@phosphor-icons/react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = true,
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-brand-earth/30 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${isDestructive ? 'bg-rose-50 text-rose-500' : 'bg-brand-green/10 text-brand-green'}`}>
            {isDestructive ? <Warning size={28} weight="fill" /> : <Info size={28} weight="fill" />}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-brand-earth tracking-tight">
              {title}
            </h3>
            <p className="text-[13px] text-brand-earth/60 font-semibold leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-100 bg-white text-brand-earth font-bold text-xs uppercase tracking-widest hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest text-white active:scale-[0.98] transition-all shadow-sm ${
              isDestructive 
                ? 'bg-rose-600 hover:bg-rose-700' 
                : 'bg-brand-green hover:bg-brand-green/90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
