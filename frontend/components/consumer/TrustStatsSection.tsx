'use client';

import React from 'react';

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
    { label: "Active Branches", value: stats.branches || "50+" },
    { label: "Daily Orders", value: stats.orders || "5,000+" },
    { label: "Cities Reached", value: stats.cities || "20+" },
    { label: "Franchise Apps", value: stats.applications || "150+" },
  ];

  return (
    <section className="py-24 md:py-40 bg-brand-gray/30 shrink-0">
      <div className="max-w-6xl mx-auto px-6 text-center space-y-20">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-brand-earth">{title}</h2>
          <p className="text-sm md:text-base text-brand-earth/50 max-w-lg mx-auto font-medium leading-relaxed">
            {subtitle.includes("Mindanao's") ? (
              <>Join our mission to bring Mindanao&apos;s finest to every Filipino table through our expanding franchise network.</>
            ) : (
              subtitle
            )}
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {statItems.map((stat, idx) => (
            <div key={idx} className="space-y-1 hover:-translate-y-2 transition-transform duration-500 cursor-default">
              <div className="text-3xl md:text-4xl font-black tracking-tighter text-brand-earth">{stat.value}</div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
