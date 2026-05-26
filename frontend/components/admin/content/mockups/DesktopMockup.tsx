import React, { useState, useEffect } from 'react';
import CountdownTimer from '../../../ui/CountdownTimer';
import { getBgStyle, getTextStyle } from './mockupHelpers';
import { SiteSettings, Product } from './types';
import DesktopLandingPreview from './views/DesktopLandingPreview';
import DesktopFranchisePreview from './views/DesktopFranchisePreview';

interface DesktopMockupProps {
  formData: SiteSettings;
  products: Product[];
  activeSubTab: string;
}

export default function DesktopMockup({ formData, products, activeSubTab }: DesktopMockupProps) {
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
    <div className="relative w-full max-w-[460px] h-[560px] bg-white rounded-3xl border border-gray-200/80 shadow-2xl overflow-hidden flex flex-col ring-4 ring-white/30 transition-all duration-300 animate-in zoom-in-95 duration-200">
      {/* Dynamic Floating Pill Alert Overlay */}
      {formData.announcement_enabled && announcement.text && !(announcement.timer_enabled && announcement.timer_expired_behavior === 'hide' && isTimerExpired) && (
        <div 
          style={{ 
            ...getBgStyle(announcement.bg_color), 
            ...getTextStyle(announcement.text_color) 
          }}
          className="absolute top-20 left-1/2 -translate-x-1/2 z-40 px-3 py-1 rounded-full shadow-lg border border-black/5 flex items-center justify-between gap-1.5 max-w-[85%] select-none scale-90 origin-top shrink-0"
        >
          <span className="text-[8px] shrink-0">{iconEmoji}</span>
          <span className={`text-[6.5px] font-black tracking-wide leading-none truncate max-w-[130px] ${
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
              className="text-[5px] font-black uppercase tracking-wider px-1 py-0.5 rounded bg-black/10 shrink-0 ml-1"
            />
          )}
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
        <div className="bg-white/85 border border-gray-200 rounded-md py-0.5 px-6 text-[6px] text-brand-earth/50 w-1/2 text-center select-none truncate">
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
          <DesktopFranchisePreview 
            formData={formData} 
            mockStep={mockStep} 
            setMockStep={setMockStep} 
          />
        ) : (
          <DesktopLandingPreview 
            formData={formData} 
            products={products} 
          />
        )}
      </div>
    </div>
  );
}
