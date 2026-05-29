"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import useSWR from "swr";
import Navbar from "@/components/layout/Navbar";
import CountdownTimer from "@/components/ui/CountdownTimer";
import Footer from "@/components/layout/Footer";

interface SiteSettings {
  hero_badge: string;
  hero_title_white: string;
  hero_title_green: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_cta_link: string;
  stats_branches: string;
  stats_orders: string;
  stats_cities: string;
  stats_applications: string;
  announcement_enabled: boolean;
  announcement_text: string;
  featured_products: number[];
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const getBgStyle = (bgColor: string) => {
  switch (bgColor) {
    case 'bg-brand-yellow': 
    case 'bg-yellow-500':
      return { backgroundColor: '#d1a340' };
    case 'bg-brand-green': 
    case 'bg-green-700':
      return { backgroundColor: '#7ca33a' };
    case 'bg-brand-earth': 
      return { backgroundColor: '#1b2d16' };
    case 'bg-brand-red': 
    case 'bg-red-700':
      return { backgroundColor: '#a82e1a' };
    case 'bg-brand-gray': 
    case 'bg-zinc-100':
      return { backgroundColor: '#efebe4' };
    default: 
      return { backgroundColor: '#d1a340' };
  }
};

const getTextStyle = (textColor: string) => {
  switch (textColor) {
    case 'text-brand-earth': 
      return { color: '#1b2d16' };
    case 'text-white': 
      return { color: '#ffffff' };
    case 'text-brand-yellow': 
      return { color: '#d1a340' };
    default: 
      return { color: '#1b2d16' };
  }
};

export default function Home() {
  const [isAlertClosed, setIsAlertClosed] = useState(false);
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const { data: settingsRes } = useSWR("http://127.0.0.1:8000/api/website-settings", fetcher);
  const { data: productsRes } = useSWR("http://127.0.0.1:8000/api/products", fetcher);

  // Defaults for absolute safety and local fallback integrity
  const defaults: SiteSettings = {
    hero_badge: 'Sarap na Babalik-balikan',
    hero_title_white: "Mindanao's finest\ndelivered to your",
    hero_title_green: 'doorstep.',
    hero_subtitle: 'Experience authentic flavors crafted with tradition. From our signature chicken pastil to premium bottled sauces, we bring the heart of Mindanao to every meal.',
    hero_cta_text: 'Explore Catalog',
    hero_cta_link: '/menu',
    stats_branches: '50+',
    stats_orders: '5,000+',
    stats_cities: '20+',
    stats_applications: '200+',
    announcement_enabled: false,
    announcement_text: '',
    featured_products: [],
    trust_title: 'The Fastest Growing Pastil Brand.',
    trust_subtitle: 'Join our mission to bring Mindanao\'s finest to every Filipino table through our expanding franchise network.',
    footer_desc: 'Bringing authentic Mindanao flavors to the mainstream. Quality you can trust, prices you can afford.',
    footer_copyright: '&copy; 2026 Pastil ni Liling. Swak sa Bulsa, Sarap na Babalik-balikan.',
    footer_social_fb: 'https://facebook.com',
    footer_social_ig: 'https://instagram.com',
    footer_social_tw: 'https://twitter.com',
    footer_contact_phone: '+63 917 123 4567',
    footer_contact_email: 'hello@pastilnililing.com',
    footer_contact_address: 'General Santos City, Philippines'
  };

  const settings: SiteSettings = settingsRes?.success ? settingsRes.data : defaults;
  
  // Safe parsing of customized announcement JSON payload
  const announcement = typeof settings.announcement_text === 'object' && settings.announcement_text !== null
    ? settings.announcement_text
    : (() => {
        try {
          if (typeof settings.announcement_text === 'string' && settings.announcement_text.startsWith('{')) {
            const parsed = JSON.parse(settings.announcement_text);
            return {
              text: parsed.text || '',
              bg_color: parsed.bg_color || 'bg-brand-yellow',
              text_color: parsed.text_color || 'text-brand-earth',
              animate: parsed.animate || 'none',
              icon: parsed.icon || 'megaphone',
              timer_enabled: parsed.timer_enabled || false,
              timer_target: parsed.timer_target || '',
              timer_prefix: parsed.timer_prefix || 'Ends in:',
              timer_format: parsed.timer_format || 'h_m_s',
              timer_expired_behavior: parsed.timer_expired_behavior || 'display',
              timer_expired_text: parsed.timer_expired_text || 'Expired!'
            };
          }
        } catch (e) {}
        return {
          text: typeof settings.announcement_text === 'string' ? settings.announcement_text : '',
          bg_color: 'bg-brand-yellow',
          text_color: 'text-brand-earth',
          animate: 'none',
          icon: 'megaphone',
          timer_enabled: false,
          timer_target: '',
          timer_prefix: 'Ends in:',
          timer_format: 'h_m_s',
          timer_expired_behavior: 'display',
          timer_expired_text: 'Expired!'
        };
      })();

  useEffect(() => {
    setIsTimerExpired(false);
  }, [announcement.timer_target, announcement.timer_enabled]);

  const iconEmoji = announcement.icon === 'megaphone' ? '📢' 
    : announcement.icon === 'sparkle' ? '✨'
    : announcement.icon === 'gift' ? '🎁'
    : announcement.icon === 'warning' ? '🔥'
    : '📢';

  const allProducts = (productsRes?.success && Array.isArray(productsRes.data)) ? productsRes.data : [];

  // Filter products that are marked as featured by Admin
  const featuredProducts = Array.isArray(allProducts) 
    ? allProducts.filter((p: any) => 
        Array.isArray(settings.featured_products) && settings.featured_products.includes(p.id)
      )
    : [];

  const defaultShowcase = [
    { title: "The Signature", subtitle: "Chicken Adobo Pastil", desc: "Authentic steamed rice topped with premium shredded chicken.", price: "Starts at ₱25", image_url: "/hero.png" },
    { title: "Bottled Premium", subtitle: "Spicy Shrimp Bagoong", desc: "Our secret recipe shrimp paste with a spicy kick.", price: "₱149 per jar", image_url: "/hero.png" },
    { title: "Side Kick", subtitle: "Chili Garlic Oil", desc: "Premium garlic bits in spicy toasted chili oil infusion.", price: "₱99 per jar", image_url: "/hero.png" },
  ];

  interface ShowcaseItem {
    title: string;
    subtitle: string;
    desc: string;
    price: string;
    image_url: string;
  }

  // If there are featured products configured, use them, otherwise fall back to static showcase defaults
  const showcaseItems: ShowcaseItem[] = featuredProducts.length > 0 
    ? featuredProducts.map((p: any) => ({
        title: p.category === 'pastil' ? 'The Signature' : (p.category === 'bagoong' ? 'Bottled Premium' : 'Side Kick'),
        subtitle: p.name,
        desc: p.description,
        price: `₱${p.price}`,
        image_url: p.image_url || "/hero.png"
      }))
    : defaultShowcase;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-brand-earth selection:bg-brand-yellow/30 flex flex-col">
      {/* Dynamic Announcement Bar */}
      {settings.announcement_enabled && announcement.text && !isAlertClosed && !(announcement.timer_enabled && announcement.timer_expired_behavior === 'hide' && isTimerExpired) && (
        <div 
          style={{ 
            ...getBgStyle(announcement.bg_color), 
            ...getTextStyle(announcement.text_color) 
          }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-2.5 rounded-full shadow-[0_16px_36px_rgba(27,45,22,0.12)] border border-black/5 flex items-center justify-between gap-3 max-w-[90vw] md:max-w-xl select-none animate-in fade-in slide-in-from-top-4 duration-500 hover:scale-[1.02] transition-transform shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-sm shrink-0">{iconEmoji}</span>
            <span className={`text-[10px] sm:text-xs font-black tracking-wide leading-tight ${
              announcement.animate === 'bounce' ? 'animate-bounce inline-block' : 
              announcement.animate === 'pulse' ? 'animate-pulse' : ''
            }`}>
              {announcement.text}
            </span>
            {announcement.timer_enabled && announcement.timer_target && (
              <CountdownTimer 
                targetDate={announcement.timer_target} 
                prefix={announcement.timer_prefix}
                format={announcement.timer_format}
                expiredBehavior={announcement.timer_expired_behavior}
                expiredText={announcement.timer_expired_text}
                onExpire={() => setIsTimerExpired(true)}
              />
            )}
          </div>
          <button 
            type="button"
            onClick={() => setIsAlertClosed(true)}
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black opacity-60 hover:opacity-100 transition-opacity bg-black/5 cursor-pointer ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation - Minimal & Elegant */}
      <Navbar variant="landing" />

      {/* Hero Section - Balanced & Focused */}
      <main className="pt-20 pb-16 md:pt-24 md:pb-24 px-6 flex-1">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="space-y-6 md:space-y-8 animate-in fade-in duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/5 border border-brand-green/10 text-[9px] font-bold uppercase tracking-widest text-brand-green">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span>
              {settings.hero_badge}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-brand-earth">
              {settings.hero_title_white ? (
                settings.hero_title_white.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)
              ) : (
                <>Mindanao's finest <br /> delivered to your <br /></>
              )}
              <span className="text-brand-green">{settings.hero_title_green}</span>
            </h1>

            <p className="text-base md:text-lg text-brand-earth/60 max-w-md font-medium leading-relaxed">
              {settings.hero_subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href={settings.hero_cta_link} className="bg-brand-green text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl shadow-brand-green/20 hover:shadow-brand-green/40 transition-all text-center">
                {settings.hero_cta_text}
              </Link>
              <Link href="/franchise" className="bg-white border border-gray-200 text-brand-earth px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:border-brand-yellow hover:bg-brand-yellow/5 transition-all text-center">
                Franchise Inquiry
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-10">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden grayscale-[0.5] hover:grayscale-0 transition-all">
                    <Image src={`https://i.pravatar.cc/100?u=${i+20}`} alt="User" width={40} height={40} />
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-bold text-brand-earth/40 uppercase tracking-widest leading-relaxed">
                Trusted by <span className="text-brand-earth">10,000+</span> <br />satisfied customers
              </p>
            </div>
          </div>

          <div className="relative group animate-in fade-in zoom-in duration-1000 delay-200">
            <div className="absolute inset-0 bg-brand-yellow/20 rounded-[2.5rem] blur-3xl -z-10 group-hover:bg-brand-yellow/30 transition-all duration-700"></div>
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(45,74,34,0.2)] border-4 border-white/20 bg-white/10 backdrop-blur-md aspect-square">
              <Image 
                src="/hero.png" 
                alt="Pastil ni Liling Signature Dish" 
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-110 transition-transform duration-1000"
                priority
                loading="eager"
              />
            </div>
            
            {/* Subtle Floating Info */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:-right-6 bg-white w-[90%] md:w-auto p-4 md:p-5 rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center md:justify-start gap-3 md:gap-4 animate-in slide-in-from-bottom duration-1000 delay-500 z-10">
              <div className="bg-brand-green/10 w-10 h-10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 22h20" />
                  <path d="M20 15a8 8 0 0 0-16 0" />
                  <path d="M12 2v3M9 3v2M15 3v2" />
                </svg>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-earth/40">Freshly Made</p>
                <p className="text-xs font-bold">Daily Batch Pastil</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Featured Showcase Showcase - Clean & Minimal */}
      <section className="bg-white py-20 md:py-32 border-y border-gray-100 overflow-hidden shrink-0">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center md:text-left">
            <p className="text-xs font-bold text-brand-green uppercase tracking-widest leading-none">Featured Catalog</p>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-6 md:gap-12 pb-8 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
            {showcaseItems.map((item, idx) => (
              <div 
                key={idx} 
                className="space-y-6 group cursor-pointer w-[85vw] md:w-auto shrink-0 snap-center animate-in slide-in-from-bottom fade-in duration-1000 fill-mode-both"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="aspect-[4/3] rounded-3xl bg-gray-50 overflow-hidden relative border border-gray-100 shadow-sm transition-all group-hover:shadow-md">
                   <Image 
                    src={item.image_url} 
                    alt={item.subtitle} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-all duration-500 opacity-80 group-hover:opacity-100" 
                    priority={idx === 0}
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-green">{item.title}</div>
                  <h3 className="text-xl font-extrabold tracking-tight">{item.subtitle}</h3>
                  <p className="text-sm text-brand-earth/50 font-medium leading-relaxed">{item.desc}</p>
                  <div className="text-xs font-bold pt-2">{item.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section - Subtle Statistics */}
      <section className="py-24 md:py-40 bg-[#fafafa] shrink-0">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-20">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{settings.trust_title || 'The Fastest Growing Pastil Brand.'}</h2>
            <p className="text-sm md:text-base text-brand-earth/50 max-w-lg mx-auto font-medium">{settings.trust_subtitle || "Join our mission to bring Mindanao's finest to every Filipino table through our expanding franchise network."}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { label: "Active Branches", value: settings.stats_branches },
              { label: "Daily Orders", value: settings.stats_orders },
              { label: "Cities Reached", value: settings.stats_cities },
              { label: "Franchise Apps", value: settings.stats_applications },
            ].map((stat, idx) => (
              <div key={idx} className="space-y-1 hover:-translate-y-2 transition-transform duration-500 cursor-default">
                <div className="text-3xl md:text-4xl font-black tracking-tighter text-brand-earth">{stat.value}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Elegant & Informative */}
      <Footer />
    </div>
  );
}
