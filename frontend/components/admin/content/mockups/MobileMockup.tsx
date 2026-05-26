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

const getBgStyle = (bgColor: string) => {
  switch (bgColor) {
    case 'bg-brand-yellow': return { backgroundColor: 'var(--brand-yellow)' };
    case 'bg-brand-green': return { backgroundColor: 'var(--brand-green)' };
    case 'bg-brand-earth': return { backgroundColor: 'var(--brand-earth)' };
    case 'bg-brand-red': return { backgroundColor: 'var(--brand-red)' };
    case 'bg-brand-gray': return { backgroundColor: 'var(--brand-gray)' };
    default: return { backgroundColor: 'var(--brand-yellow)' };
  }
};

const getTextStyle = (textColor: string) => {
  switch (textColor) {
    case 'text-brand-earth': return { color: 'var(--brand-earth)' };
    case 'text-white': return { color: '#ffffff' };
    case 'text-brand-yellow': return { color: 'var(--brand-yellow)' };
    default: return { color: 'var(--brand-earth)' };
  }
};

export default function MobileMockup({ formData, products, activeSubTab }: MobileMockupProps) {
  // Parse existing settings or fallback
  const announcement = typeof formData.announcement_text === 'object' && formData.announcement_text !== null
    ? formData.announcement_text
    : (() => {
        try {
          if (typeof formData.announcement_text === 'string' && formData.announcement_text.startsWith('{')) {
            const parsed = JSON.parse(formData.announcement_text);
            return {
              text: parsed.text || '',
              bg_color: parsed.bg_color || 'bg-brand-yellow',
              text_color: parsed.text_color || 'text-brand-earth',
              animate: parsed.animate || 'none',
              icon: parsed.icon || 'megaphone'
            };
          }
        } catch (e) {}
        return {
          text: typeof formData.announcement_text === 'string' ? formData.announcement_text : '',
          bg_color: 'bg-brand-yellow',
          text_color: 'text-brand-earth',
          animate: 'none',
          icon: 'megaphone'
        };
      })();

  const iconEmoji = announcement.icon === 'megaphone' ? '📢' 
    : announcement.icon === 'sparkle' ? '✨'
    : announcement.icon === 'gift' ? '🎁'
    : announcement.icon === 'warning' ? '🔥'
    : '📢';

  return (
    <div className="relative w-[280px] h-[560px] bg-brand-earth rounded-[2.5rem] border-8 border-brand-earth shadow-2xl overflow-hidden flex flex-col ring-4 ring-white/30 transition-all duration-300 animate-in zoom-in-95 duration-200">
      {/* Dynamic Floating Pill Alert Overlay */}
      {formData.announcement_enabled && announcement.text && (
        <div 
          style={{ 
            ...getBgStyle(announcement.bg_color), 
            ...getTextStyle(announcement.text_color) 
          }}
          className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-2.5 py-1 rounded-full shadow-md border border-black/5 flex items-center justify-between gap-1 max-w-[85%] select-none scale-[0.8] origin-top shrink-0"
        >
          <span className="text-[7px] shrink-0">{iconEmoji}</span>
          <span className={`text-[5.5px] font-black tracking-wide leading-none truncate max-w-[90px] ${
            announcement.animate === 'bounce' ? 'animate-bounce inline-block' : 
            announcement.animate === 'pulse' ? 'animate-pulse' : ''
          }`}>
            {announcement.text}
          </span>
        </div>
      )}

      {/* NAVBAR */}
      <div className="bg-white px-3 py-2 border-b border-gray-100 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-1">
          <div className="w-4.5 h-4.5 rounded-full overflow-hidden relative border border-gray-100 shrink-0">
            <Image src="/logo.jpg" alt="Logo" fill className="object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-[5.5px] font-bold uppercase tracking-tight text-brand-earth leading-none">Pastil ni Liling</span>
            <span className="text-[3.5px] font-bold uppercase tracking-wider text-brand-green leading-none mt-0.5">Authentic Mindanao</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-brand-earth text-white px-1.5 py-0.5 rounded-full text-[4.5px] font-bold uppercase tracking-wider scale-95 shrink-0">Order Online</span>
          <div className="w-3.5 h-3.5 flex flex-col gap-0.5 justify-center items-center shrink-0">
            <span className="w-2.5 h-0.5 bg-brand-earth rounded-full" />
            <span className="w-2.5 h-0.5 bg-brand-earth rounded-full" />
            <span className="w-2.5 h-0.5 bg-brand-earth rounded-full" />
          </div>
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
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-green/5 border border-brand-green/10 text-[6px] font-bold uppercase tracking-widest text-brand-green">
                <span className="w-1 rounded-full bg-brand-green aspect-square"></span>
                {formData.hero_badge || 'Sarap na Babalik-balikan'}
              </div>
              
              <h1 className="text-[21px] font-extrabold tracking-tight leading-[1.1] text-brand-earth">
                {formData.hero_title_white ? (
                  formData.hero_title_white.split('\n').map((line: string, i: number) => <span key={i}>{line}<br/></span>)
                ) : (
                  <span>Mindanao's finest<br/>delivered to your<br/></span>
                )}
                <span className="text-brand-green">{formData.hero_title_green || 'doorstep.'}</span>
              </h1>

              <p className="text-[8px] text-brand-earth/60 leading-relaxed font-medium max-w-[210px]">
                {formData.hero_subtitle || 'Experience authentic flavors crafted with tradition...'}
              </p>

              <div className="flex flex-col gap-2 pt-2 w-full select-none">
                <span className="bg-brand-green text-white px-4 py-2.5 rounded-full text-[6.5px] font-bold uppercase tracking-widest text-center shadow-md cursor-pointer">
                  {formData.hero_cta_text || 'Explore Catalog'}
                </span>
                <span className="bg-white border border-gray-200 text-brand-earth px-4 py-2.5 rounded-full text-[6.5px] font-bold uppercase tracking-widest text-center cursor-pointer">
                  Franchise Inquiry
                </span>
              </div>

              {/* Trusted Avatars */}
              <div className="flex items-center gap-3 pt-2 select-none">
                <div className="flex -space-x-1.5 shrink-0">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-5 h-5 rounded-full border border-white shadow-sm overflow-hidden bg-gray-200 relative">
                      <Image src={`https://i.pravatar.cc/100?u=${i+20}`} alt="User" fill className="object-cover grayscale-[0.3]" />
                    </div>
                  ))}
                </div>
                <p className="text-[5.5px] font-bold text-brand-earth/40 uppercase tracking-widest leading-tight">
                  Trusted by <span className="text-brand-earth">10,000+</span> <br />satisfied customers
                </p>
              </div>

              {/* Floating Image mockup */}
              <div className="relative w-full mt-4 select-none">
                <div className="relative rounded-[2rem] overflow-hidden shadow-[0_16px_32px_-8px_rgba(45,74,34,0.15)] border-2 border-white bg-gray-50 aspect-square w-full">
                  <Image 
                    src="/hero.png" 
                    alt="Hero" 
                    fill
                    className="object-cover animate-in zoom-in-95 duration-500"
                  />
                </div>
                {/* Subtle Floating Info */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white w-[85%] p-2 rounded-xl shadow-lg border border-gray-100 flex items-center justify-center gap-2 select-none z-10 scale-90">
                  <div className="bg-brand-green/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 22h20" />
                      <path d="M20 15a8 8 0 0 0-16 0" />
                      <path d="M12 2v3M9 3v2M15 3v2" />
                    </svg>
                  </div>
                  <div className="leading-tight text-left">
                    <p className="text-[5.5px] font-black uppercase tracking-widest text-brand-earth/40 leading-none">Freshly Made</p>
                    <p className="text-[7px] font-bold text-brand-earth mt-0.5 leading-none">Daily Batch Pastil</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SHOWCASE CAROUSEL CONTAINER */}
            <div className="p-4 bg-white border-b border-gray-50 select-none space-y-3">
              <p className="text-[7px] font-bold text-brand-green uppercase tracking-wider leading-none">Featured Catalog</p>
              
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide select-none">
                {!Array.isArray(formData.featured_products) || formData.featured_products.length === 0 ? (
                  <p className="text-[7px] font-semibold text-brand-earth/40 italic py-2">Catalog empty.</p>
                ) : (
                  (() => {
                    const featuredProducts = Array.isArray(products)
                      ? products.filter(p => p.id !== null && p.id !== undefined && Array.isArray(formData.featured_products) && formData.featured_products.includes(p.id))
                      : [];
                    return featuredProducts.map((prod) => (
                      <div key={prod.id} className="w-[85px] shrink-0 space-y-1.5 select-none animate-in slide-in-from-bottom fade-in duration-500">
                        <div className="aspect-[4/3] rounded-lg bg-gray-50 overflow-hidden relative border border-gray-100 shadow-sm">
                           <Image 
                            src={prod.image_url || '/hero.png'} 
                            alt={prod.name} 
                            fill 
                            className="object-cover opacity-80" 
                          />
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-[4px] font-bold uppercase tracking-[0.1em] text-brand-green">
                            {prod.category === 'pastil' ? 'The Signature' : (prod.category === 'bagoong' ? 'Bottled Premium' : 'Side Kick')}
                          </div>
                          <h3 className="text-[6px] font-black tracking-tight leading-tight truncate">{prod.name}</h3>
                          <p className="text-[4.5px] text-brand-earth/50 leading-normal line-clamp-2">{prod.description}</p>
                          <div className="text-[5px] font-bold mt-0.5">₱{prod.price}</div>
                        </div>
                      </div>
                    ));
                  })()
                )}
              </div>
            </div>

            {/* TRUST SECTION */}
            <div className="py-8 px-4 text-center bg-[#fafafa] space-y-5 border-b border-gray-100 animate-in fade-in duration-500">
              <div className="space-y-1.5">
                <h2 className="text-[9px] font-extrabold tracking-tight text-brand-earth">
                  {formData.trust_title || 'The Fastest Growing Pastil Brand.'}
                </h2>
                <p className="text-[6.5px] text-brand-earth/50 max-w-[200px] mx-auto leading-relaxed font-medium">
                  {formData.trust_subtitle || "Join our mission to bring Mindanao's finest to every Filipino table through our expanding franchise network."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-1">
                {[
                  { label: "Active Branches", value: formData.stats_branches || "50+" },
                  { label: "Daily Orders", value: formData.stats_orders || "5,000+" },
                  { label: "Cities Reached", value: formData.stats_cities || "20+" },
                  { label: "Franchise Apps", value: formData.stats_applications || "200+" },
                ].map((stat, idx) => (
                  <div key={idx} className="space-y-0.5 select-none animate-in slide-in-from-bottom-2 duration-300">
                    <div className="text-[10px] font-black tracking-tighter text-brand-earth">{stat.value}</div>
                    <div className="text-[4px] font-bold uppercase tracking-widest text-brand-earth/40 leading-none">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* MOBILE FOOTER SECTION */}
            <div className="bg-white p-4 space-y-4 border-t border-gray-100 text-[5px]">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full overflow-hidden relative border border-gray-100 shrink-0">
                      <Image src="/logo.jpg" alt="Logo" fill className="object-cover" />
                    </div>
                    <span className="text-[6px] font-bold uppercase tracking-tighter">Pastil ni Liling</span>
                  </div>
                  <p className="text-[5px] text-brand-earth/50 leading-relaxed font-medium">
                    {formData.footer_desc || 'Bringing authentic Mindanao flavors to the mainstream. Quality you can trust, prices you can afford.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <h4 className="text-[5px] font-bold uppercase tracking-widest">Platform</h4>
                    <ul className="space-y-1 text-[4.5px] font-bold uppercase tracking-widest opacity-40">
                      <li>Browse Menu</li>
                      <li>Franchise Program</li>
                      <li>Find a Store</li>
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-[5px] font-bold uppercase tracking-widest">Support</h4>
                    <ul className="space-y-1 text-[4.5px] font-bold uppercase tracking-widest opacity-40">
                      <li>Help Center</li>
                      <li>Terms of Use</li>
                      <li>Privacy Policy</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-[5px] font-bold uppercase tracking-widest">Connect</h4>
                  <div className="flex gap-2 opacity-40">
                    {['FB', 'IG', 'TW'].map(s => (
                      <div key={s} className="w-4.5 h-4.5 rounded-full border border-brand-earth flex items-center justify-center text-[4px] font-black cursor-pointer">{s}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 text-center">
                <p 
                  className="text-[4.5px] font-bold uppercase tracking-widest opacity-30 leading-normal"
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
