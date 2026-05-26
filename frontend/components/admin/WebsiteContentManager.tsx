'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { 
  Globe, 
  Layout, 
  NumberSquareFour, 
  Sparkle, 
  CircleNotch, 
  ArrowClockwise,
  FloppyDisk,
  CheckCircle,
  Megaphone,
  Briefcase,
  Eye
} from '@phosphor-icons/react';
import { Product } from '../../app/admin/types';

// Extracted Sub-components
import HeroForm from './content/forms/HeroForm';
import StatsForm from './content/forms/StatsForm';
import FeaturedPicker from './content/forms/FeaturedPicker';
import AnnouncementForm from './content/forms/AnnouncementForm';
import LayoutBrandingForm from './content/forms/LayoutBrandingForm';
import FranchiseFormFields from './content/forms/FranchiseFormFields';
import LivePreviewPanel from './content/mockups/LivePreviewPanel';
import MobileMockup from './content/mockups/MobileMockup';

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

const fetcher = (url: string) => {
  const token = localStorage.getItem('token');
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.json());
};

export default function WebsiteContentManager() {
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'stats' | 'featured' | 'announcement' | 'layout' | 'franchise'>('hero');
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);


  const [formData, setFormData] = useState<SiteSettings>({
    hero_badge: '',
    hero_title_white: '',
    hero_title_green: '',
    hero_subtitle: '',
    hero_cta_text: '',
    hero_cta_link: '',
    stats_branches: '',
    stats_orders: '',
    stats_cities: '',
    stats_applications: '',
    announcement_enabled: false,
    announcement_text: '',
    featured_products: [],
    trust_title: '',
    trust_subtitle: '',
    footer_desc: '',
    footer_copyright: '',
    franchise_badge: '',
    franchise_title_white: '',
    franchise_title_green: '',
    franchise_subtitle: '',
    franchise_benefit1_title: '',
    franchise_benefit1_desc: '',
    franchise_benefit2_title: '',
    franchise_benefit2_desc: '',
    franchise_benefit3_title: '',
    franchise_benefit3_desc: '',
    franchise_benefit4_title: '',
    franchise_benefit4_desc: '',
    franchise_milestone_title: '',
    franchise_milestone_desc: '',
    franchise_footer_copyright: '',
    footer_social_fb: '',
    footer_social_ig: '',
    footer_social_tw: '',
    footer_contact_phone: '',
    footer_contact_email: '',
    footer_contact_address: ''
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showMobilePreviewDrawer, setShowMobilePreviewDrawer] = useState(false);

  useEffect(() => {
    const container = tabContainerRef.current;
    if (!container) return;

    const checkScrollLimits = () => {
      setCanScrollLeft(container.scrollLeft > 1);
      setCanScrollRight(container.scrollWidth - container.scrollLeft - container.clientWidth > 1);
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollBy({
          left: e.deltaY * 1.2,
          behavior: 'smooth'
        });
      }
    };

    // Check limits on a micro-delay to let elements render correctly
    const timer = setTimeout(checkScrollLimits, 150);

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('scroll', checkScrollLimits);
    window.addEventListener('resize', checkScrollLimits);

    return () => {
      clearTimeout(timer);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('scroll', checkScrollLimits);
      window.removeEventListener('resize', checkScrollLimits);
    };
  }, [activeSubTab, formData]);

  // Fetch website configurations
  const { data: settingsRes, error: settingsErr, mutate: mutateSettings, isLoading: loadingSettings } = useSWR(
    'http://127.0.0.1:8000/api/website-settings',
    fetcher
  );

  // Fetch live products for featured selection
  const { data: productsRes, isLoading: loadingProducts } = useSWR(
    'http://127.0.0.1:8000/api/products',
    (url) => fetch(url).then(res => res.json())
  );

  const products: Product[] = (productsRes?.success && Array.isArray(productsRes.data)) ? productsRes.data : [];

  // Sync server data to form state on initial load / mutate
  useEffect(() => {
    if (settingsRes?.success) {
      const data = { ...settingsRes.data };
      if (data.hasOwnProperty('announcement_enabled')) {
        data.announcement_enabled = data.announcement_enabled === true || 
                                    data.announcement_enabled === 1 || 
                                    data.announcement_enabled === '1' || 
                                    data.announcement_enabled === 'true';
      }
      setFormData(data);
    }
  }, [settingsRes]);

  if (loadingSettings || loadingProducts) {
    return (
      <div className="bg-white border border-gray-100 p-12 rounded-2xl text-center space-y-3 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
        <CircleNotch size={32} className="animate-spin text-brand-green" />
        <p className="text-xs text-brand-earth/50 font-medium uppercase tracking-wider animate-pulse">
          Opening Website Content Console...
        </p>
      </div>
    );
  }

  if (settingsErr) {
    return (
      <div className="bg-white border border-red-100 p-8 rounded-2xl text-center space-y-3 shadow-sm max-w-md mx-auto my-12">
        <Globe size={32} className="text-red-500 mx-auto" />
        <p className="text-xs font-bold text-red-500 uppercase tracking-wider">
          Console Access Faulted
        </p>
        <p className="text-[10px] text-brand-earth/50 leading-relaxed">
          Could not establish connection to the content delivery server. Check that your API is running.
        </p>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const toggleFeaturedProduct = (id: number) => {
    setFormData(prev => {
      const list = Array.isArray(prev.featured_products) ? prev.featured_products : [];
      const alreadyFeatured = list.includes(id);
      const updated = alreadyFeatured
        ? list.filter(item => item !== id)
        : [...list, id];
      return { ...prev, featured_products: updated };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/admin/website-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ settings: formData })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Configurations saved and pushed to live production successfully.');
        mutateSettings();
        // Clear message after 4 seconds
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.message || 'Failed to update website content.');
      }
    } catch (err) {
      setErrorMsg('Failed to establish connection to settings database.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start text-brand-earth animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* LEFT: FORM EDIT CONTROLS */}
      <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm p-4 sm:p-6 md:p-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50 pb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tighter">Site Content Manager</h2>
            <p className="text-[10px] font-bold text-brand-earth/40 uppercase tracking-widest">
              Modify the copy, products, and metrics on your landing page
            </p>
          </div>
          <button 
            type="button"
            onClick={() => {
              if (settingsRes?.success) {
                setFormData(settingsRes.data);
              }
              setSuccessMsg('');
              setErrorMsg('');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-100 hover:border-brand-green text-[10px] font-bold uppercase tracking-widest text-brand-earth/60 hover:text-brand-green transition-all self-start md:self-auto"
          >
            <ArrowClockwise size={12} />
            Revert
          </button>
        </header>

        {/* Scrollable Tabs Wrapper */}
        <div className="relative">
          {/* Left Scroll Indicator Fade */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10 animate-in fade-in duration-200" />
          )}

          {/* Console Nav Bar */}
          <div ref={tabContainerRef} className="flex border-b border-gray-100 overflow-x-auto pb-2 gap-1 [&::-webkit-scrollbar]:hidden">
            {[
              { id: 'hero', label: 'Hero Block', icon: Layout },
              { id: 'featured', label: 'Showcase', icon: Sparkle },
              { id: 'stats', label: 'Stats Ledger', icon: NumberSquareFour },
              { id: 'announcement', label: 'Alerts', icon: Megaphone },
              { id: 'layout', label: 'Layout & Footer', icon: Globe },
              { id: 'franchise', label: 'Franchise Page', icon: Briefcase }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 text-[10px] font-black uppercase tracking-wider transition-colors whitespace-nowrap ${
                    isActive 
                      ? 'border-brand-green text-brand-green font-black' 
                      : 'border-transparent text-brand-earth/40 hover:text-brand-earth'
                  }`}
                >
                  <Icon size={14} weight={isActive ? 'fill' : 'bold'} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right Scroll Indicator Fade & Floating Pointer Arrow */}
          {canScrollRight && (
            <>
              <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-white via-white/95 to-transparent pointer-events-none z-10 animate-in fade-in duration-200" />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 z-20 pointer-events-none bg-brand-green/10 border border-brand-green/20 text-brand-green p-1 rounded-full shadow-sm animate-pulse flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                </svg>
              </div>
            </>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. HERO TAB */}
          {activeSubTab === 'hero' && (
            <HeroForm 
              formData={formData} 
              onChange={handleInputChange} 
            />
          )}

          {/* 2. SHOWCASE CATALOG TAB */}
          {activeSubTab === 'featured' && (
            <FeaturedPicker 
              formData={formData} 
              products={products} 
              onToggleFeaturedProduct={toggleFeaturedProduct} 
            />
          )}

          {/* 3. STATS LEDGER TAB */}
          {activeSubTab === 'stats' && (
            <StatsForm 
              formData={formData} 
              onChange={handleInputChange} 
            />
          )}

          {/* 4. BANNER PROMO TAB */}
          {activeSubTab === 'announcement' && (
            <AnnouncementForm 
              formData={formData} 
              onUpdate={(updatedFields) => setFormData(prev => ({ ...prev, ...updatedFields }))} 
            />
          )}

          {/* 5. LAYOUT & BRANDING NARRATIVES TAB */}
          {activeSubTab === 'layout' && (
            <LayoutBrandingForm 
              formData={formData} 
              onChange={handleInputChange} 
            />
          )}

          {/* 6. FRANCHISE PROGRAM CONTROLS TAB */}
          {activeSubTab === 'franchise' && (
            <FranchiseFormFields 
              formData={formData} 
              onChange={handleInputChange} 
            />
          )}

          {/* Notifications */}
          {successMsg && (
            <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-start gap-2.5 text-green-700 animate-in zoom-in duration-300">
              <CheckCircle size={16} className="shrink-0 mt-0.5" />
              <p className="text-[10px] font-semibold leading-relaxed">{successMsg}</p>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2.5 text-red-700 animate-in zoom-in duration-300">
              <CheckCircle size={16} className="shrink-0 mt-0.5 rotate-45" />
              <p className="text-[10px] font-semibold leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Save Action */}
          <footer className="pt-4 border-t border-gray-50 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto bg-brand-earth text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-green transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <CircleNotch size={14} className="animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <FloppyDisk size={14} weight="fill" />
                  Push Live
                </>
              )}
            </button>
          </footer>
        </form>
      </div>

      {/* RIGHT: REAL-TIME DEVICE MOCKUP PREVIEW */}
      <LivePreviewPanel 
        formData={formData} 
        products={products} 
        activeSubTab={activeSubTab} 
      />

      {/* Mobile Floating Preview Button */}
      <button
        type="button"
        onClick={() => setShowMobilePreviewDrawer(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 bg-brand-green text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all animate-in zoom-in duration-300"
        aria-label="Toggle live preview"
      >
        <Eye size={20} weight="fill" />
      </button>

      {/* Mobile Preview Slide-Over Drawer */}
      {showMobilePreviewDrawer && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end animate-in fade-in duration-300 select-none">
          {/* Backdrop */}
          <div 
            onClick={() => setShowMobilePreviewDrawer(false)}
            className="absolute inset-0 bg-brand-earth/40 backdrop-blur-sm"
          />
          {/* Slide Pane */}
          <div className="relative w-full max-w-[320px] h-full bg-[#fafafa] shadow-2xl flex flex-col justify-start items-center p-6 overflow-y-auto scrollbar-hide border-l border-gray-100 animate-in slide-in-from-right duration-300">
            <header className="w-full flex items-center justify-between mb-6 shrink-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-earth/60 flex items-center gap-1.5">
                <Eye size={12} weight="fill" className="text-brand-green" />
                Live Mobile Mockup
              </p>
              <button
                type="button"
                onClick={() => setShowMobilePreviewDrawer(false)}
                className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </header>

            {/* Mobile Device Mockup Emulation */}
            <div className="scale-[0.9] origin-top my-auto">
              <MobileMockup 
                formData={formData} 
                products={products} 
                activeSubTab={activeSubTab} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
