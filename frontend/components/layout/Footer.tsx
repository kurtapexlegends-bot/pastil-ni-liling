'use client';

import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface SiteSettings {
  footer_desc?: string;
  footer_copyright?: string;
  footer_social_fb?: string;
  footer_social_ig?: string;
  footer_social_tw?: string;
  footer_contact_phone?: string;
  footer_contact_email?: string;
  footer_contact_address?: string;
}

const defaults: SiteSettings = {
  footer_desc: 'Bringing authentic Mindanao flavors to the mainstream. Quality you can trust, prices you can afford.',
  footer_copyright: '&copy; 2026 Pastil ni Liling. Swak sa Bulsa, Sarap na Babalik-balikan.',
  footer_social_fb: 'https://facebook.com',
  footer_social_ig: 'https://instagram.com',
  footer_social_tw: 'https://twitter.com',
  footer_contact_phone: '+63 917 123 4567',
  footer_contact_email: 'hello@pastilnililing.com',
  footer_contact_address: 'General Santos City, Philippines'
};

export default function Footer() {
  const { data: settingsRes } = useSWR("http://127.0.0.1:8000/api/website-settings", fetcher);
  const settings: SiteSettings = settingsRes?.success ? settingsRes.data : defaults;

  return (
    <footer className="bg-white border-t border-gray-200 shrink-0">
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-12 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="Logo" width={32} height={32} className="rounded-full grayscale-[0.2]" />
            <span className="text-sm font-bold uppercase tracking-tighter text-brand-earth">Pastil ni Liling</span>
          </div>
          <p className="text-xs text-brand-earth/50 leading-relaxed font-medium">
            {settings.footer_desc || defaults.footer_desc}
          </p>
          <div className="space-y-1.5 text-[10px] sm:text-xs text-brand-earth/50 pt-3 font-medium">
            {(settings.footer_contact_phone || defaults.footer_contact_phone) && (
              <p className="leading-none">T: {settings.footer_contact_phone || defaults.footer_contact_phone}</p>
            )}
            {(settings.footer_contact_email || defaults.footer_contact_email) && (
              <p className="leading-none">E: {settings.footer_contact_email || defaults.footer_contact_email}</p>
            )}
            {(settings.footer_contact_address || defaults.footer_contact_address) && (
              <p className="leading-none">A: {settings.footer_contact_address || defaults.footer_contact_address}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-earth">Platform</h4>
          <ul className="space-y-3 text-[10px] font-bold uppercase tracking-widest opacity-40 text-brand-earth">
            <li><Link href="/menu" className="hover:opacity-100 transition-opacity">Browse Menu</Link></li>
            <li><Link href="/franchise" className="hover:opacity-100 transition-opacity">Franchise Program</Link></li>
            <li><Link href="/about" className="hover:opacity-100 transition-opacity">Our Story</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-earth">Support</h4>
          <ul className="space-y-3 text-[10px] font-bold uppercase tracking-widest opacity-40 text-brand-earth">
            <li><Link href="/help" className="hover:opacity-100 transition-opacity">Help Center</Link></li>
            <li><Link href="/terms" className="hover:opacity-100 transition-opacity">Terms of Use</Link></li>
            <li><Link href="/privacy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link></li>
          </ul>
        </div>

        <div className="space-y-6 text-left md:text-right">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-earth">Connect</h4>
          <div className="flex justify-start md:justify-end gap-4 opacity-40">
            {(settings.footer_social_fb || defaults.footer_social_fb) && (
              <a href={settings.footer_social_fb || defaults.footer_social_fb} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-brand-earth flex items-center justify-center text-[8px] font-black hover:opacity-100 transition-opacity cursor-pointer">FB</a>
            )}
            {(settings.footer_social_ig || defaults.footer_social_ig) && (
              <a href={settings.footer_social_ig || defaults.footer_social_ig} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-brand-earth flex items-center justify-center text-[8px] font-black hover:opacity-100 transition-opacity cursor-pointer">IG</a>
            )}
            {(settings.footer_social_tw || defaults.footer_social_tw) && (
              <a href={settings.footer_social_tw || defaults.footer_social_tw} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-brand-earth flex items-center justify-center text-[8px] font-black hover:opacity-100 transition-opacity cursor-pointer">TW</a>
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 py-12 border-t border-gray-100 text-center">
        <p 
          className="text-[9px] font-bold uppercase tracking-widest opacity-30 text-brand-earth"
          dangerouslySetInnerHTML={{ __html: settings.footer_copyright || defaults.footer_copyright || "" }}
        />
      </div>
    </footer>
  );
}
