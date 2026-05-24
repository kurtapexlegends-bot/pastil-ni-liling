'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { 
  Globe, 
  Monitor, 
  Layout, 
  NumberSquareFour, 
  Sparkle, 
  CircleNotch, 
  ArrowClockwise,
  FloppyDisk,
  CheckCircle,
  Eye,
  Megaphone,
  DeviceMobile,
  Briefcase
} from '@phosphor-icons/react';
import { Product } from '../../app/admin/types';

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
}

const fetcher = (url: string) => {
  const token = localStorage.getItem('token');
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.json());
};

export default function WebsiteContentManager() {
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'stats' | 'featured' | 'announcement' | 'layout' | 'franchise'>('hero');
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
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
    franchise_footer_copyright: ''
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
      setFormData(settingsRes.data);
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
        // Clear message after 3 seconds
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
      <div className="lg:col-span-7 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8 space-y-8">
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
              setFormData(settingsRes?.data);
              setSuccessMsg('');
              setErrorMsg('');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-100 hover:border-brand-green text-[10px] font-bold uppercase tracking-widest text-brand-earth/60 hover:text-brand-green transition-all self-start md:self-auto"
          >
            <ArrowClockwise size={12} />
            Revert
          </button>
        </header>

        {/* Console Nav Bar */}
        <div className="flex border-b border-gray-100 overflow-x-auto pb-px gap-1 [&::-webkit-scrollbar]:hidden">
          {[
            { id: 'hero', label: 'Hero Block', icon: Layout },
            { id: 'stats', label: 'Stats Ledger', icon: NumberSquareFour },
            { id: 'featured', label: 'Showcase', icon: Sparkle },
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. HERO TAB */}
          {activeSubTab === 'hero' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                  Hero Tagline Badge
                </label>
                <input
                  type="text"
                  name="hero_badge"
                  value={formData.hero_badge}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                  placeholder="e.g. Sarap na Babalik-balikan"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                    Headline (White Text)
                  </label>
                  <textarea
                    rows={2}
                    name="hero_title_white"
                    value={formData.hero_title_white}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all resize-none"
                    placeholder="e.g. Mindanao's finest delivered to your"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                    Headline (Highlighted Green)
                  </label>
                  <input
                    type="text"
                    name="hero_title_green"
                    value={formData.hero_title_green}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                    placeholder="e.g. doorstep."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                  Subheadline/Description
                </label>
                <textarea
                  rows={3}
                  name="hero_subtitle"
                  value={formData.hero_subtitle}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all leading-relaxed"
                  placeholder="Describe your brand offerings..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                    Call-to-Action Text
                  </label>
                  <input
                    type="text"
                    name="hero_cta_text"
                    value={formData.hero_cta_text}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                    placeholder="Explore Catalog"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                    Call-to-Action Link
                  </label>
                  <input
                    type="text"
                    name="hero_cta_link"
                    value={formData.hero_cta_link}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                    placeholder="/menu"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. STATS TAB */}
          {activeSubTab === 'stats' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="p-4 rounded-xl bg-brand-green/5 border border-brand-green/10 flex items-start gap-3">
                <Globe size={18} className="text-brand-green mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-green">Global Credibility Indicators</p>
                  <p className="text-[9px] text-brand-earth/60 leading-relaxed font-normal">
                    These values represent verified performance trust badges showcased on the landing page to build user authority and credibility.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                    Active Branches
                  </label>
                  <input
                    type="text"
                    name="stats_branches"
                    value={formData.stats_branches}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                    placeholder="e.g. 50+"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                    Daily Orders Delivered
                  </label>
                  <input
                    type="text"
                    name="stats_orders"
                    value={formData.stats_orders}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                    placeholder="e.g. 5,000+"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                    Cities Reached
                  </label>
                  <input
                    type="text"
                    name="stats_cities"
                    value={formData.stats_cities}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                    placeholder="e.g. 20+"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                    Franchise Inquiries
                  </label>
                  <input
                    type="text"
                    name="stats_applications"
                    value={formData.stats_applications}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                    placeholder="e.g. 200+"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. FEATURED PRODUCTS TAB */}
          {activeSubTab === 'featured' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider">Showcase Carousel Catalog Selection</p>
                <p className="text-[9px] text-brand-earth/50 leading-relaxed">
                  Select which active catalog products will be displayed on the homepage showcase panel (Maximum recommended: 3).
                </p>
              </div>

              {!Array.isArray(products) || products.length === 0 ? (
                <p className="text-xs font-semibold text-brand-earth/40 italic py-6 text-center">No products currently available in active catalog.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4 max-h-[320px] overflow-y-auto pr-1">
                  {products.map(prod => {
                    const isSelected = Array.isArray(formData.featured_products) && formData.featured_products.includes(prod.id!);
                    return (
                      <div 
                        key={prod.id}
                        onClick={() => toggleFeaturedProduct(prod.id!)}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                          isSelected 
                            ? 'bg-brand-green/5 border-brand-green' 
                            : 'bg-gray-50 border-gray-100 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden relative shrink-0">
                          <Image
                            src={prod.image_url || '/hero.png'}
                            alt={prod.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black truncate leading-tight">{prod.name}</p>
                          <p className="text-[9px] font-semibold text-brand-earth/50">₱{prod.price}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected 
                            ? 'bg-brand-green border-brand-green text-white' 
                            : 'border-gray-300 bg-white'
                        }`}>
                          {isSelected && <span className="text-[8px] font-bold">✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 4. ANNOUNCEMENT TAB */}
          {activeSubTab === 'announcement' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="announcement_enabled"
                    checked={formData.announcement_enabled}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 accent-brand-green rounded border-gray-200 cursor-pointer"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Enable Top Promo Banner
                  </span>
                </label>
                <p className="text-[9px] text-brand-earth/50 leading-relaxed">
                  Toggle on to display a prominent promotional message strip at the absolute top of the public landing page.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                  Banner Text Message
                </label>
                <textarea
                  rows={2}
                  name="announcement_text"
                  value={formData.announcement_text}
                  onChange={handleInputChange}
                  disabled={!formData.announcement_enabled}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all leading-relaxed disabled:opacity-50"
                  placeholder="e.g. Free delivery on orders over ₱500 this weekend!"
                />
              </div>
            </div>
          )}

          {/* 5. LAYOUT & FOOTER TAB */}
          {activeSubTab === 'layout' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="p-4 rounded-xl bg-brand-green/5 border border-brand-green/10 flex items-start gap-3">
                <Globe size={18} className="text-brand-green mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-green">Global Layout & Branding Controls</p>
                  <p className="text-[9px] text-brand-earth/60 leading-relaxed font-normal">
                    Administrate the brand narrative, trust badges header, and primary footer configuration copy displayed across the public experience.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                  Trust Section Title
                </label>
                <input
                  type="text"
                  name="trust_title"
                  value={formData.trust_title || ''}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                  placeholder="e.g. The Fastest Growing Pastil Brand."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                  Trust Section Subtitle
                </label>
                <textarea
                  rows={2}
                  name="trust_subtitle"
                  value={formData.trust_subtitle || ''}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all resize-none"
                  placeholder="e.g. Join our mission to bring Mindanao's finest..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                  Footer Brand Description
                </label>
                <textarea
                  rows={2}
                  name="footer_desc"
                  value={formData.footer_desc || ''}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all resize-none"
                  placeholder="e.g. Bringing authentic Mindanao flavors..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">
                  Footer Copyright Line (HTML Entities Allowed)
                </label>
                <input
                  type="text"
                  name="footer_copyright"
                  value={formData.footer_copyright || ''}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                  placeholder="e.g. &amp;copy; 2026 Pastil ni Liling..."
                />
              </div>
            </div>
          )}

          {/* 6. FRANCHISE PAGE TAB */}
          {activeSubTab === 'franchise' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-4 rounded-xl bg-brand-yellow/5 border border-brand-yellow/10 flex items-start gap-3">
                <Briefcase size={18} className="text-brand-yellow mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-yellow">Franchise Program Controls</p>
                  <p className="text-[9px] text-brand-earth/60 leading-relaxed font-normal">
                    Administrate the taglines, headings, marketing highlights, and milestone counters displayed on the public Franchise Application portal.
                  </p>
                </div>
              </div>

              {/* Sub-section: Hero Block */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-brand-green border-b border-gray-50 pb-2">1. Hero Section</h3>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">Tagline Badge</label>
                  <input
                    type="text"
                    name="franchise_badge"
                    value={formData.franchise_badge || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                    placeholder="e.g. Business Opportunity"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">Heading Title (White Text)</label>
                    <input
                      type="text"
                      name="franchise_title_white"
                      value={formData.franchise_title_white || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                      placeholder="e.g. Grow with"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">Heading Title (Green Text)</label>
                    <input
                      type="text"
                      name="franchise_title_green"
                      value={formData.franchise_title_green || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                      placeholder="e.g. Pastil ni Liling."
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">Hero Subtitle</label>
                  <textarea
                    rows={3}
                    name="franchise_subtitle"
                    value={formData.franchise_subtitle || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all leading-relaxed"
                    placeholder="Describe your franchise offering..."
                  />
                </div>
              </div>

              {/* Sub-section: Benefits Grid */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-brand-green border-b border-gray-50 pb-2">2. Dynamic Benefit Highlights</h3>
                
                {/* Benefit 1 */}
                <div className="grid md:grid-cols-3 gap-4 items-start">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/60">Highlight 1 Title</label>
                    <input
                      type="text"
                      name="franchise_benefit1_title"
                      value={formData.franchise_benefit1_title || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                      placeholder="e.g. Low Capital"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/60">Highlight 1 Description</label>
                    <input
                      type="text"
                      name="franchise_benefit1_desc"
                      value={formData.franchise_benefit1_desc || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                      placeholder="Low Capital Description..."
                    />
                  </div>
                </div>

                {/* Benefit 2 */}
                <div className="grid md:grid-cols-3 gap-4 items-start">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/60">Highlight 2 Title</label>
                    <input
                      type="text"
                      name="franchise_benefit2_title"
                      value={formData.franchise_benefit2_title || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                      placeholder="e.g. Proven System"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/60">Highlight 2 Description</label>
                    <input
                      type="text"
                      name="franchise_benefit2_desc"
                      value={formData.franchise_benefit2_desc || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                      placeholder="Proven System Description..."
                    />
                  </div>
                </div>

                {/* Benefit 3 */}
                <div className="grid md:grid-cols-3 gap-4 items-start">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/60">Highlight 3 Title</label>
                    <input
                      type="text"
                      name="franchise_benefit3_title"
                      value={formData.franchise_benefit3_title || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                      placeholder="e.g. High Demand"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/60">Highlight 3 Description</label>
                    <input
                      type="text"
                      name="franchise_benefit3_desc"
                      value={formData.franchise_benefit3_desc || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                      placeholder="High Demand Description..."
                    />
                  </div>
                </div>

                {/* Benefit 4 */}
                <div className="grid md:grid-cols-3 gap-4 items-start">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/60">Highlight 4 Title</label>
                    <input
                      type="text"
                      name="franchise_benefit4_title"
                      value={formData.franchise_benefit4_title || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                      placeholder="e.g. Marketing Power"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/60">Highlight 4 Description</label>
                    <input
                      type="text"
                      name="franchise_benefit4_desc"
                      value={formData.franchise_benefit4_desc || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                      placeholder="Marketing Power Description..."
                    />
                  </div>
                </div>
              </div>

              {/* Sub-section: Milestones & Copyright */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-brand-green border-b border-gray-50 pb-2">3. Milestones & Footer</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">Milestone Counter Title</label>
                    <input
                      type="text"
                      name="franchise_milestone_title"
                      value={formData.franchise_milestone_title || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                      placeholder="e.g. 50+ Branches"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">Milestone Subtitle Description</label>
                    <input
                      type="text"
                      name="franchise_milestone_desc"
                      value={formData.franchise_milestone_desc || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                      placeholder="e.g. And growing rapidly nationwide."
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-brand-earth/60">Portal Copyright line</label>
                  <input
                    type="text"
                    name="franchise_footer_copyright"
                    value={formData.franchise_footer_copyright || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                    placeholder="e.g. &amp;copy; 2026 Pastil ni Liling Franchise Program..."
                  />
                </div>
              </div>
            </div>
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
          <footer className="pt-4 border-t border-gray-50 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-earth text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-green transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
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
      <div className="lg:col-span-5 hidden md:flex flex-col items-center sticky top-24 select-none">
        <div className="w-full text-center space-y-1.5 mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-earth/40 flex items-center justify-center gap-1.5">
            <Eye size={12} weight="fill" className="text-brand-green" />
            Live Preview Mockup
          </p>
          <p className="text-[8px] font-medium text-brand-earth/30 uppercase tracking-widest leading-none">
            Reflects edits dynamically in real-time
          </p>
        </div>

        {/* PREVIEW MODE TOGGLE SWITCH (GLASSMORPHIC) */}
        <div className="flex bg-gray-100/80 backdrop-blur-md p-1 rounded-xl border border-gray-200/50 mb-4 select-none self-center shadow-sm">
          <button
            type="button"
            onClick={() => setPreviewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
              previewMode === 'mobile'
                ? 'bg-white text-brand-green shadow-sm'
                : 'text-brand-earth/40 hover:text-brand-earth'
            }`}
          >
            <DeviceMobile size={13} weight={previewMode === 'mobile' ? 'fill' : 'bold'} />
            Mobile
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
              previewMode === 'desktop'
                ? 'bg-white text-brand-green shadow-sm'
                : 'text-brand-earth/40 hover:text-brand-earth'
            }`}
          >
            <Monitor size={13} weight={previewMode === 'desktop' ? 'fill' : 'bold'} />
            Desktop
          </button>
        </div>

        {previewMode === 'mobile' ? (
          /* PHONE CASE CONTAINER */
          <div className="relative w-[280px] h-[560px] bg-brand-earth rounded-[2.5rem] border-8 border-brand-earth shadow-2xl overflow-hidden flex flex-col ring-4 ring-white/30 transition-all duration-300 animate-in zoom-in-95 duration-200">
            {/* Dynamic Top Announcement Strip */}
            {formData.announcement_enabled && formData.announcement_text && (
              <div className="bg-brand-yellow text-brand-earth text-[7px] font-bold py-1.5 px-3 text-center truncate leading-none select-none">
                {formData.announcement_text}
              </div>
            )}

            {/* Virtual Browser Top */}
            <div className="bg-white/95 px-4 py-2 border-b border-gray-100 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-brand-green/10 flex items-center justify-center">
                  <span className="text-[5px] font-black text-brand-green">HQ</span>
                </div>
                <span className="text-[6px] font-black uppercase tracking-tighter">Liling's Pastil</span>
              </div>
              <div className="flex gap-2">
                <span className="w-2.5 h-1 bg-brand-earth/10 rounded-full" />
                <span className="w-2.5 h-1 bg-brand-earth/10 rounded-full" />
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
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-green/5 border border-brand-green/10 text-[6px] font-bold uppercase tracking-wider text-brand-green">
                      <span className="w-1 rounded-full bg-brand-green aspect-square"></span>
                      {formData.hero_badge || 'Sarap na Babalik-balikan'}
                    </div>
                    
                    <h1 className="text-xl font-extrabold tracking-tight leading-none">
                      {formData.hero_title_white ? (
                        formData.hero_title_white.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)
                      ) : (
                        <span>Mindanao's finest<br/>delivered to your<br/></span>
                      )}
                      <span className="text-brand-green">{formData.hero_title_green || 'doorstep.'}</span>
                    </h1>

                    <p className="text-[8px] text-brand-earth/50 leading-relaxed font-medium">
                      {formData.hero_subtitle || 'Experience authentic flavors crafted with tradition...'}
                    </p>

                    <div className="flex gap-2 pt-2">
                      <span className="bg-brand-green text-white px-4 py-2 rounded-full text-[6px] font-black uppercase tracking-wider text-center shadow-md">
                        {formData.hero_cta_text || 'Explore Catalog'}
                      </span>
                      <span className="bg-white border border-gray-200 text-brand-earth px-4 py-2 rounded-full text-[6px] font-black uppercase tracking-wider text-center">
                        Franchise
                      </span>
                    </div>
                  </div>

                  {/* SHOWCASE CAROUSEL CONTAINER */}
                  <div className="p-4 bg-white border-b border-gray-50 select-none space-y-3">
                    <p className="text-[7px] font-bold text-brand-green uppercase tracking-wider leading-none">Featured Catalog</p>
                    
                    <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide select-none">
                      {!Array.isArray(formData.featured_products) || formData.featured_products.length === 0 ? (
                        <p className="text-[7px] font-semibold text-brand-earth/40 italic py-2">Catalog empty.</p>
                      ) : (
                        formData.featured_products.map((id, index) => {
                          const prod = Array.isArray(products) ? products.find(p => p.id === id) : undefined;
                          if (!prod) return null;
                          return (
                            <div key={id} className="w-[85px] bg-gray-50 border border-gray-100 rounded-xl p-1.5 shrink-0 space-y-1 select-none">
                              <div className="aspect-[4/3] rounded-lg bg-gray-200 relative overflow-hidden">
                                <Image
                                  src={prod.image_url || '/hero.png'}
                                  alt={prod.name}
                                  fill
                                  className="object-cover opacity-80"
                                />
                              </div>
                              <p className="text-[6px] font-black truncate leading-tight mt-0.5">{prod.name}</p>
                              <p className="text-[6px] font-black text-brand-green leading-none">₱{prod.price}</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* BRAND TRUST TITLE & SUBTITLE */}
                  <div className="py-6 px-4 text-center space-y-2 select-none bg-[#fafafa] border-b border-gray-100">
                    <h2 className="text-[9px] font-extrabold tracking-tight text-brand-earth">
                      {formData.trust_title || 'The Fastest Growing Pastil Brand.'}
                    </h2>
                    <p className="text-[6.5px] text-brand-earth/50 max-w-[200px] mx-auto leading-relaxed font-medium">
                      {formData.trust_subtitle || "Join our mission to bring Mindanao's finest to every Filipino table through our expanding franchise network."}
                    </p>
                  </div>

                  {/* TRUST STATISTICS */}
                  <div className="py-6 px-4 text-center space-y-4 select-none bg-[#fafafa]">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Active Branches", value: formData.stats_branches || "50+" },
                        { label: "Daily Orders", value: formData.stats_orders || "5,000+" },
                        { label: "Cities Reached", value: formData.stats_cities || "20+" },
                        { label: "Franchise Apps", value: formData.stats_applications || "200+" },
                      ].map((stat, idx) => (
                        <div key={idx} className="space-y-0.5 select-none bg-white p-2.5 rounded-2xl border border-gray-100 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                          <div className="text-[9px] font-black tracking-tighter text-brand-earth">{stat.value}</div>
                          <div className="text-[4px] font-bold uppercase tracking-wider text-brand-earth/40 leading-none">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MOBILE FOOTER SECTION */}
                  <div className="bg-white p-4 space-y-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-brand-earth/10 flex items-center justify-center">
                        <span className="text-[4px] font-black text-brand-earth">PL</span>
                      </div>
                      <span className="text-[6px] font-black uppercase tracking-tighter">Pastil ni Liling</span>
                    </div>
                    <p className="text-[5.5px] text-brand-earth/50 leading-relaxed font-medium">
                      {formData.footer_desc || 'Bringing authentic Mindanao flavors to the mainstream. Quality you can trust, prices you can afford.'}
                    </p>
                    
                    <div className="pt-3 border-t border-gray-50 text-center">
                      <p 
                        className="text-[4.5px] font-bold uppercase tracking-widest text-brand-earth/30 leading-normal"
                        dangerouslySetInnerHTML={{ __html: formData.footer_copyright || '&copy; 2026 Pastil ni Liling. Swak sa Bulsa...' }}
                      />
                    </div>
                  </div>
                </>
              )}  </div>
          </div>
        ) : (
          /* DESKTOP BROWSER CONTAINER */
          <div className="relative w-full max-w-[460px] h-[560px] bg-white rounded-3xl border border-gray-200/80 shadow-2xl overflow-hidden flex flex-col ring-4 ring-white/30 transition-all duration-300 animate-in zoom-in-95 duration-200">
            {/* Dynamic Top Announcement Strip */}
            {formData.announcement_enabled && formData.announcement_text && (
              <div className="bg-brand-yellow text-brand-earth text-[7px] font-bold py-1.5 px-3 text-center truncate leading-none select-none">
                {formData.announcement_text}
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
              <div className="bg-white/80 border border-gray-200 rounded-md py-0.5 px-6 text-[6px] text-brand-earth/50 w-1/2 text-center select-none truncate">
                http://pastilnililing.ph
              </div>
              {/* Action buttons */}
              <div className="flex gap-2">
                <span className="w-2.5 h-1 bg-brand-earth/10 rounded-full" />
              </div>
                      {/* Device Mockup Scrollable Web Page View */}
            <div className="flex-1 bg-[#fafafa] overflow-y-auto scrollbar-hide text-brand-earth text-left select-none relative animate-in fade-in duration-500">
              {activeSubTab === 'franchise' ? (
                /* FRANCHISE PORTAL DESKTOP VIEW */
                <div className="space-y-0.5 animate-in fade-in duration-300">
                  {/* NAVBAR */}
                  <div className="bg-white/85 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between shrink-0 select-none">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
                        <span className="text-[5px] font-black text-brand-green">HQ</span>
                      </div>
                      <span className="text-[7px] font-black uppercase tracking-tighter">Liling's Pastil</span>
                    </div>
                    <div className="flex gap-3 text-[6px] font-bold uppercase tracking-wider text-brand-earth/50">
                      <span>Menu</span>
                      <span className="text-brand-green font-black">Franchise</span>
                      <span>Store</span>
                    </div>
                  </div>

                  <div className="p-5 grid grid-cols-12 gap-5 items-start bg-white border-b border-gray-100">
                    <div className="col-span-6 space-y-3">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[5px] font-bold uppercase tracking-wider text-brand-yellow">
                        <span className="w-1 rounded-full bg-brand-yellow animate-pulse"></span>
                        {formData.franchise_badge || 'Business Opportunity'}
                      </div>
                      
                      <h1 className="text-xs font-extrabold tracking-tight leading-tight">
                        {formData.franchise_title_white || 'Grow with'}<br/>
                        <span className="text-brand-green">{formData.franchise_title_green || 'Pastil ni Liling.'}</span>
                      </h1>

                      <p className="text-[7px] text-brand-earth/50 leading-relaxed font-medium">
                        {formData.franchise_subtitle || 'Be part of the Philippines fastest-growing pastil brand...'}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {[
                          { title: formData.franchise_benefit1_title || 'Low Capital', desc: formData.franchise_benefit1_desc || 'Minimal overhead setup.' },
                          { title: formData.franchise_benefit2_title || 'Proven System', desc: formData.franchise_benefit2_desc || 'Operational training.' },
                          { title: formData.franchise_benefit3_title || 'High Demand', desc: formData.franchise_benefit3_desc || 'beloved staple favorite.' },
                          { title: formData.franchise_benefit4_title || 'Marketing Power', desc: formData.franchise_benefit4_desc || 'brand awareness.' },
                        ].map((item, idx) => (
                          <div key={idx} className="space-y-0.5 border-l border-brand-green/20 pl-1.5 animate-in fade-in duration-300">
                            <h4 className="text-[5.5px] font-black uppercase tracking-wider leading-none">{item.title}</h4>
                            <p className="text-[4.5px] text-brand-earth/40 leading-normal">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-6 bg-gray-50/50 rounded-xl border border-gray-100 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                        <span className="text-[5px] font-bold text-brand-green uppercase tracking-widest">Step 1 of 3</span>
                        <span className="text-[4px] font-bold text-brand-earth/30 uppercase tracking-widest">Personal Details</span>
                      </div>

                      <div className="space-y-1">
                        <div className="h-5 bg-white border border-gray-100 rounded-md px-2 flex items-center">
                          <span className="text-[5px] font-bold text-brand-earth/30">First Name</span>
                        </div>
                        <div className="h-5 bg-white border border-gray-100 rounded-md px-2 flex items-center">
                          <span className="text-[5px] font-bold text-brand-earth/30">Last Name</span>
                        </div>
                      </div>

                      <button className="w-full bg-brand-earth text-white py-1.5 rounded-full text-[5.5px] font-black uppercase tracking-widest leading-none">
                        Continue
                      </button>
                    </div>
                  </div>

                  <div className="m-5 p-4 bg-brand-earth rounded-2xl text-white relative overflow-hidden">
                    <p className="text-sm font-black tracking-tight mb-0.5 leading-none">{formData.franchise_milestone_title || '50+ Branches'}</p>
                    <p className="text-[5px] font-bold uppercase tracking-widest opacity-60 leading-none">{formData.franchise_milestone_desc || 'And growing rapidly nationwide.'}</p>
                  </div>

                  <div className="py-6 border-t border-gray-100 text-center bg-[#fafafa]">
                    <p 
                      className="text-[5px] font-bold uppercase tracking-widest text-brand-earth/30 leading-normal"
                      dangerouslySetInnerHTML={{ __html: formData.franchise_footer_copyright || '&copy; 2026 Pastil ni Liling...' }}
                    />
                  </div>
                </div>
              ) : (
                /* LANDING HOME DESKTOP VIEW */
                <>
                  {/* NAVBAR */}
                  <div className="bg-white/85 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between shrink-0 select-none">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
                        <span className="text-[5px] font-black text-brand-green">HQ</span>
                      </div>
                      <span className="text-[7px] font-black uppercase tracking-tighter">Liling's Pastil</span>
                    </div>
                    <div className="flex gap-3 text-[6px] font-bold uppercase tracking-wider text-brand-earth/50">
                      <span>Menu</span>
                      <span>Franchise</span>
                      <span>Store</span>
                    </div>
                  </div>

                  {/* HERO SECTION */}
                  <div className="px-5 pt-8 pb-10 border-b border-gray-100 bg-white select-none">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-7 space-y-3">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-green/5 border border-brand-green/10 text-[5px] font-bold uppercase tracking-wider text-brand-green">
                          <span className="w-1 rounded-full bg-brand-green aspect-square"></span>
                          {formData.hero_badge || 'Sarap na Babalik-balikan'}
                        </div>
                        
                        <h1 className="text-xs font-extrabold tracking-tight leading-tight">
                          {formData.hero_title_white ? (
                            formData.hero_title_white.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)
                          ) : (
                            <span>Mindanao's finest<br/>delivered to your<br/></span>
                          )}
                          <span className="text-brand-green">{formData.hero_title_green || 'doorstep.'}</span>
                        </h1>

                        <p className="text-[7px] text-brand-earth/50 leading-relaxed font-medium">
                          {formData.hero_subtitle || 'Experience authentic flavors crafted with tradition...'}
                        </p>

                        <div className="flex gap-2 pt-1">
                          <span className="bg-brand-green text-white px-3 py-1.5 rounded-full text-[5px] font-black uppercase tracking-wider text-center shadow-md">
                            {formData.hero_cta_text || 'Explore Catalog'}
                          </span>
                          <span className="bg-white border border-gray-200 text-brand-earth px-3 py-1.5 rounded-full text-[5px] font-black uppercase tracking-wider text-center">
                            Franchise
                          </span>
                        </div>
                      </div>
                      
                      {/* Floating Image mockup */}
                      <div className="col-span-5 relative rounded-2xl overflow-hidden shadow-md aspect-square bg-gray-50 border border-gray-100">
                        <Image 
                          src="/hero.png" 
                          alt="Hero" 
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SHOWCASE SECTION */}
                  <div className="p-5 bg-white border-b border-gray-50 select-none space-y-3">
                    <p className="text-[7px] font-bold text-brand-green uppercase tracking-wider leading-none">Featured Catalog</p>
                    
                    <div className="grid grid-cols-3 gap-2 pb-1 select-none">
                      {!Array.isArray(formData.featured_products) || formData.featured_products.length === 0 ? (
                        <p className="text-[7px] font-semibold text-brand-earth/40 italic py-2 col-span-3">Catalog empty.</p>
                      ) : (
                        formData.featured_products.map((id, index) => {
                          const prod = Array.isArray(products) ? products.find(p => p.id === id) : undefined;
                          if (!prod) return null;
                          return (
                            <div key={id} className="bg-gray-50 border border-gray-100 rounded-lg p-1 space-y-1 select-none">
                              <div className="aspect-[4/3] rounded-md bg-gray-200 relative overflow-hidden">
                                <Image
                                  src={prod.image_url || '/hero.png'}
                                  alt={prod.name}
                                  fill
                                  className="object-cover opacity-80"
                                />
                              </div>
                              <p className="text-[5px] font-black truncate leading-tight mt-0.5">{prod.name}</p>
                              <p className="text-[5px] font-black text-brand-green leading-none">₱{prod.price}</p>
                            </div>
                          );
                        })
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
                        <div key={idx} className="space-y-0.5 select-none bg-white p-2 rounded-xl border border-gray-100 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                          <div className="text-[9px] font-black tracking-tighter text-brand-earth">{stat.value}</div>
                          <div className="text-[4px] font-bold uppercase tracking-wider text-brand-earth/40 leading-none">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="bg-white px-5 py-6 space-y-4 text-[6px]">
                    <div className="grid grid-cols-3 gap-4 items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-brand-earth/10 flex items-center justify-center shrink-0">
                            <span className="text-[4px] font-black text-brand-earth">PL</span>
                          </div>
                          <span className="text-[6px] font-black uppercase tracking-tighter">Pastil ni Liling</span>
                        </div>
                        <p className="text-[5px] text-brand-earth/50 leading-relaxed font-medium">
                          {formData.footer_desc || 'Bringing authentic Mindanao flavors to the mainstream. Quality you can trust, prices you can afford.'}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-[5px] font-bold uppercase tracking-widest text-brand-earth/80">Platform</h4>
                        <ul className="space-y-1 text-brand-earth/40 font-semibold">
                          <li>Menu</li>
                          <li>Franchise</li>
                          <li>Store</li>
                        </ul>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-[5px] font-bold uppercase tracking-widest text-brand-earth/80">Support</h4>
                        <ul className="space-y-1 text-brand-earth/40 font-semibold">
                          <li>Help Center</li>
                          <li>Terms of Use</li>
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-50 text-center">
                      <p 
                        className="text-[5px] font-bold uppercase tracking-widest text-brand-earth/30 leading-normal"
                        dangerouslySetInnerHTML={{ __html: formData.footer_copyright || '&copy; 2026 Pastil ni Liling. Swak sa Bulsa...' }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>      </div>
          </div>
        )}
      </div>
    </div>
  );
}
