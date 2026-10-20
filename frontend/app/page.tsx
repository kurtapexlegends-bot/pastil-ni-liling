"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import useSWR from "swr";
import Navbar from "@/components/layout/Navbar";
import CountdownTimer from "@/components/ui/CountdownTimer";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/consumer/HeroSection";
import FeaturedShowcase from "@/components/consumer/FeaturedShowcase";
import TrustStatsSection from "@/components/consumer/TrustStatsSection";
import { MegaphoneSimple, Sparkle, Gift, Flame, X } from "@phosphor-icons/react";

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
    footer_desc: 'Authentic Mindanao-style Chicken & Beef Pastil wrapped in fresh banana leaves. Mura, masarap, at babalik-balikan!',
    footer_copyright: '&copy; 2026 Pastil ni Liling. Mura, Masarap, at Babalik-balikan.',
    footer_social_fb: 'https://www.facebook.com/PastilNiLiling',
    footer_social_ig: 'https://instagram.com',
    footer_social_tw: 'https://twitter.com',
    footer_contact_phone: '+63 966 142 3992 / 0927 572 3661',
    footer_contact_email: 'pastilnililing@gmail.com',
    footer_contact_address: 'Cubao (Arayat Market, QC) & Bagong Silang (Langit Road, Caloocan)'
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

  const renderAnnouncementIcon = (iconName?: string) => {
    switch (iconName) {
      case 'sparkle':
        return <Sparkle size={16} weight="fill" className="shrink-0" />;
      case 'gift':
        return <Gift size={16} weight="fill" className="shrink-0" />;
      case 'warning':
        return <Flame size={16} weight="fill" className="shrink-0" />;
      case 'megaphone':
      default:
        return <MegaphoneSimple size={16} weight="fill" className="shrink-0" />;
    }
  };

  const allProducts = (productsRes?.success && Array.isArray(productsRes.data)) ? productsRes.data : [];

  // Filter products that are marked as featured by Admin
  const featuredProducts = Array.isArray(allProducts) 
    ? allProducts.filter((p: any) => 
        Array.isArray(settings.featured_products) && settings.featured_products.includes(p.id)
      )
    : [];

  const defaultShowcase = [
    { title: "The Signature", subtitle: "Chicken Adobo Pastil", desc: "Authentic steamed rice topped with premium shredded chicken.", price: "Starts at ₱25", image_url: "/products/real_dish_4.webp" },
    { title: "Bottled Premium", subtitle: "Pastil ni Liling Beef Pastil Jar", desc: "220g sealed glass jar of authentic shredded beef pastil in pure corn oil.", price: "₱160 per jar", image_url: "/products/real_dish_1.webp" },
    { title: "Side Kick", subtitle: "Chili Garlic Oil & Spiced Kagikit", desc: "Crispy garlic bits in spicy toasted chili oil infusion with siling labuyo.", price: "₱85 per jar", image_url: "/products/real_dish_2.webp" },
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
    <div className="min-h-screen bg-background font-sans text-brand-earth selection:bg-brand-yellow/30 flex flex-col">
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
            <span className="shrink-0 flex items-center">{renderAnnouncementIcon(announcement.icon)}</span>
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
            aria-label="Close announcement"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-brand-earth/60 hover:text-brand-earth hover:bg-black/10 transition-colors cursor-pointer ml-1"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
      )}

      {/* Navigation - Minimal & Elegant */}
      <Navbar variant="landing" />

      {/* Hero Section */}
      <HeroSection 
        badge={settings.hero_badge}
        titleWhite={settings.hero_title_white}
        titleGreen={settings.hero_title_green}
        subtitle={settings.hero_subtitle}
        ctaText={settings.hero_cta_text}
        ctaLink={settings.hero_cta_link}
      />

      {/* Featured Showcase */}
      <FeaturedShowcase items={showcaseItems} />

      {/* Trust Section */}
      <TrustStatsSection 
        title={settings.trust_title}
        subtitle={settings.trust_subtitle}
        stats={{
          branches: settings.stats_branches,
          orders: settings.stats_orders,
          cities: settings.stats_cities,
          applications: settings.stats_applications,
        }}
      />

      {/* Footer - Elegant & Informative */}
      <Footer />
    </div>
  );
}
