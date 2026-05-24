import React from 'react';
import { Globe } from '@phosphor-icons/react';

interface SiteSettings {
  trust_title?: string;
  trust_subtitle?: string;
  footer_desc?: string;
  footer_copyright?: string;
}

interface LayoutBrandingFormProps {
  formData: SiteSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function LayoutBrandingForm({ formData, onChange }: LayoutBrandingFormProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="p-4 rounded-xl bg-brand-green/5 border border-brand-green/10 flex items-start gap-3">
        <Globe size={18} className="text-brand-green mt-0.5" />
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-green">Global Layout & Branding Controls</p>
          <p className="text-[9px] text-brand-earth/60 leading-relaxed font-normal">
            Administrate the brand narrative, trust badges header, and primary footer configuration copy displayed across the public experience.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
          Trust Section Title
        </label>
        <input
          type="text"
          name="trust_title"
          value={formData.trust_title || ''}
          onChange={onChange}
          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
          placeholder="e.g. The Fastest Growing Pastil Brand."
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
          Trust Section Subtitle
        </label>
        <textarea
          rows={2}
          name="trust_subtitle"
          value={formData.trust_subtitle || ''}
          onChange={onChange}
          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all resize-none"
          placeholder="e.g. Join our mission to bring Mindanao's finest..."
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
          Footer Brand Description
        </label>
        <textarea
          rows={2}
          name="footer_desc"
          value={formData.footer_desc || ''}
          onChange={onChange}
          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all resize-none"
          placeholder="e.g. Bringing authentic Mindanao flavors..."
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
          Footer Copyright Line (HTML Entities Allowed)
        </label>
        <input
          type="text"
          name="footer_copyright"
          value={formData.footer_copyright || ''}
          onChange={onChange}
          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
          placeholder="e.g. &amp;copy; 2026 Pastil ni Liling..."
        />
      </div>
    </div>
  );
}
