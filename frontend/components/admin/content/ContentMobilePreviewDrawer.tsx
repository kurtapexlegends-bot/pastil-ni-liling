'use client';

import { Eye, X } from '@phosphor-icons/react';
import MobileMockup from './mockups/MobileMockup';
import { SiteSettings, Product } from './mockups/types';

export interface ContentMobilePreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  formData: SiteSettings;
  products: Product[];
  activeSubTab: 'hero' | 'stats' | 'featured' | 'announcement' | 'layout' | 'franchise';
}

export default function ContentMobilePreviewDrawer({
  isOpen,
  onClose,
  formData,
  products,
  activeSubTab
}: ContentMobilePreviewDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex justify-end animate-in fade-in duration-300 select-none">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-brand-earth/30 backdrop-blur-[2px] animate-fade-in"
      />
      {/* Slide Pane */}
      <div className="relative w-full max-w-[320px] h-full bg-background shadow-2xl flex flex-col justify-start items-center p-6 overflow-y-auto scrollbar-hide border-l border-gray-100 animate-in slide-in-from-right duration-300">
        <header className="w-full flex items-center justify-between mb-6 shrink-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-earth/60 flex items-center gap-1.5">
            <Eye size={12} weight="fill" className="text-brand-green" />
            Live Mobile Mockup
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close mobile preview"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-gray-100 flex items-center justify-center text-brand-earth/70 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>
        </header>

        {/* Mobile Device Mockup Emulation */}
        <div className="scale-[0.9] origin-top my-auto">
          <MobileMockup 
            formData={formData} 
            products={products} 
            activeSubTab={activeSubTab} 
          />
        </div>
      </div>
    </div>
  );
}
