import React from 'react';
import Image from 'next/image';
import { SiteSettings, Product } from '../types';

interface DesktopLandingPreviewProps {
  formData: SiteSettings;
  products: Product[];
}

export default function DesktopLandingPreview({ formData, products }: DesktopLandingPreviewProps) {
  return (
    <>
      {/* NAVBAR */}
      <div className="bg-white px-4 py-2 border-b border-gray-100 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-1.5">
          <div className="w-4.5 h-4.5 rounded-full overflow-hidden relative border border-gray-100 shrink-0">
            <Image src="/logo.jpg" alt="Logo" fill className="object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-[6.5px] font-bold uppercase tracking-tight text-brand-earth leading-none">Pastil ni Liling</span>
            <span className="text-[4px] font-bold uppercase tracking-wider text-brand-green leading-none mt-0.5">Authentic Mindanao</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-3 text-[5px] font-bold uppercase tracking-wider text-brand-earth/60">
            <span>Retail Menu</span>
            <span>Franchise</span>
            <span>Our Story</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[4.5px] font-bold uppercase text-brand-earth/70">Sign In</span>
            <span className="bg-brand-earth text-white px-2 py-1 rounded-full text-[4.5px] font-bold uppercase tracking-wider">Order Online</span>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="px-5 pt-3 pb-10 border-b border-gray-100 bg-white select-none">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-7 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-green/5 border border-brand-green/10 text-[5px] font-bold uppercase tracking-widest text-brand-green">
              <span className="w-1 rounded-full bg-brand-green aspect-square"></span>
              {formData.hero_badge || 'Sarap na Babalik-balikan'}
            </div>
            
            <h1 className="text-[15px] font-extrabold tracking-tight leading-[1.1] text-brand-earth max-w-[150px]">
              {formData.hero_title_white ? (
                formData.hero_title_white.split('\n').map((line: string, i: number) => <span key={i}>{line}<br/></span>)
              ) : (
                <span>Mindanao's finest<br/>delivered to your<br/></span>
              )}
              <span className="text-brand-green">{formData.hero_title_green || 'doorstep.'}</span>
            </h1>

            <p className="text-[7px] text-brand-earth/60 leading-relaxed font-medium max-w-[172px]">
              {formData.hero_subtitle || 'Experience authentic flavors crafted with tradition...'}
            </p>

            <div className="flex gap-2 pt-1">
              <span className="bg-brand-green text-white px-3 py-1.5 rounded-full text-[5px] font-bold uppercase tracking-widest text-center shadow-md">
                {formData.hero_cta_text || 'Explore Catalog'}
              </span>
              <span className="bg-white border border-gray-200 text-brand-earth px-3 py-1.5 rounded-full text-[5px] font-bold uppercase tracking-widest text-center">
                Franchise Inquiry
              </span>
            </div>

            {/* Trusted Avatars */}
            <div className="flex items-center gap-3 pt-2 select-none">
              <div className="flex -space-x-1.5 shrink-0">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-4.5 h-4.5 rounded-full border border-white shadow-sm overflow-hidden bg-gray-200 relative">
                    <Image src={`https://i.pravatar.cc/100?u=${i+20}`} alt="User" fill className="object-cover grayscale-[0.3]" />
                  </div>
                ))}
              </div>
              <p className="text-[5px] font-bold text-brand-earth/40 uppercase tracking-widest leading-tight">
                Trusted by <span className="text-brand-earth">10,000+</span> <br />satisfied customers
              </p>
            </div>
          </div>
          
          {/* Floating Image mockup */}
          <div className="col-span-5 relative">
            <div className="relative rounded-[2rem] overflow-hidden shadow-[0_16px_32px_-8px_rgba(45,74,34,0.15)] border-2 border-white bg-gray-50 aspect-square">
              <Image 
                src="/hero.png" 
                alt="Hero" 
                fill
                className="object-cover"
              />
            </div>
            {/* Subtle Floating Info */}
            <div className="absolute -bottom-3 -right-3 bg-white p-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2 select-none z-10 scale-75 origin-bottom-right">
              <div className="bg-brand-green/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 22h20" />
                  <path d="M20 15a8 8 0 0 0-16 0" />
                  <path d="M12 2v3M9 3v2M15 3v2" />
                </svg>
              </div>
              <div className="leading-tight text-left">
                <p className="text-[5px] font-black uppercase tracking-widest text-brand-earth/40 leading-none">Freshly Made</p>
                <p className="text-[6.5px] font-bold text-brand-earth mt-0.5 leading-none">Daily Batch Pastil</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SHOWCASE SECTION */}
      <div className="p-5 bg-white border-b border-gray-50 select-none space-y-3">
        <p className="text-[7px] font-bold text-brand-green uppercase tracking-wider leading-none">Featured Catalog</p>
        
        <div className="grid grid-cols-3 gap-3 pb-1 select-none">
          {!Array.isArray(formData.featured_products) || formData.featured_products.length === 0 ? (
            <p className="text-[7px] font-semibold text-brand-earth/40 italic py-2 col-span-3">Catalog empty.</p>
          ) : (
            (() => {
              const featuredProducts = Array.isArray(products)
                ? products.filter(p => p.id !== null && p.id !== undefined && Array.isArray(formData.featured_products) && formData.featured_products.includes(p.id))
                : [];
              return featuredProducts.map((prod) => (
                <div key={prod.id} className="space-y-1.5 select-none animate-in slide-in-from-bottom fade-in duration-500">
                  <div className="aspect-[4/3] rounded-lg bg-gray-50 overflow-hidden relative border border-gray-100 shadow-sm">
                     <Image 
                      src={prod.image_url || '/hero.png'} 
                      alt={prod.name} 
                      fill 
                      className="object-cover opacity-80" 
                    />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[4.5px] font-bold uppercase tracking-[0.1em] text-brand-green">
                      {prod.category === 'pastil' ? 'The Signature' : (prod.category === 'bagoong' ? 'Bottled Premium' : 'Side Kick')}
                    </div>
                    <h3 className="text-[6.5px] font-black tracking-tight leading-tight truncate">{prod.name}</h3>
                    <p className="text-[5px] text-brand-earth/50 leading-normal line-clamp-2">{prod.description}</p>
                    <div className="text-[5.5px] font-bold mt-0.5">₱{prod.price}</div>
                  </div>
                </div>
              ));
            })()
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
            <div key={idx} className="space-y-0.5 select-none animate-in slide-in-from-bottom-2 duration-300">
              <div className="text-[10px] font-black tracking-tighter text-brand-earth">{stat.value}</div>
              <div className="text-[4px] font-bold uppercase tracking-widest text-brand-earth/40 leading-none">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="bg-white border-t border-gray-100 px-5 py-8 space-y-6 text-[5px]">
        <div className="grid grid-cols-4 gap-4 items-start">
          <div className="col-span-1 space-y-2">
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

          <div className="space-y-1.5">
            <h4 className="text-[5px] font-bold uppercase tracking-widest">Platform</h4>
            <ul className="space-y-1 text-[5px] font-bold uppercase tracking-widest opacity-40">
              <li>Browse Menu</li>
              <li>Franchise Program</li>
              <li>Find a Store</li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-[5px] font-bold uppercase tracking-widest">Support</h4>
            <ul className="space-y-1 text-[5px] font-bold uppercase tracking-widest opacity-40">
              <li>Help Center</li>
              <li>Terms of Use</li>
              <li>Privacy Policy</li>
            </ul>
          </div>

          <div className="space-y-1.5 text-right">
            <h4 className="text-[5px] font-bold uppercase tracking-widest">Connect</h4>
            <div className="flex justify-end gap-1 opacity-40">
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

        <div className="pt-4 border-t border-gray-100 text-center">
          <p 
            className="text-[4.5px] font-bold uppercase tracking-widest opacity-30 leading-normal"
            dangerouslySetInnerHTML={{ __html: formData.footer_copyright || '&copy; 2026 Pastil ni Liling. Swak sa Bulsa...' }}
          />
        </div>
      </div>
    </>
  );
}
