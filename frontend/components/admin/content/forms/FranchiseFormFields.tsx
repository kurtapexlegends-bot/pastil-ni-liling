import React from 'react';
import { Briefcase } from '@phosphor-icons/react';

interface SiteSettings {
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

interface FranchiseFormFieldsProps {
  formData: SiteSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function FranchiseFormFields({ formData, onChange }: FranchiseFormFieldsProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="p-4 rounded-xl bg-brand-yellow/5 border border-brand-yellow/10 flex items-start gap-3">
        <Briefcase size={18} className="text-brand-yellow mt-0.5" />
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-yellow">Franchise Program Controls</p>
          <p className="text-[9px] text-brand-earth/60 leading-relaxed font-normal">
            Administrate the taglines, headings, marketing highlights, and milestone counters displayed on the public Franchise Application portal.
          </p>
        </div>
      </div>

      {/* Sub-section: Hero Block */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-brand-green border-b border-gray-50 pb-2">1. Hero Section</h3>
        
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">Tagline Badge</label>
          <input
            type="text"
            name="franchise_badge"
            value={formData.franchise_badge || ''}
            onChange={onChange}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
            placeholder="e.g. Business Opportunity"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">Heading Title (White Text)</label>
            <input
              type="text"
              name="franchise_title_white"
              value={formData.franchise_title_white || ''}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
              placeholder="e.g. Grow with"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">Heading Title (Green Text)</label>
            <input
              type="text"
              name="franchise_title_green"
              value={formData.franchise_title_green || ''}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
              placeholder="e.g. Pastil ni Liling."
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">Hero Subtitle</label>
          <textarea
            rows={3}
            name="franchise_subtitle"
            value={formData.franchise_subtitle || ''}
            onChange={onChange}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all leading-relaxed"
            placeholder="Describe your franchise offering..."
          />
        </div>
      </div>

      {/* Sub-section: Benefits Grid */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-brand-green border-b border-gray-50 pb-2">2. Dynamic Benefit Highlights</h3>
        
        {/* Benefit 1 */}
        <div className="grid md:grid-cols-3 gap-4 items-start">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/60">Highlight 1 Title</label>
            <input
              type="text"
              name="franchise_benefit1_title"
              value={formData.franchise_benefit1_title || ''}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
              placeholder="e.g. Low Capital"
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/60">Highlight 1 Description</label>
            <input
              type="text"
              name="franchise_benefit1_desc"
              value={formData.franchise_benefit1_desc || ''}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
              placeholder="Low Capital Description..."
            />
          </div>
        </div>

        {/* Benefit 2 */}
        <div className="grid md:grid-cols-3 gap-4 items-start">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/60">Highlight 2 Title</label>
            <input
              type="text"
              name="franchise_benefit2_title"
              value={formData.franchise_benefit2_title || ''}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
              placeholder="e.g. Proven System"
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/60">Highlight 2 Description</label>
            <input
              type="text"
              name="franchise_benefit2_desc"
              value={formData.franchise_benefit2_desc || ''}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
              placeholder="Proven System Description..."
            />
          </div>
        </div>

        {/* Benefit 3 */}
        <div className="grid md:grid-cols-3 gap-4 items-start">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/60">Highlight 3 Title</label>
            <input
              type="text"
              name="franchise_benefit3_title"
              value={formData.franchise_benefit3_title || ''}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
              placeholder="e.g. High Demand"
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/60">Highlight 3 Description</label>
            <input
              type="text"
              name="franchise_benefit3_desc"
              value={formData.franchise_benefit3_desc || ''}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
              placeholder="High Demand Description..."
            />
          </div>
        </div>

        {/* Benefit 4 */}
        <div className="grid md:grid-cols-3 gap-4 items-start">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/60">Highlight 4 Title</label>
            <input
              type="text"
              name="franchise_benefit4_title"
              value={formData.franchise_benefit4_title || ''}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
              placeholder="e.g. Marketing Power"
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/60">Highlight 4 Description</label>
            <input
              type="text"
              name="franchise_benefit4_desc"
              value={formData.franchise_benefit4_desc || ''}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
              placeholder="Marketing Power Description..."
            />
          </div>
        </div>
      </div>

      {/* Sub-section: Milestones & Copyright */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-brand-green border-b border-gray-50 pb-2">3. Milestones & Footer</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">Milestone Counter Title</label>
            <input
              type="text"
              name="franchise_milestone_title"
              value={formData.franchise_milestone_title || ''}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
              placeholder="e.g. 50+ Branches"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">Milestone Subtitle Description</label>
            <input
              type="text"
              name="franchise_milestone_desc"
              value={formData.franchise_milestone_desc || ''}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
              placeholder="e.g. And growing rapidly nationwide."
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">Portal Copyright line</label>
          <input
            type="text"
            name="franchise_footer_copyright"
            value={formData.franchise_footer_copyright || ''}
            onChange={onChange}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
            placeholder="e.g. &amp;copy; 2026 Pastil ni Liling Franchise Program..."
          />
        </div>
      </div>
    </div>
  );
}
