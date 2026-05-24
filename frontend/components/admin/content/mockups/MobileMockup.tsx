import React from 'react';
import Image from 'next/image';
import { Product } from '../../../../app/admin/types';

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

interface MobileMockupProps {
  formData: SiteSettings;
  products: Product[];
  activeSubTab: string;
}

export default function MobileMockup({ formData, products, activeSubTab }: MobileMockupProps) {
  return (
    <div className="relative w-[280px] h-[560px] bg-brand-earth rounded-[2.5rem] border-8 border-brand-earth shadow-2xl overflow-hidden flex flex-col ring-4 ring-white/30 transition-all duration-300 animate-in zoom-in-95 duration-200">
      {/* Dynamic Top Announcement Strip */}
      {formData.announcement_enabled && formData.announcement_text && (
        <div className="bg-brand-yellow text-brand-earth text-[7px] font-bold py-1.5 px-3 text-center truncate leading-none select-none">
          {formData.announcement_text}
        </div>
      )}

      {/* Virtual Browser Top */}
      <div className="bg-white/95 px-4 py-2 border-b border-gray-100 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-brand-green/10 flex items-center justify-center">
            <span className="text-[5px] font-black text-brand-green">HQ</span>
          </div>
          <span className="text-[6px] font-black uppercase tracking-tighter">Liling's Pastil</span>
        </div>
        <div className="flex gap-2">
          <span className="w-2.5 h-1 bg-brand-earth/10 rounded-full" />
          <span className="w-2.5 h-1 bg-brand-earth/10 rounded-full" />
        </div>
      </div>

      {/* Device Mockup Scrollable Web Page View */}
      <div className="flex-1 bg-[#fafafa] overflow-y-auto scrollbar-hide text-brand-earth text-left select-none relative animate-in fade-in duration-500">
        {activeSubTab === 'franchise' ? (
          /* FRANCHISE PORTAL MOBILE VIEW */
          <div className="space-y-0.5 animate-in fade-in duration-300">
            <div className="p-4 space-y-3 bg-white border-b border-gray-100">
              <div className="inline-flex items-center gap-1.5 py-0.5 px-2 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[5px] font-bold uppercase tracking-wider text-brand-yellow">
                <span className="w-1 h-1 rounded-full bg-brand-yellow animate-pulse"></span>
                {formData.franchise_badge || 'Business Opportunity'}
              </div>
              <h1 className="text-sm font-extrabold tracking-tight text-brand-earth leading-tight">
                {formData.franchise_title_white || 'Grow with'}<br/>
                <span className="text-brand-green">{formData.franchise_title_green || 'Pastil ni Liling.'}</span>
              </h1>
              <p className="text-[7.5px] text-brand-earth/50 leading-relaxed font-medium">
                {formData.franchise_subtitle || 'Be part of the Philippines fastest-growing pastil brand...'}
              </p>
            </div>

            <div className="p-4 bg-[#fafafa] space-y-3">
              {[
                { title: formData.franchise_benefit1_title || 'Low Capital', desc: formData.franchise_benefit1_desc || 'Minimal overhead setup.' },
                { title: formData.franchise_benefit2_title || 'Proven System', desc: formData.franchise_benefit2_desc || 'Operational training.' },
                { title: formData.franchise_benefit3_title || 'High Demand', desc: formData.franchise_benefit3_desc || 'Staple favorite.' },
                { title: formData.franchise_benefit4_title || 'Marketing Power', desc: formData.franchise_benefit4_desc || 'National support.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-2.5">
                  <div className="w-4.5 h-4.5 rounded bg-brand-green/10 flex items-center justify-center shrink-0 border border-brand-green/20">
                    <span className="text-[8px] font-bold text-brand-green">✓</span>
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[6px] font-black uppercase tracking-wider">{item.title}</h4>
                    <p className="text-[5.5px] text-brand-earth/40 leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mx-4 p-4 bg-brand-earth rounded-2xl text-white space-y-1">
              <p className="text-xs font-black tracking-tight leading-none">{formData.franchise_milestone_title || '50+ Branches'}</p>
              <p className="text-[5px] font-bold uppercase tracking-widest opacity-60 leading-none">{formData.franchise_milestone_desc || 'And growing rapidly nationwide.'}</p>
            </div>

            <div className="p-4 mt-2 bg-white border-t border-gray-50 space-y-2">
              <p className="text-[6px] font-black uppercase tracking-widest text-brand-green">Step 1 of 3: Personal Details</p>
              <div className="space-y-1">
                <div className="h-5 bg-gray-50 border border-gray-100 rounded-lg px-2 flex items-center">
                  <span className="text-[5px] font-bold text-brand-earth/30">First Name</span>
                </div>
                <div className="h-5 bg-gray-50 border border-gray-100 rounded-lg px-2 flex items-center">
                  <span className="text-[5px] font-bold text-brand-earth/30">Email Address</span>
                </div>
              </div>
              <div className="h-6 bg-brand-earth text-white rounded-full flex items-center justify-center text-[5.5px] font-black uppercase tracking-widest">
                Continue
              </div>
            </div>

            <div className="py-4 border-t border-gray-100 text-center bg-white">
              <p 
                className="text-[4.5px] font-bold uppercase tracking-widest text-brand-earth/30 leading-normal"
                dangerouslySetInnerHTML={{ __html: formData.franchise_footer_copyright || '&copy; 2026 Pastil ni Liling...' }}
              />
            </div>
          </div>
        ) : (
          /* LANDING HOME MOBILE VIEW */
          <>
            {/* HERO HERO SECTION */}
            <div className="px-4 pt-8 pb-10 space-y-4 border-b border-gray-100 bg-white select-none">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-green/5 border border-brand-green/10 text-[6px] font-bold uppercase tracking-wider text-brand-green">
                <span className="w-1 rounded-full bg-brand-green aspect-square"></span>
                {formData.hero_badge || 'Sarap na Babalik-balikan'}
              </div>
              
              <h1 className="text-xl font-extrabold tracking-tight leading-none">
                {formData.hero_title_white ? (
                  formData.hero_title_white.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)
                ) : (
                  <span>Mindanao's finest<br/>delivered to your<br/></span>
                )}
                <span className="text-brand-green">{formData.hero_title_green || 'doorstep.'}</span>
              </h1>

              <p className="text-[8px] text-brand-earth/50 leading-relaxed font-medium">
                {formData.hero_subtitle || 'Experience authentic flavors crafted with tradition...'}
              </p>

              <div className="flex gap-2 pt-2">
                <span className="bg-brand-green text-white px-4 py-2 rounded-full text-[6px] font-black uppercase tracking-wider text-center shadow-md">
                  {formData.hero_cta_text || 'Explore Catalog'}
                </span>
                <span className="bg-white border border-gray-200 text-brand-earth px-4 py-2 rounded-full text-[6px] font-black uppercase tracking-wider text-center">
                  Franchise
                </span>
              </div>
            </div>

            {/* SHOWCASE CAROUSEL CONTAINER */}
            <div className="p-4 bg-white border-b border-gray-50 select-none space-y-3">
              <p className="text-[7px] font-bold text-brand-green uppercase tracking-wider leading-none">Featured Catalog</p>
              
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide select-none">
                {!Array.isArray(formData.featured_products) || formData.featured_products.length === 0 ? (
                  <p className="text-[7px] font-semibold text-brand-earth/40 italic py-2">Catalog empty.</p>
                ) : (
                  formData.featured_products.map((id) => {
                    const prod = Array.isArray(products) ? products.find(p => p.id === id) : undefined;
                    if (!prod) return null;
                    return (
                      <div key={id} className="w-[85px] bg-gray-50 border border-gray-100 rounded-xl p-1.5 shrink-0 space-y-1 select-none">
                        <div className="aspect-[4/3] rounded-lg bg-gray-200 relative overflow-hidden">
                          <Image
                            src={prod.image_url || '/hero.png'}
                            alt={prod.name}
                            fill
                            className="object-cover opacity-80"
                          />
                        </div>
                        <p className="text-[6px] font-black truncate leading-tight mt-0.5">{prod.name}</p>
                        <p className="text-[6px] font-black text-brand-green leading-none">₱{prod.price}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* BRAND TRUST TITLE & SUBTITLE */}
            <div className="py-6 px-4 text-center space-y-2 select-none bg-[#fafafa] border-b border-gray-100">
              <h2 className="text-[9px] font-extrabold tracking-tight text-brand-earth">
                {formData.trust_title || 'The Fastest Growing Pastil Brand.'}
              </h2>
              <p className="text-[6.5px] text-brand-earth/50 max-w-[200px] mx-auto leading-relaxed font-medium">
                {formData.trust_subtitle || "Join our mission to bring Mindanao's finest to every Filipino table through our expanding franchise network."}
              </p>
            </div>

            {/* TRUST STATISTICS */}
            <div className="py-6 px-4 text-center space-y-4 select-none bg-[#fafafa]">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Active Branches", value: formData.stats_branches || "50+" },
                  { label: "Daily Orders", value: formData.stats_orders || "5,000+" },
                  { label: "Cities Reached", value: formData.stats_cities || "20+" },
                  { label: "Franchise Apps", value: formData.stats_applications || "200+" },
                ].map((stat, idx) => (
                  <div key={idx} className="space-y-0.5 select-none bg-white p-2.5 rounded-2xl border border-gray-100 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                    <div className="text-[9px] font-black tracking-tighter text-brand-earth">{stat.value}</div>
                    <div className="text-[4px] font-bold uppercase tracking-wider text-brand-earth/40 leading-none">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* MOBILE FOOTER SECTION */}
            <div className="bg-white p-4 space-y-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-brand-earth/10 flex items-center justify-center">
                  <span className="text-[4px] font-black text-brand-earth">PL</span>
                </div>
                <span className="text-[6px] font-black uppercase tracking-tighter">Pastil ni Liling</span>
              </div>
              <p className="text-[5.5px] text-brand-earth/50 leading-relaxed font-medium">
                {formData.footer_desc || 'Bringing authentic Mindanao flavors to the mainstream. Quality you can trust, prices you can afford.'}
              </p>
              
              <div className="pt-3 border-t border-gray-50 text-center">
                <p 
                  className="text-[4.5px] font-bold uppercase tracking-widest text-brand-earth/30 leading-normal"
                  dangerouslySetInnerHTML={{ __html: formData.footer_copyright || '&copy; 2026 Pastil ni Liling. Swak sa Bulsa...' }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
