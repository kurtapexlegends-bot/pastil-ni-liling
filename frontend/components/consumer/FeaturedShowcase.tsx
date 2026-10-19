'use client';

import React from 'react';
import Image from 'next/image';

export interface ShowcaseItem {
  title: string;
  subtitle: string;
  desc: string;
  price: string;
  image_url: string;
}

export interface FeaturedShowcaseProps {
  items: ShowcaseItem[];
}

export default function FeaturedShowcase({ items }: FeaturedShowcaseProps) {
  return (
    <section className="bg-white py-20 md:py-32 border-y border-gray-100 overflow-hidden shrink-0">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center md:text-left">
          <p className="text-xs font-bold text-brand-green uppercase tracking-widest leading-none">Featured Catalog</p>
        </div>
        <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-6 md:gap-12 pb-8 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
          {items.map((item, idx) => (
            <div 
              key={idx} 
              className="space-y-6 group cursor-pointer w-[85vw] md:w-auto shrink-0 snap-center animate-in slide-in-from-bottom fade-in duration-1000 fill-mode-both"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="aspect-[4/3] rounded-3xl bg-gray-50 overflow-hidden relative border border-gray-100 shadow-sm transition-all group-hover:shadow-md">
                <Image 
                  src={item.image_url} 
                  alt={item.subtitle} 
                  fill 
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-all duration-500 opacity-80 group-hover:opacity-100" 
                  priority={idx === 0}
                  loading={idx === 0 ? "eager" : "lazy"}
                />
              </div>
              <div className="space-y-2">
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-green">{item.title}</div>
                <h3 className="text-xl font-extrabold tracking-tight">{item.subtitle}</h3>
                <p className="text-sm text-brand-earth/50 font-medium leading-relaxed">{item.desc}</p>
                <div className="text-xs font-bold pt-2">{item.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
