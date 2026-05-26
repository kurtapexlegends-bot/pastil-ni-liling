import React from 'react';
import Image from 'next/image';
import { SiteSettings, Product } from '../types';

interface MobileLandingPreviewProps {
  formData: SiteSettings;
  products: Product[];
}

export default function MobileLandingPreview({ formData, products }: MobileLandingPreviewProps) {
  return (
    <>
      {/* HERO HERO SECTION */}
      <div className="px-4 pt-3 pb-10 space-y-4 border-b border-gray-100 bg-white select-none">
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
            <div className="space-y-0.5 text-[4px] text-brand-earth/40 pt-1 font-medium">
              {formData.footer_contact_phone && <p className="leading-none">T: {formData.footer_contact_phone}</p>}
              {formData.footer_contact_email && <p className="leading-none">E: {formData.footer_contact_email}</p>}
              {formData.footer_contact_address && <p className="leading-none">A: {formData.footer_contact_address}</p>}
            </div>
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
            <div className="flex gap-1.5 opacity-40">
              {formData.footer_social_fb && (
                <div className="w-4.5 h-4.5 rounded-full border border-brand-earth flex items-center justify-center text-[4px] font-black cursor-pointer">FB</div>
              )}
              {formData.footer_social_ig && (
                <div className="w-4.5 h-4.5 rounded-full border border-brand-earth flex items-center justify-center text-[4px] font-black cursor-pointer">IG</div>
              )}
              {formData.footer_social_tw && (
                <div className="w-4.5 h-4.5 rounded-full border border-brand-earth flex items-center justify-center text-[4px] font-black cursor-pointer">TW</div>
              )}
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
  );
}
