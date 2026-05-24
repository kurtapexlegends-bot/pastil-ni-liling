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

interface DesktopMockupProps {
  formData: SiteSettings;
  products: Product[];
  activeSubTab: string;
}

export default function DesktopMockup({ formData, products, activeSubTab }: DesktopMockupProps) {
  return (
    <div className="relative w-full max-w-[460px] h-[560px] bg-white rounded-3xl border border-gray-200/80 shadow-2xl overflow-hidden flex flex-col ring-4 ring-white/30 transition-all duration-300 animate-in zoom-in-95 duration-200">
      {/* Dynamic Top Announcement Strip */}
      {formData.announcement_enabled && formData.announcement_text && (
        <div className="bg-brand-yellow text-brand-earth text-[7px] font-bold py-1.5 px-3 text-center truncate leading-none select-none shrink-0">
          {formData.announcement_text}
        </div>
      )}

      {/* Virtual Browser Top */}
      <div className="bg-gray-100/90 px-4 py-2 border-b border-gray-200/50 flex items-center justify-between shrink-0 select-none">
        {/* Window control buttons */}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        {/* Address bar */}
        <div className="bg-white/80 border border-gray-200 rounded-md py-0.5 px-6 text-[6px] text-brand-earth/50 w-1/2 text-center select-none truncate">
          http://pastilnililing.ph
        </div>
        {/* Action buttons placeholder */}
        <div className="flex gap-2">
          <span className="w-2.5 h-1 bg-brand-earth/10 rounded-full" />
        </div>
      </div>

      {/* Device Mockup Scrollable Web Page View */}
      <div className="flex-1 bg-[#fafafa] overflow-y-auto scrollbar-hide text-brand-earth text-left select-none relative animate-in fade-in duration-500">
        {activeSubTab === 'franchise' ? (
          /* FRANCHISE PORTAL DESKTOP VIEW */
          <div className="space-y-0.5 animate-in fade-in duration-300">
            {/* NAVBAR */}
            <div className="bg-white/85 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
                  <span className="text-[5px] font-black text-brand-green">HQ</span>
                </div>
                <span className="text-[7px] font-black uppercase tracking-tighter">Liling's Pastil</span>
              </div>
              <div className="flex gap-3 text-[6px] font-bold uppercase tracking-wider text-brand-earth/50">
                <span>Menu</span>
                <span className="text-brand-green font-black">Franchise</span>
                <span>Store</span>
              </div>
            </div>

            <div className="p-5 grid grid-cols-12 gap-5 items-start bg-white border-b border-gray-100">
              <div className="col-span-6 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[5px] font-bold uppercase tracking-wider text-brand-yellow">
                  <span className="w-1 rounded-full bg-brand-yellow animate-pulse"></span>
                  {formData.franchise_badge || 'Business Opportunity'}
                </div>
                
                <h1 className="text-xs font-extrabold tracking-tight leading-tight">
                  {formData.franchise_title_white || 'Grow with'}<br/>
                  <span className="text-brand-green">{formData.franchise_title_green || 'Pastil ni Liling.'}</span>
                </h1>

                <p className="text-[7px] text-brand-earth/50 leading-relaxed font-medium">
                  {formData.franchise_subtitle || 'Be part of the Philippines fastest-growing pastil brand...'}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  {[
                    { title: formData.franchise_benefit1_title || 'Low Capital', desc: formData.franchise_benefit1_desc || 'Minimal overhead setup.' },
                    { title: formData.franchise_benefit2_title || 'Proven System', desc: formData.franchise_benefit2_desc || 'Operational training.' },
                    { title: formData.franchise_benefit3_title || 'High Demand', desc: formData.franchise_benefit3_desc || 'beloved staple favorite.' },
                    { title: formData.franchise_benefit4_title || 'Marketing Power', desc: formData.franchise_benefit4_desc || 'brand awareness.' },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-0.5 border-l border-brand-green/20 pl-1.5 animate-in fade-in duration-300">
                      <h4 className="text-[5.5px] font-black uppercase tracking-wider leading-none">{item.title}</h4>
                      <p className="text-[4.5px] text-brand-earth/40 leading-normal">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-6 bg-gray-50/50 rounded-xl border border-gray-100 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-[5px] font-bold text-brand-green uppercase tracking-widest">Step 1 of 3</span>
                  <span className="text-[4px] font-bold text-brand-earth/30 uppercase tracking-widest">Personal Details</span>
                </div>

                <div className="space-y-1">
                  <div className="h-5 bg-white border border-gray-100 rounded-md px-2 flex items-center">
                    <span className="text-[5px] font-bold text-brand-earth/30">First Name</span>
                  </div>
                  <div className="h-5 bg-white border border-gray-100 rounded-md px-2 flex items-center">
                    <span className="text-[5px] font-bold text-brand-earth/30">Last Name</span>
                  </div>
                </div>

                <button className="w-full bg-brand-earth text-white py-1.5 rounded-full text-[5.5px] font-black uppercase tracking-widest leading-none">
                  Continue
                </button>
              </div>
            </div>

            <div className="m-5 p-4 bg-brand-earth rounded-2xl text-white relative overflow-hidden">
              <p className="text-sm font-black tracking-tight mb-0.5 leading-none">{formData.franchise_milestone_title || '50+ Branches'}</p>
              <p className="text-[5px] font-bold uppercase tracking-widest opacity-60 leading-none">{formData.franchise_milestone_desc || 'And growing rapidly nationwide.'}</p>
            </div>

            <div className="py-6 border-t border-gray-100 text-center bg-[#fafafa]">
              <p 
                className="text-[5px] font-bold uppercase tracking-widest text-brand-earth/30 leading-normal"
                dangerouslySetInnerHTML={{ __html: formData.franchise_footer_copyright || '&copy; 2026 Pastil ni Liling...' }}
              />
            </div>
          </div>
        ) : (
          /* LANDING HOME DESKTOP VIEW */
          <>
            {/* NAVBAR */}
            <div className="bg-white/85 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
                  <span className="text-[5px] font-black text-brand-green">HQ</span>
                </div>
                <span className="text-[7px] font-black uppercase tracking-tighter">Liling's Pastil</span>
              </div>
              <div className="flex gap-3 text-[6px] font-bold uppercase tracking-wider text-brand-earth/50">
                <span>Menu</span>
                <span>Franchise</span>
                <span>Store</span>
              </div>
            </div>

            {/* HERO SECTION */}
            <div className="px-5 pt-8 pb-10 border-b border-gray-100 bg-white select-none">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-7 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-green/5 border border-brand-green/10 text-[5px] font-bold uppercase tracking-wider text-brand-green">
                    <span className="w-1 rounded-full bg-brand-green aspect-square"></span>
                    {formData.hero_badge || 'Sarap na Babalik-balikan'}
                  </div>
                  
                  <h1 className="text-xs font-extrabold tracking-tight leading-tight">
                    {formData.hero_title_white ? (
                      formData.hero_title_white.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)
                    ) : (
                      <span>Mindanao's finest<br/>delivered to your<br/></span>
                    )}
                    <span className="text-brand-green">{formData.hero_title_green || 'doorstep.'}</span>
                  </h1>

                  <p className="text-[7px] text-brand-earth/50 leading-relaxed font-medium">
                    {formData.hero_subtitle || 'Experience authentic flavors crafted with tradition...'}
                  </p>

                  <div className="flex gap-2 pt-1">
                    <span className="bg-brand-green text-white px-3 py-1.5 rounded-full text-[5px] font-black uppercase tracking-wider text-center shadow-md">
                      {formData.hero_cta_text || 'Explore Catalog'}
                    </span>
                    <span className="bg-white border border-gray-200 text-brand-earth px-3 py-1.5 rounded-full text-[5px] font-black uppercase tracking-wider text-center">
                      Franchise
                    </span>
                  </div>
                </div>
                
                {/* Floating Image mockup */}
                <div className="col-span-5 relative rounded-2xl overflow-hidden shadow-md aspect-square bg-gray-50 border border-gray-100">
                  <Image 
                    src="/hero.png" 
                    alt="Hero" 
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* SHOWCASE SECTION */}
            <div className="p-5 bg-white border-b border-gray-50 select-none space-y-3">
              <p className="text-[7px] font-bold text-brand-green uppercase tracking-wider leading-none">Featured Catalog</p>
              
              <div className="grid grid-cols-3 gap-2 pb-1 select-none">
                {!Array.isArray(formData.featured_products) || formData.featured_products.length === 0 ? (
                  <p className="text-[7px] font-semibold text-brand-earth/40 italic py-2 col-span-3">Catalog empty.</p>
                ) : (
                  formData.featured_products.map((id) => {
                    const prod = Array.isArray(products) ? products.find(p => p.id === id) : undefined;
                    if (!prod) return null;
                    return (
                      <div key={id} className="bg-gray-50 border border-gray-100 rounded-lg p-1 space-y-1 select-none">
                        <div className="aspect-[4/3] rounded-md bg-gray-200 relative overflow-hidden">
                          <Image
                            src={prod.image_url || '/hero.png'}
                            alt={prod.name}
                            fill
                            className="object-cover opacity-80"
                          />
                        </div>
                        <p className="text-[5px] font-black truncate leading-tight mt-0.5">{prod.name}</p>
                        <p className="text-[5px] font-black text-brand-green leading-none">₱{prod.price}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* TRUST SECTION */}
            <div className="py-8 px-5 text-center bg-[#fafafa] space-y-5 border-b border-gray-100 animate-in fade-in duration-500">
              <div className="space-y-1.5">
                <h2 className="text-[9px] font-extrabold tracking-tight text-brand-earth">
                  {formData.trust_title || 'The Fastest Growing Pastil Brand.'}
                </h2>
                <p className="text-[7px] text-brand-earth/50 max-w-xs mx-auto leading-relaxed font-medium">
                  {formData.trust_subtitle || "Join our mission to bring Mindanao's finest to every Filipino table through our expanding franchise network."}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                {[
                  { label: "Active Branches", value: formData.stats_branches || "50+" },
                  { label: "Daily Orders", value: formData.stats_orders || "5,000+" },
                  { label: "Cities Reached", value: formData.stats_cities || "20+" },
                  { label: "Franchise Apps", value: formData.stats_applications || "200+" },
                ].map((stat, idx) => (
                  <div key={idx} className="space-y-0.5 select-none bg-white p-2 rounded-xl border border-gray-100 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                    <div className="text-[9px] font-black tracking-tighter text-brand-earth">{stat.value}</div>
                    <div className="text-[4px] font-bold uppercase tracking-wider text-brand-earth/40 leading-none">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER */}
            <div className="bg-white px-5 py-6 space-y-4 text-[6px]">
              <div className="grid grid-cols-3 gap-4 items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-brand-earth/10 flex items-center justify-center shrink-0">
                      <span className="text-[4px] font-black text-brand-earth">PL</span>
                    </div>
                    <span className="text-[6px] font-black uppercase tracking-tighter">Pastil ni Liling</span>
                  </div>
                  <p className="text-[5px] text-brand-earth/50 leading-relaxed font-medium">
                    {formData.footer_desc || 'Bringing authentic Mindanao flavors to the mainstream. Quality you can trust, prices you can afford.'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-[5px] font-bold uppercase tracking-widest text-brand-earth/80">Platform</h4>
                  <ul className="space-y-1 text-brand-earth/40 font-semibold">
                    <li>Menu</li>
                    <li>Franchise</li>
                    <li>Store</li>
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-[5px] font-bold uppercase tracking-widest text-brand-earth/80">Support</h4>
                  <ul className="space-y-1 text-brand-earth/40 font-semibold">
                    <li>Help Center</li>
                    <li>Terms of Use</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 text-center">
                <p 
                  className="text-[5px] font-bold uppercase tracking-widest text-brand-earth/30 leading-normal"
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
