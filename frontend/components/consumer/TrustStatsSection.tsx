'use client';

import React from 'react';
import { Storefront, CookingPot, Buildings, Users } from '@phosphor-icons/react';

export interface TrustStatsSectionProps {
  title?: string;
  subtitle?: string;
  stats: {
    branches?: string;
    orders?: string;
    cities?: string;
    applications?: string;
  };
}

export default function TrustStatsSection({
  title = 'The Fastest Growing Pastil Brand.',
  subtitle = "Join our mission to bring Mindanao's finest to every Filipino table through our expanding franchise network.",
  stats
}: TrustStatsSectionProps) {
  const statItems = [
    { label: "Active Hubs", value: stats.branches || "2 Hubs", icon: Storefront, detail: "QC & Caloocan 24/7" },
    { label: "Pastil Meals Served", value: stats.orders || "10,000+", icon: CookingPot, detail: "Fresh daily batch" },
    { label: "Coverage Reach", value: stats.cities || "Metro Manila", icon: Buildings, detail: "Express direct & delivery apps" },
    { label: "Franchise Inquiries", value: stats.applications || "100+", icon: Users, detail: "High-return franchise system" },
  ];

  return (
    <section className="py-16 md:py-24 bg-brand-gray/40 shrink-0 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 text-center space-y-12">
        <div className="space-y-3 max-w-xl mx-auto">
          <span className="text-[10px] font-bold text-brand-green uppercase tracking-widest bg-brand-green/10 px-2.5 py-1 rounded-md inline-block">
            Proven Operations
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-brand-earth font-display">{title}</h2>
          <p className="text-xs md:text-sm text-brand-earth/60 font-medium leading-relaxed">
            {subtitle.includes("Mindanao's") ? (
              <>Join our mission to bring Mindanao&apos;s finest to every Filipino table through our expanding franchise network.</>
            ) : (
              subtitle
            )}
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {statItems.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div 
                key={idx} 
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left space-y-3 flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0">
                  <IconComponent size={20} weight="bold" />
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-black tracking-tight text-brand-earth leading-none">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-brand-earth/50 mt-1">
                    {stat.label}
                  </div>
                  <div className="text-[9px] text-brand-green font-semibold mt-0.5">
                    {stat.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
