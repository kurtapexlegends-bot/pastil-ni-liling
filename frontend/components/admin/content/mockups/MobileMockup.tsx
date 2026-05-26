import React, { useState, useEffect } from 'react';
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
  footer_social_fb?: string;
  footer_social_ig?: string;
  footer_social_tw?: string;
  footer_contact_phone?: string;
  footer_contact_email?: string;
  footer_contact_address?: string;
}

interface MobileMockupProps {
  formData: SiteSettings;
  products: Product[];
  activeSubTab: string;
}

interface CountdownTimerProps {
  targetDate: string;
  prefix?: string;
  format?: 'd_h_m_s' | 'h_m_s';
  expiredBehavior?: 'hide' | 'display';
  expiredText?: string;
  onExpire?: () => void;
  className?: string;
}

const CountdownTimer = ({ 
  targetDate, 
  prefix = 'Ends in:', 
  format = 'h_m_s', 
  expiredBehavior = 'display', 
  expiredText = 'Expired!', 
  onExpire,
  className
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (isDone && onExpire) {
      onExpire();
    }
  }, [isDone, onExpire]);

  useEffect(() => {
    if (!targetDate) return;

    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setIsDone(true);
        return expiredText;
      }

      setIsDone(false);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = format === 'd_h_m_s' 
        ? Math.floor((difference / (1000 * 60 * 60)) % 24)
        : Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const pad = (num: number) => String(num).padStart(2, '0');

      const label = prefix ? `${prefix} ` : '';

      if (format === 'd_h_m_s' && days > 0) {
        return `${label}${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
      }

      return `${label}${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    };

    setTimeLeft(calculateTime());

    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, prefix, format, expiredText]);

  if (!targetDate) return null;
  if (isDone && expiredBehavior === 'hide') return null;

  return (
    <span 
      style={{ opacity: 0.85 }}
      className={className || "text-[4.5px] font-black uppercase tracking-wider px-1 py-0.5 rounded bg-black/10 shrink-0 ml-1"}
    >
      {timeLeft}
    </span>
  );
};

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

export default function MobileMockup({ formData, products, activeSubTab }: MobileMockupProps) {
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [mockStep, setMockStep] = useState(1);

  useEffect(() => {
    setMockStep(1);
  }, [activeSubTab]);

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
          text: typeof formData.announcement_text === 'string' ? formData.announcement_text : '',
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

  return (
    <div className="relative w-[280px] h-[560px] bg-brand-earth rounded-[2.5rem] border-8 border-brand-earth shadow-2xl overflow-hidden flex flex-col ring-4 ring-white/30 transition-all duration-300 animate-in zoom-in-95 duration-200">
      {/* Dynamic Floating Pill Alert Overlay */}
      {formData.announcement_enabled && announcement.text && !(announcement.timer_enabled && announcement.timer_expired_behavior === 'hide' && isTimerExpired) && (
        <div 
          style={{ 
            ...getBgStyle(announcement.bg_color), 
            ...getTextStyle(announcement.text_color) 
          }}
          className="absolute top-12 left-1/2 -translate-x-1/2 z-40 px-2.5 py-1 rounded-full shadow-md border border-black/5 flex items-center justify-between gap-1 max-w-[85%] select-none scale-[0.8] origin-top shrink-0"
        >
          <span className="text-[7px] shrink-0">{iconEmoji}</span>
          <span className={`text-[5.5px] font-black tracking-wide leading-none truncate max-w-[90px] ${
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

      <div className="flex-1 bg-[#fafafa] overflow-y-auto scrollbar-hide text-brand-earth text-left select-none relative animate-in fade-in duration-500">
        {activeSubTab === 'franchise' ? (
          /* FRANCHISE PORTAL MOBILE VIEW */
          <div className="space-y-0.5 animate-in fade-in duration-300">
            <div className="p-4 space-y-3 bg-white border-b border-gray-100">
              <div className="inline-flex items-center gap-1.5 py-0.5 px-2 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[5px] font-bold uppercase tracking-wider text-brand-yellow">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse"></span>
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
                { 
                  title: formData.franchise_benefit1_title || 'Low Capital', 
                  desc: formData.franchise_benefit1_desc || 'Minimal overhead setup.',
                  icon: (
                    <svg className="text-brand-green" style={{ width: '8px', height: '8px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="8" cy="8" r="6" />
                      <path d="M18 8a6 6 0 0 1-6 6" />
                      <circle cx="16" cy="16" r="6" />
                    </svg>
                  )
                },
                { 
                  title: formData.franchise_benefit2_title || 'Proven System', 
                  desc: formData.franchise_benefit2_desc || 'Operational training.',
                  icon: (
                    <svg className="text-brand-green" style={{ width: '8px', height: '8px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  )
                },
                { 
                  title: formData.franchise_benefit3_title || 'High Demand', 
                  desc: formData.franchise_benefit3_desc || 'Staple favorite.',
                  icon: (
                    <svg className="text-brand-green" style={{ width: '8px', height: '8px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 11 2 2 4-4" />
                    </svg>
                  )
                },
                { 
                  title: formData.franchise_benefit4_title || 'Marketing Power', 
                  desc: formData.franchise_benefit4_desc || 'National support.',
                  icon: (
                    <svg className="text-brand-green" style={{ width: '8px', height: '8px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m4 15 4-3 9 4V4L8 8l-4-3v10Z" />
                      <path d="M12 17v4" />
                    </svg>
                  )
                }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-2.5">
                  <div className="w-4.5 h-4.5 rounded bg-brand-green/10 flex items-center justify-center shrink-0 border border-brand-green/20">
                    {item.icon}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[6px] font-black uppercase tracking-wider">{item.title}</h4>
                    <p className="text-[5.5px] text-brand-earth/40 leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mx-4 p-4 bg-brand-earth rounded-2xl text-white relative overflow-hidden space-y-1">
              <div className="absolute top-0 right-0 w-12 h-12 bg-brand-green/20 blur-xl rounded-full"></div>
              <p className="text-xs font-black tracking-tight leading-none">{formData.franchise_milestone_title || '50+ Branches'}</p>
              <p className="text-[5px] font-bold uppercase tracking-widest opacity-60 leading-none">{formData.franchise_milestone_desc || 'And growing rapidly nationwide.'}</p>
            </div>

            {/* Mobile Form Section */}
            <div className="p-4 mt-2 bg-white border-t border-gray-50 space-y-2.5">
              {mockStep === 1 && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[5.5px] font-bold text-brand-green uppercase tracking-widest">Step 1 of 3</span>
                    <span className="text-[5px] font-bold text-brand-earth/30 uppercase tracking-widest">Personal Info</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-0.5 flex-1 bg-brand-green rounded-full"></div>
                    <div className="h-0.5 flex-1 bg-gray-100 rounded-full"></div>
                    <div className="h-0.5 flex-1 bg-gray-100 rounded-full"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="h-5 bg-gray-50 border border-gray-100 rounded-lg px-2 flex items-center">
                        <span className="text-[5px] font-bold text-brand-earth/30">First Name</span>
                      </div>
                      <div className="h-5 bg-gray-50 border border-gray-100 rounded-lg px-2 flex items-center">
                        <span className="text-[5px] font-bold text-brand-earth/30">Last Name</span>
                      </div>
                    </div>
                    <div className="h-5 bg-gray-50 border border-gray-100 rounded-lg px-2 flex items-center">
                      <span className="text-[5px] font-bold text-brand-earth/30">Email Address</span>
                    </div>
                    <div className="h-5 bg-gray-50 border border-gray-100 rounded-lg px-2 flex items-center">
                      <span className="text-[5px] font-bold text-brand-earth/30">Phone Number</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setMockStep(2)}
                    className="w-full h-6 bg-brand-earth hover:bg-brand-green text-white rounded-full flex items-center justify-center text-[5.5px] font-black uppercase tracking-widest leading-none transition-colors"
                  >
                    Continue
                  </button>
                </div>
              )}

              {mockStep === 2 && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[5.5px] font-bold text-brand-green uppercase tracking-widest">Step 2 of 3</span>
                    <span className="text-[5px] font-bold text-brand-earth/30 uppercase tracking-widest">Location & Capital</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-0.5 flex-1 bg-brand-green rounded-full"></div>
                    <div className="h-0.5 flex-1 bg-brand-green rounded-full"></div>
                    <div className="h-0.5 flex-1 bg-gray-100 rounded-full"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-5 bg-gray-50 border border-gray-100 rounded-lg px-2 flex items-center">
                      <span className="text-[5px] font-bold text-brand-earth/30">Target Location</span>
                    </div>
                    <div className="h-5 bg-gray-50 border border-gray-100 rounded-lg px-2 flex items-center justify-between">
                      <span className="text-[5px] font-bold text-brand-earth/30">Select Capacity Range</span>
                      <span className="text-[4.5px] text-brand-earth/40">▼</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setMockStep(1)}
                      className="flex-1 h-6 bg-gray-100 hover:bg-gray-200 text-brand-earth rounded-full flex items-center justify-center text-[5.5px] font-black uppercase tracking-widest leading-none transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => setMockStep(3)}
                      className="flex-[2] h-6 bg-brand-earth hover:bg-brand-green text-white rounded-full flex items-center justify-center text-[5.5px] font-black uppercase tracking-widest leading-none transition-colors"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              )}

              {mockStep === 3 && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[5.5px] font-bold text-brand-green uppercase tracking-widest">Step 3 of 3</span>
                    <span className="text-[5px] font-bold text-brand-earth/30 uppercase tracking-widest">Final Review</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-0.5 flex-1 bg-brand-green rounded-full"></div>
                    <div className="h-0.5 flex-1 bg-brand-green rounded-full"></div>
                    <div className="h-0.5 flex-1 bg-brand-green rounded-full"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-8 bg-gray-50 border border-gray-100 rounded-lg p-1.5 flex items-start">
                      <span className="text-[4px] font-bold text-brand-earth/30 leading-tight">Prior food stall experience...</span>
                    </div>
                    <div className="p-1.5 rounded bg-brand-green/5 border border-brand-green/10 space-y-0.5">
                      <p className="text-[3.5px] font-bold uppercase tracking-widest text-brand-green leading-none">Compliance Acknowledge</p>
                      <p className="text-[3.5px] text-brand-earth/60 font-medium leading-tight">
                        By submitting, you agree to our franchise terms.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setMockStep(2)}
                      className="flex-1 h-6 bg-gray-100 hover:bg-gray-200 text-brand-earth rounded-full flex items-center justify-center text-[5.5px] font-black uppercase tracking-widest leading-none transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => setMockStep(4)}
                      className="flex-[2] h-6 bg-brand-green text-white rounded-full flex items-center justify-center text-[5.5px] font-black uppercase tracking-widest leading-none transition-colors"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}

              {mockStep === 4 && (
                <div className="py-3 text-center space-y-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-6 h-6 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto border border-brand-green/20">
                    <svg className="text-brand-green w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[8px] font-extrabold tracking-tight text-brand-earth leading-none">Application Received!</h4>
                    <p className="text-[4.5px] text-brand-earth/50 font-medium max-w-[120px] mx-auto leading-relaxed">
                      Our team will contact you within 3-5 business days.
                    </p>
                  </div>
                  <button 
                    onClick={() => setMockStep(1)}
                    className="h-6 bg-brand-green text-white px-3 rounded-full text-[4.5px] font-bold uppercase tracking-widest transition-all hover:opacity-90 leading-none"
                  >
                    Return Home
                  </button>
                </div>
              )}
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
        )}
      </div>
    </div>
  );
}
