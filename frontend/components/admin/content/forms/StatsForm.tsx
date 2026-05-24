import React from 'react';
import { Globe } from '@phosphor-icons/react';

interface SiteSettings {
  stats_branches: string;
  stats_orders: string;
  stats_cities: string;
  stats_applications: string;
}

interface StatsFormProps {
  formData: SiteSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function StatsForm({ formData, onChange }: StatsFormProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="p-4 rounded-xl bg-brand-green/5 border border-brand-green/10 flex items-start gap-3">
        <Globe size={18} className="text-brand-green mt-0.5" />
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-green">Global Credibility Indicators</p>
          <p className="text-[9px] text-brand-earth/60 leading-relaxed font-normal">
            These values represent verified performance trust badges showcased on the landing page to build user authority and credibility.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
            Active Branches
          </label>
          <input
            type="text"
            name="stats_branches"
            value={formData.stats_branches || ''}
            onChange={onChange}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
            placeholder="e.g. 50+"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
            Daily Orders Delivered
          </label>
          <input
            type="text"
            name="stats_orders"
            value={formData.stats_orders || ''}
            onChange={onChange}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
            placeholder="e.g. 5,000+"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
            Cities Reached
          </label>
          <input
            type="text"
            name="stats_cities"
            value={formData.stats_cities || ''}
            onChange={onChange}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
            placeholder="e.g. 20+"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
            Franchise Inquiries
          </label>
          <input
            type="text"
            name="stats_applications"
            value={formData.stats_applications || ''}
            onChange={onChange}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
            placeholder="e.g. 200+"
          />
        </div>
      </div>
    </div>
  );
}
