import React from 'react';
import { Globe } from '@phosphor-icons/react';

interface SiteSettings {
  trust_title?: string;
  trust_subtitle?: string;
  footer_desc?: string;
  footer_copyright?: string;
  footer_social_fb?: string;
  footer_social_ig?: string;
  footer_social_tw?: string;
  footer_contact_phone?: string;
  footer_contact_email?: string;
  footer_contact_address?: string;
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

      {/* Contact Information Group */}
      <div className="pt-4 border-t border-gray-100/80 space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-green">
          Contact Information
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
              Contact Phone Number
            </label>
            <input
              type="text"
              name="footer_contact_phone"
              value={formData.footer_contact_phone || ''}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
              placeholder="+63 917 123 4567"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
              Contact Email Address
            </label>
            <input
              type="email"
              name="footer_contact_email"
              value={formData.footer_contact_email || ''}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
              placeholder="hello@pastilnililing.com"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
              Physical Office/Store Address
            </label>
            <input
              type="text"
              name="footer_contact_address"
              value={formData.footer_contact_address || ''}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
              placeholder="General Santos City, Philippines"
            />
          </div>
        </div>
      </div>

      {/* Social Media Group */}
      <div className="pt-4 border-t border-gray-100/80 space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-green">
          Social Media Links
        </h4>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
              Facebook URL
            </label>
            <input
              type="text"
              name="footer_social_fb"
              value={formData.footer_social_fb || ''}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
              placeholder="https://facebook.com/pastilnililing"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
              Instagram URL
            </label>
            <input
              type="text"
              name="footer_social_ig"
              value={formData.footer_social_ig || ''}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
              placeholder="https://instagram.com/pastilnililing"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
              Twitter / X URL
            </label>
            <input
              type="text"
              name="footer_social_tw"
              value={formData.footer_social_tw || ''}
              onChange={onChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
              placeholder="https://twitter.com/pastilnililing"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
