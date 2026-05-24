import React from 'react';

interface SiteSettings {
  hero_badge: string;
  hero_title_white: string;
  hero_title_green: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_cta_link: string;
}

interface HeroFormProps {
  formData: SiteSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function HeroForm({ formData, onChange }: HeroFormProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
          Hero Tagline Badge
        </label>
        <input
          type="text"
          name="hero_badge"
          value={formData.hero_badge || ''}
          onChange={onChange}
          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
          placeholder="e.g. Sarap na Babalik-balikan"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
            Headline (White Text)
          </label>
          <textarea
            rows={2}
            name="hero_title_white"
            value={formData.hero_title_white || ''}
            onChange={onChange}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all resize-none"
            placeholder="e.g. Mindanao's finest delivered to your"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
            Headline (Highlighted Green)
          </label>
          <input
            type="text"
            name="hero_title_green"
            value={formData.hero_title_green || ''}
            onChange={onChange}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
            placeholder="e.g. doorstep."
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
          Subheadline/Description
        </label>
        <textarea
          rows={3}
          name="hero_subtitle"
          value={formData.hero_subtitle || ''}
          onChange={onChange}
          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all leading-relaxed"
          placeholder="Describe your brand offerings..."
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
            Call-to-Action Text
          </label>
          <input
            type="text"
            name="hero_cta_text"
            value={formData.hero_cta_text || ''}
            onChange={onChange}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
            placeholder="Explore Catalog"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
            Call-to-Action Link
          </label>
          <input
            type="text"
            name="hero_cta_link"
            value={formData.hero_cta_link || ''}
            onChange={onChange}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
            placeholder="/menu"
          />
        </div>
      </div>
    </div>
  );
}
