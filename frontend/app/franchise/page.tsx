"use client";

import useSWR from "swr";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FranchiseIntakeForm from "@/components/franchise/FranchiseIntakeForm";
import { 
  Coins, 
  Briefcase, 
  ShieldCheck,
  Megaphone
} from "@phosphor-icons/react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface SiteSettings {
  franchise_badge: string;
  franchise_title_white: string;
  franchise_title_green: string;
  franchise_subtitle: string;
  franchise_benefit1_title: string;
  franchise_benefit1_desc: string;
  franchise_benefit2_title: string;
  franchise_benefit2_desc: string;
  franchise_benefit3_title: string;
  franchise_benefit3_desc: string;
  franchise_benefit4_title: string;
  franchise_benefit4_desc: string;
  franchise_milestone_title: string;
  franchise_milestone_desc: string;
  franchise_footer_copyright: string;
}

export default function FranchisePage() {
  const { data: settingsRes } = useSWR("http://127.0.0.1:8000/api/website-settings", fetcher);

  const defaults: SiteSettings = {
    franchise_badge: 'Business Opportunity',
    franchise_title_white: 'Grow with',
    franchise_title_green: 'Pastil ni Liling.',
    franchise_subtitle: "Be part of the Philippines' fastest-growing pastil brand. Low investment, high returns, and a product Filipinos love.",
    franchise_benefit1_title: 'Low Capital',
    franchise_benefit1_desc: 'Start your business journey with minimal overhead and rapid startup times.',
    franchise_benefit2_title: 'Proven System',
    franchise_benefit2_desc: 'Complete operational training, kitchen blueprints, and staff management support.',
    franchise_benefit3_title: 'High Demand',
    franchise_benefit3_desc: 'Pastil is a beloved staple food favorite that sells consistently 24/7.',
    franchise_benefit4_title: 'Marketing Power',
    franchise_benefit4_desc: 'National brand awareness campaigns and localized digital marketing support.',
    franchise_milestone_title: '50+ Branches',
    franchise_milestone_desc: 'And growing rapidly nationwide.',
    franchise_footer_copyright: '&copy; 2026 Pastil ni Liling Franchise Program. Swak sa Bulsa, Sarap na Babalik-balikan.'
  };

  const settings: SiteSettings = settingsRes?.success ? settingsRes.data : defaults;

  return (
    <div className="min-h-screen bg-background font-sans text-brand-earth selection:bg-brand-yellow/30 flex flex-col justify-between">
      <Navbar variant="franchise" />

      <main className="pt-28 pb-20 px-6 max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start w-full">
        {/* Info Side */}
        <div className="space-y-8 lg:sticky lg:top-28">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[9px] font-bold uppercase tracking-wider text-brand-yellow">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse"></span>
              {settings.franchise_badge}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-brand-earth leading-[1.1] font-display">
              {settings.franchise_title_white} <br />
              <span className="text-brand-green">{settings.franchise_title_green}</span>
            </h1>
            <p className="text-sm text-brand-earth/60 font-medium leading-relaxed max-w-md">
              {settings.franchise_subtitle}
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid sm:grid-cols-2 gap-8">
            {[
              { 
                title: settings.franchise_benefit1_title, 
                desc: settings.franchise_benefit1_desc, 
                icon: Coins 
              },
              { 
                title: settings.franchise_benefit2_title, 
                desc: settings.franchise_benefit2_desc, 
                icon: Briefcase 
              },
              { 
                title: settings.franchise_benefit3_title, 
                desc: settings.franchise_benefit3_desc, 
                icon: ShieldCheck 
              },
              { 
                title: settings.franchise_benefit4_title, 
                desc: settings.franchise_benefit4_desc, 
                icon: Megaphone 
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-green/10 flex items-center justify-center shrink-0 border border-brand-green/20">
                    <Icon size={16} className="text-brand-green" weight="duotone" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-earth">{item.title}</h3>
                    <p className="text-[11px] text-brand-earth/50 leading-relaxed font-normal">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Branch Milestones Card */}
          <div className="p-6 bg-brand-earth rounded-3xl text-white relative overflow-hidden shadow-sm premium-shadow">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/20 blur-3xl rounded-full"></div>
             <p className="text-3xl font-extrabold tracking-tight mb-1 font-display">{settings.franchise_milestone_title}</p>
             <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">{settings.franchise_milestone_desc}</p>
          </div>
        </div>

        {/* Form Side - Modular FranchiseIntakeForm */}
        <FranchiseIntakeForm />
      </main>

      {/* Footer - Elegant & Informative */}
      <Footer />
    </div>
  );
}
