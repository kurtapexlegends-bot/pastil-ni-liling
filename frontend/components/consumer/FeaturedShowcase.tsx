'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';

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
    <section className="bg-white py-16 md:py-24 border-y border-gray-100 overflow-hidden shrink-0">
      <div className="max-w-6xl mx-auto px-6 space-y-10">
        
        {/* Header with Title and CTA */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-[10px] font-bold text-brand-green uppercase tracking-widest bg-brand-green/10 px-2.5 py-1 rounded-md inline-block">
              Best Sellers
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-brand-earth font-display">
              Signature Favorites
            </h2>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-green hover:text-brand-earth transition-colors min-h-[44px] cursor-pointer"
          >
            <span>Explore All Dishes</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>

        {/* Carousel / Grid of Items */}
        <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-6 md:gap-8 pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
          {items.map((item, idx) => (
            <Link 
              href="/menu"
              key={idx} 
              className="space-y-4 group cursor-pointer w-[85vw] md:w-auto shrink-0 snap-center animate-in slide-in-from-bottom fade-in duration-700 fill-mode-both block"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="aspect-4/3 rounded-3xl bg-gray-50 overflow-hidden relative border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1">
                <Image 
                  src={item.image_url} 
                  alt={item.subtitle} 
                  fill 
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-all duration-500" 
                  priority={idx === 0}
                  loading={idx === 0 ? "eager" : "lazy"}
                />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-black text-brand-earth shadow-sm">
                  {item.price}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-green">{item.title}</div>
                <h3 className="text-lg font-bold tracking-tight text-brand-earth group-hover:text-brand-green transition-colors">{item.subtitle}</h3>
                <p className="text-xs text-brand-earth/60 font-medium leading-relaxed line-clamp-2">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
