import React, { useEffect, useState } from 'react';

interface SiteSettings {
  announcement_enabled: boolean;
  announcement_text: string;
}

interface AnnouncementFormProps {
  formData: SiteSettings;
  onUpdate: (updatedFields: Partial<SiteSettings>) => void;
}

interface AnnouncementConfig {
  text: string;
  bg_color: string;
  text_color: string;
  animate: 'none' | 'pulse' | 'bounce';
  icon: 'megaphone' | 'sparkle' | 'gift' | 'warning';
  timer_enabled?: boolean;
  timer_target?: string;
  timer_prefix?: string;
  timer_format?: 'd_h_m_s' | 'h_m_s';
  timer_expired_behavior?: 'hide' | 'display';
  timer_expired_text?: string;
}

export default function AnnouncementForm({ formData, onUpdate }: AnnouncementFormProps) {
  // Parse existing settings or fallback
  const getAnnouncementData = (): AnnouncementConfig => {
    try {
      if (typeof formData.announcement_text === 'object' && formData.announcement_text !== null) {
        return {
          text: (formData.announcement_text as any).text || '',
          bg_color: (formData.announcement_text as any).bg_color || 'bg-brand-yellow',
          text_color: (formData.announcement_text as any).text_color || 'text-brand-earth',
          animate: (formData.announcement_text as any).animate || 'none',
          icon: (formData.announcement_text as any).icon || 'megaphone',
          timer_enabled: (formData.announcement_text as any).timer_enabled || false,
          timer_target: (formData.announcement_text as any).timer_target || '',
          timer_prefix: (formData.announcement_text as any).timer_prefix || 'Ends in:',
          timer_format: (formData.announcement_text as any).timer_format || 'h_m_s',
          timer_expired_behavior: (formData.announcement_text as any).timer_expired_behavior || 'display',
          timer_expired_text: (formData.announcement_text as any).timer_expired_text || 'Expired!'
        };
      }
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
  };

  const config = getAnnouncementData();

  const handleFieldsChange = (updates: Partial<AnnouncementConfig>) => {
    const updatedConfig = { ...config, ...updates };
    onUpdate({
      announcement_text: JSON.stringify(updatedConfig)
    });
  };

  const handleFieldChange = (key: keyof AnnouncementConfig, value: any) => {
    handleFieldsChange({ [key]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 select-none">
      {/* 1. Toggle switch */}
      <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            name="announcement_enabled"
            checked={formData.announcement_enabled}
            onChange={(e) => onUpdate({ announcement_enabled: e.target.checked })}
            className="w-4 h-4 accent-brand-green rounded border-gray-200 cursor-pointer"
          />
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-earth">
            Enable Top Announcement Bar
          </span>
        </label>
        <p className="text-[9px] text-brand-earth/50 leading-relaxed font-medium">
          Toggle on to display a highly prominent promotional message strip at the absolute top of the public landing page.
        </p>
      </div>

      {formData.announcement_enabled && (
        <div className="space-y-5 animate-in slide-in-from-top-2 duration-300">
          {/* 2. Banner Text Input */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
              Banner Text Message
            </label>
            <textarea
              rows={2}
              value={config.text}
              onChange={(e) => handleFieldChange('text', e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all leading-relaxed"
              placeholder="e.g. Promo Code: LILING10 - Get 10% discount on all bottled products this weekend!"
            />
          </div>

          {/* 3. Style Customizations Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Color Presets */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                Background Theme
              </label>
              <select
                value={`${config.bg_color}|${config.text_color}`}
                onChange={(e) => {
                  const [bg, text] = e.target.value.split('|');
                  handleFieldsChange({ bg_color: bg, text_color: text });
                }}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green outline-none transition-all cursor-pointer"
              >
                <option value="bg-brand-yellow|text-brand-earth">Warm Mustard Yellow (Default)</option>
                <option value="bg-brand-green|text-white">Forest Fresh Green</option>
                <option value="bg-brand-earth|text-brand-yellow">Deep Golden Soil</option>
                <option value="bg-brand-red|text-white">Spicy Pepper Red</option>
                <option value="bg-brand-gray|text-brand-earth">Minimalist Bone Gray</option>
              </select>
            </div>

            {/* Animation Effect */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                Visual Animation Effect
              </label>
              <select
                value={config.animate}
                onChange={(e) => handleFieldChange('animate', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green outline-none transition-all cursor-pointer"
              >
                <option value="none">Static Text (No Animation)</option>
                <option value="pulse">Soft Pulse (Glow Transition)</option>
                <option value="bounce">Playful Bounce (Hop Alert)</option>
              </select>
            </div>

            {/* Alert Icon */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                Prefix Indicator Icon
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { id: 'megaphone', label: 'Megaphone', icon: '📢' },
                  { id: 'sparkle', label: 'Sparkle', icon: '✨' },
                  { id: 'gift', label: 'Gift Present', icon: '🎁' },
                  { id: 'warning', label: 'Spicy Warning', icon: '🔥' }
                ].map((item) => {
                  const isSelected = config.icon === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleFieldChange('icon', item.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-brand-green bg-brand-green/5 text-brand-green ring-2 ring-brand-green/10'
                          : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50 text-brand-earth/60'
                      }`}
                    >
                      <span className="text-base mb-1">{item.icon}</span>
                      <span className="text-[7.5px] font-black uppercase tracking-wider">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Countdown Timer Config */}
            <div className="sm:col-span-2 pt-4 border-t border-gray-100/80 space-y-4">
              <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={config.timer_enabled || false}
                    onChange={(e) => handleFieldChange('timer_enabled', e.target.checked)}
                    className="w-4 h-4 accent-brand-green rounded border-gray-200 cursor-pointer"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-earth">
                    Enable Countdown Timer
                  </span>
                </label>
                <p className="text-[9px] text-brand-earth/50 leading-relaxed font-medium">
                  Show a ticking urgency countdown timer inside the alert capsule (e.g. "Ends in: 02h 45m 10s") to drive promo engagement.
                </p>
              </div>

              {(config.timer_enabled || false) && (
                <div className="grid sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                      Countdown Target Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={config.timer_target || ''}
                      onChange={(e) => handleFieldChange('timer_target', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green outline-none transition-all cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                      Timer Prefix Label
                    </label>
                    <input
                      type="text"
                      value={config.timer_prefix || 'Ends in:'}
                      onChange={(e) => handleFieldChange('timer_prefix', e.target.value)}
                      placeholder="e.g. Ends in:, Starts in:"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                      Timer Display Format
                    </label>
                    <select
                      value={config.timer_format || 'h_m_s'}
                      onChange={(e) => handleFieldChange('timer_format', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green outline-none transition-all cursor-pointer"
                    >
                      <option value="h_m_s">Hours, Minutes, Seconds (e.g. 72h 30m)</option>
                      <option value="d_h_m_s">Days, Hours, Minutes, Seconds (e.g. 3d 00h 30m)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                      When Countdown Expires
                    </label>
                    <select
                      value={config.timer_expired_behavior || 'display'}
                      onChange={(e) => handleFieldChange('timer_expired_behavior', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green outline-none transition-all cursor-pointer"
                    >
                      <option value="display">Keep alert visible & display status text</option>
                      <option value="hide">Automatically hide the entire alert bar</option>
                    </select>
                  </div>

                  {config.timer_expired_behavior !== 'hide' && (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                        Expired Status Text
                      </label>
                      <input
                        type="text"
                        value={config.timer_expired_text || 'Expired!'}
                        onChange={(e) => handleFieldChange('timer_expired_text', e.target.value)}
                        placeholder="e.g. Expired!, Promo Ended"
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green outline-none transition-all"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
