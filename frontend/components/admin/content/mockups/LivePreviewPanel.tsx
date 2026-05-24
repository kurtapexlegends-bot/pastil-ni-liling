import React, { useState } from 'react';
import { Eye, DeviceMobile, Monitor } from '@phosphor-icons/react';
import { Product } from '../../../../app/admin/types';
import MobileMockup from './MobileMockup';
import DesktopMockup from './DesktopMockup';

interface SiteSettings {
  announcement_enabled: boolean;
  announcement_text: string;
  hero_badge: string;
  hero_title_white: string;
  hero_title_green: string;
  hero_subtitle: string;
  hero_cta_text: string;
  featured_products: number[];
  stats_branches: string;
  stats_orders: string;
  stats_cities: string;
  stats_applications: string;
  trust_title?: string;
  trust_subtitle?: string;
  footer_desc?: string;
  footer_copyright?: string;
  franchise_badge?: string;
  franchise_title_white?: string;
  franchise_title_green?: string;
  franchise_subtitle?: string;
  franchise_benefit1_title?: string;
  franchise_benefit1_desc?: string;
  franchise_benefit2_title?: string;
  franchise_benefit2_desc?: string;
  franchise_benefit3_title?: string;
  franchise_benefit3_desc?: string;
  franchise_benefit4_title?: string;
  franchise_benefit4_desc?: string;
  franchise_milestone_title?: string;
  franchise_milestone_desc?: string;
  franchise_footer_copyright?: string;
}

interface LivePreviewPanelProps {
  formData: SiteSettings;
  products: Product[];
  activeSubTab: string;
}

export default function LivePreviewPanel({ formData, products, activeSubTab }: LivePreviewPanelProps) {
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');

  return (
    <div className="lg:col-span-5 hidden md:flex flex-col items-center sticky top-24 select-none">
      <div className="w-full text-center space-y-1.5 mb-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-brand-earth/40 flex items-center justify-center gap-1.5">
          <Eye size={12} weight="fill" className="text-brand-green" />
          Live Preview Mockup
        </p>
        <p className="text-[8px] font-medium text-brand-earth/30 uppercase tracking-widest leading-none">
          Reflects edits dynamically in real-time
        </p>
      </div>

      {/* PREVIEW MODE TOGGLE SWITCH (GLASSMORPHIC) */}
      <div className="flex bg-gray-100/80 backdrop-blur-md p-1 rounded-xl border border-gray-200/50 mb-4 select-none self-center shadow-sm">
        <button
          type="button"
          onClick={() => setPreviewMode('mobile')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
            previewMode === 'mobile'
              ? 'bg-white text-brand-green shadow-sm'
              : 'text-brand-earth/40 hover:text-brand-earth'
          }`}
        >
          <DeviceMobile size={13} weight={previewMode === 'mobile' ? 'fill' : 'bold'} />
          Mobile
        </button>
        <button
          type="button"
          onClick={() => setPreviewMode('desktop')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
            previewMode === 'desktop'
              ? 'bg-white text-brand-green shadow-sm'
              : 'text-brand-earth/40 hover:text-brand-earth'
          }`}
        >
          <Monitor size={13} weight={previewMode === 'desktop' ? 'fill' : 'bold'} />
          Desktop
        </button>
      </div>

      {previewMode === 'mobile' ? (
        <MobileMockup 
          formData={formData} 
          products={products} 
          activeSubTab={activeSubTab} 
        />
      ) : (
        <DesktopMockup 
          formData={formData} 
          products={products} 
          activeSubTab={activeSubTab} 
        />
      )}
    </div>
  );
}
