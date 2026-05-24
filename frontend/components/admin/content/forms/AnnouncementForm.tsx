import React from 'react';

interface SiteSettings {
  announcement_enabled: boolean;
  announcement_text: string;
}

interface AnnouncementFormProps {
  formData: SiteSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AnnouncementForm({ formData, onChange, onCheckboxChange }: AnnouncementFormProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            name="announcement_enabled"
            checked={formData.announcement_enabled}
            onChange={onCheckboxChange}
            className="w-4 h-4 accent-brand-green rounded border-gray-200 cursor-pointer"
          />
          <span className="text-[10px] font-black uppercase tracking-widest">
            Enable Top Promo Banner
          </span>
        </label>
        <p className="text-[9px] text-brand-earth/50 leading-relaxed">
          Toggle on to display a prominent promotional message strip at the absolute top of the public landing page.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
          Banner Text Message
        </label>
        <textarea
          rows={2}
          name="announcement_text"
          value={formData.announcement_text || ''}
          onChange={onChange}
          disabled={!formData.announcement_enabled}
          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all leading-relaxed disabled:opacity-50"
          placeholder="e.g. Free delivery on orders over ₱500 this weekend!"
        />
      </div>
    </div>
  );
}
