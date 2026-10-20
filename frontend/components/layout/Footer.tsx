'use client';

import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import { 
  FacebookLogo, 
  Phone, 
  EnvelopeSimple, 
  MapPin, 
  ArrowUpRight 
} from '@phosphor-icons/react';

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
  footer_desc: 'Authentic Mindanao-style Chicken & Beef Pastil wrapped in fresh banana leaves. Swak sa bulsa, sarap na babalik-balikan!',
  footer_copyright: '&copy; 2026 Pastil ni Liling. Mura, Masarap, at Babalik-balikan.',
  footer_social_fb: 'https://www.facebook.com/PastilNiLiling',
  footer_contact_phone: '+63 966 142 3992 / 0927 572 3661',
  footer_contact_email: 'pastilnililing@gmail.com',
  footer_contact_address: 'Cubao (Arayat Market, QC) & Bagong Silang (Langit Road, Caloocan - 24/7)'
};

export default function Footer() {
  const { data: settingsRes } = useSWR("http://127.0.0.1:8000/api/website-settings", fetcher);
  const settings: SiteSettings = settingsRes?.success ? settingsRes.data : defaults;

  return (
    <footer className="bg-white border-t border-gray-200/60 shrink-0 text-brand-earth">
      <div className="max-w-6xl mx-auto px-6 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand & Tagline (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <Image 
                src="/logo.jpg" 
                alt="Pastil ni Liling Logo" 
                width={36} 
                height={36} 
                className="rounded-full shadow-sm group-hover:scale-105 transition-transform" 
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold uppercase tracking-tight text-brand-earth">
                  Pastil ni Liling
                </span>
                <span className="text-[9px] font-semibold text-brand-green uppercase tracking-wider">
                  Authentic Mindanao Heritage
                </span>
              </div>
            </Link>
            
            <p className="text-xs text-brand-earth/60 leading-relaxed font-normal max-w-sm">
              {settings.footer_desc || defaults.footer_desc}
            </p>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-brand-earth/70">
              <MapPin size={14} className="text-brand-green shrink-0" weight="bold" />
              <span className="text-xs font-medium">
                {settings.footer_contact_address || defaults.footer_contact_address}
              </span>
            </div>
          </div>

          {/* Quick Navigation (3 cols) */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-earth/50">
              Navigation
            </h4>
            <ul className="space-y-1.5 text-xs font-medium text-brand-earth/80">
              <li>
                <Link href="/menu" className="hover:text-brand-green transition-colors py-0.5 inline-block">
                  Retail Menu & Prices
                </Link>
              </li>
              <li>
                <Link href="/franchise" className="hover:text-brand-green transition-colors py-0.5 inline-block">
                  Franchise Opportunity
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-green transition-colors py-0.5 inline-block">
                  Our Story & Branches
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-brand-green transition-colors py-0.5 inline-block">
                  Partner / Cashier Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Hotlines & Social Channels (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-earth/50">
              Orders & Inquiries
            </h4>
            
            <div className="space-y-1.5 text-xs text-brand-earth/80">
              <a 
                href="tel:+639661423992" 
                className="flex items-center gap-2 hover:text-brand-green transition-colors py-0.5"
              >
                <Phone size={14} className="text-brand-green shrink-0" weight="bold" />
                <span className="font-semibold">+63 966 142 3992</span>
                <span className="text-[10px] text-brand-earth/40">(HQ Orders)</span>
              </a>

              <a 
                href={`mailto:${settings.footer_contact_email || defaults.footer_contact_email}`} 
                className="flex items-center gap-2 hover:text-brand-green transition-colors py-0.5"
              >
                <EnvelopeSimple size={14} className="text-brand-green shrink-0" weight="bold" />
                <span>{settings.footer_contact_email || defaults.footer_contact_email}</span>
              </a>
            </div>

            {/* Social & Delivery Channels */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={settings.footer_social_fb || defaults.footer_social_fb || "https://www.facebook.com/PastilNiLiling"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
              >
                <FacebookLogo size={14} weight="bold" />
                <span>Facebook Page</span>
                <ArrowUpRight size={10} weight="bold" />
              </a>

              <a
                href="https://www.foodpanda.ph/?query=pastil+ni+liling"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#D70F64]/10 text-[#D70F64] hover:bg-[#D70F64] hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
              >
                <span>Foodpanda</span>
                <ArrowUpRight size={10} weight="bold" />
              </a>

              <a
                href="https://food.grab.com/ph/en/restaurants?search=Pastil+ni+Liling"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#00B14F]/10 text-[#00B14F] hover:bg-[#00B14F] hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
              >
                <span>GrabFood</span>
                <ArrowUpRight size={10} weight="bold" />
              </a>
            </div>
          </div>
        </div>

        {/* Compact Bottom Bar */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p 
            className="text-[10px] font-medium text-brand-earth/40"
            dangerouslySetInnerHTML={{ __html: settings.footer_copyright || defaults.footer_copyright || "" }}
          />
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-green/80">
            Freshly wrapped in banana leaves daily
          </p>
        </div>
      </div>
    </footer>
  );
}
