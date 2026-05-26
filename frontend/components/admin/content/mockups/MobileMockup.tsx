import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import CountdownTimer from '../../../ui/CountdownTimer';
import { getBgStyle, getTextStyle } from './mockupHelpers';
import { SiteSettings, Product } from './types';
import MobileLandingPreview from './views/MobileLandingPreview';
import MobileFranchisePreview from './views/MobileFranchisePreview';

interface MobileMockupProps {
  formData: SiteSettings;
  products: Product[];
  activeSubTab: string;
}

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
              className="text-[4.5px] font-black uppercase tracking-wider px-1 py-0.5 rounded bg-black/10 shrink-0 ml-1"
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

      {/* Device Mockup Scrollable Web Page View */}
      <div className="flex-1 bg-[#fafafa] overflow-y-auto scrollbar-hide text-brand-earth text-left select-none relative animate-in fade-in duration-500">
        {activeSubTab === 'franchise' ? (
          <MobileFranchisePreview 
            formData={formData} 
            mockStep={mockStep} 
            setMockStep={setMockStep} 
          />
        ) : (
          <MobileLandingPreview 
            formData={formData} 
            products={products} 
          />
        )}
      </div>
    </div>
  );
}
