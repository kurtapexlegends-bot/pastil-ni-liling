import React, { useEffect } from 'react';
import { Warning, CheckCircle, Info } from "@phosphor-icons/react";

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  buttonText?: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function AlertModal({
  isOpen,
  title,
  message,
  buttonText = "Okay",
  type = 'info',
  onClose
}: AlertModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getConfig = () => {
    switch (type) {
      case 'success':
        return { icon: <CheckCircle size={28} weight="fill" />, colorClass: 'bg-brand-green/10 text-brand-green' };
      case 'error':
        return { icon: <Warning size={28} weight="fill" />, colorClass: 'bg-rose-50 text-rose-500' };
      case 'info':
      default:
        return { icon: <Info size={28} weight="fill" />, colorClass: 'bg-brand-earth/10 text-brand-earth' };
    }
  };

  const { icon, colorClass } = getConfig();

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-brand-earth/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
            {icon}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-brand-earth tracking-tight">
              {title}
            </h3>
            <p className="text-[13px] text-brand-earth/60 font-semibold leading-relaxed whitespace-pre-wrap">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-8 flex w-full">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest text-white active:scale-[0.98] transition-all shadow-sm bg-brand-earth hover:bg-brand-earth/95"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
