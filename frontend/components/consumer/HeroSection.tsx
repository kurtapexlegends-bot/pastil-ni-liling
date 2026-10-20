'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, CookingPot } from '@phosphor-icons/react';

export interface HeroSectionProps {
  badge?: string;
  titleWhite?: string;
  titleGreen?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function HeroSection({
  badge = 'Sarap na Babalik-balikan',
  titleWhite = '',
  titleGreen = 'doorstep.',
  subtitle = 'Experience authentic Maguindanaon chicken and beef pastil...',
  ctaText = 'Order Online Now',
  ctaLink = '/menu',
}: HeroSectionProps) {
  return (
    <main className="pt-20 pb-16 md:pt-24 md:pb-24 px-6 flex-1">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/5 border border-brand-green/10 text-[9px] font-bold uppercase tracking-widest text-brand-green">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span>
            {badge}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-brand-earth">
            {titleWhite ? (
              titleWhite.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)
            ) : (
              <>Mindanao&apos;s finest <br /> delivered to your <br /></>
            )}
            <span className="text-brand-green">{titleGreen}</span>
          </h1>

          <p className="text-base md:text-lg text-brand-earth/60 max-w-md font-medium leading-relaxed">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              href={ctaLink || '/menu'} 
              className="bg-brand-green text-white px-8 py-4 min-h-[44px] rounded-full text-xs font-bold uppercase tracking-widest shadow-xl shadow-brand-green/20 hover:shadow-brand-green/40 transition-all text-center flex items-center justify-center cursor-pointer"
            >
              {ctaText}
            </Link>
            <Link 
              href="/franchise" 
              className="bg-white border border-gray-200 text-brand-earth px-8 py-4 min-h-[44px] rounded-full text-xs font-bold uppercase tracking-widest hover:border-brand-yellow hover:bg-brand-yellow/5 transition-all text-center flex items-center justify-center cursor-pointer"
            >
              Franchise Inquiry
            </Link>
          </div>

          <div className="flex items-center gap-4 pt-6">
            <div className="flex items-center gap-1.5 bg-brand-yellow/15 text-brand-yellow px-3 py-1.5 rounded-xl border border-brand-yellow/30">
              <Star size={16} weight="fill" />
              <span className="text-xs font-black text-brand-earth">4.9 / 5.0</span>
            </div>
            <p className="text-[10px] font-bold text-brand-earth/50 uppercase tracking-wider leading-tight">
              Trusted by <span className="text-brand-earth font-black">10,000+</span> Customers <br />
              <span className="text-brand-green font-semibold">Cubao & Caloocan Hubs</span>
            </p>
          </div>
        </div>

        <div className="relative group animate-in fade-in zoom-in duration-1000 delay-200">
          <div className="absolute inset-0 bg-brand-yellow/20 rounded-[2.5rem] blur-3xl -z-10 group-hover:bg-brand-yellow/30 transition-all duration-700"></div>
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(45,74,34,0.2)] border-4 border-white/20 bg-white/10 backdrop-blur-md aspect-square">
            <Image 
              src="/hero.png" 
              alt="Pastil ni Liling Signature Dish" 
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover group-hover:scale-110 transition-transform duration-1000"
              priority
              loading="eager"
            />
          </div>
          
          {/* Subtle Floating Info */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:-right-6 bg-white w-[90%] md:w-auto p-4 md:p-5 rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center md:justify-start gap-3 md:gap-4 animate-in slide-in-from-bottom duration-1000 delay-500 z-10">
            <div className="bg-brand-green/10 w-10 h-10 rounded-xl flex items-center justify-center text-brand-green">
              <CookingPot size={22} weight="bold" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-earth/40">Freshly Made</p>
              <p className="text-xs font-bold">Daily Batch Pastil</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
