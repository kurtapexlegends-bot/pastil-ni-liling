'use client';

import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  Sparkle, 
  MapPin, 
  Phone, 
  CheckCircle, 
  Clock, 
  ArrowRight 
} from '@phosphor-icons/react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-brand-earth selection:bg-brand-yellow/30 flex flex-col justify-between">
      <Navbar variant="landing" />

      <main className="pt-28 pb-16 px-6 max-w-6xl mx-auto w-full flex-1 space-y-16">
        
        {/* Hero Banner */}
        <section className="text-center space-y-4 max-w-3xl mx-auto animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 text-[9px] font-bold uppercase tracking-widest">
            <Sparkle size={12} weight="bold" />
            <span>Ang Aming Kwento</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-brand-earth leading-tight font-display">
            Bringing Mindanao&apos;s Soulful Pastil to Every Filipino Table.
          </h1>

          <p className="text-sm md:text-base text-brand-earth/60 leading-relaxed font-medium">
            Rooted in Muslim Mindanao tradition, <strong className="text-brand-earth">Pastil ni Liling</strong> was born to make authentic, slow-cooked <span className="italic">kagikit</span> meals accessible, delicious, and budget-friendly—freshly wrapped in banana leaves every single day.
          </p>
        </section>

        {/* Story & Heritage Grid */}
        <section className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-gray-50">
            <Image
              src="/products/real_dish_5.webp"
              alt="Pastil ni Liling Store Branch Interior"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-gray-100/60 flex items-center justify-between text-xs">
              <span className="font-bold text-brand-earth">Official Storefront & Dine-in</span>
              <span className="text-[10px] font-semibold text-brand-green uppercase tracking-wider bg-brand-green/10 px-2 py-0.5 rounded-md">
                Verified Branch
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-green">
                Tradition in Every Fold
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-brand-earth">
                The Authentic Banana Leaf Experience
              </h2>
            </div>

            <p className="text-xs md:text-sm text-brand-earth/70 leading-relaxed font-normal">
              Pastil is more than just food; it is a cherished cultural tradition originating from Maguindanao and southern Mindanao. Steamed native rice is crowned with savory shredded chicken or tender beef <span className="italic font-semibold">kagikit</span>, cooked low and slow with native spices and aromatic garlic oil.
            </p>

            <p className="text-xs md:text-sm text-brand-earth/70 leading-relaxed font-normal">
              By wrapping every serving in clean, wilted banana leaves, the warmth of the rice naturally steams the leaf, infusing every bite with an unmistakable fragrance and rich umami flavor that plastic or styrofoam containers can never recreate.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-2.5">
                <CheckCircle size={18} weight="bold" className="text-brand-green shrink-0" />
                <span className="text-xs font-semibold text-brand-earth">100% Real Kagikit</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-2.5">
                <CheckCircle size={18} weight="bold" className="text-brand-green shrink-0" />
                <span className="text-xs font-semibold text-brand-earth">Daily Fresh Steam</span>
              </div>
            </div>
          </div>
        </section>

        {/* Operating Hubs & Outlets */}
        <section className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-green">
              Physical Hubs & Outlets
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-brand-earth">
              Visit or Order from Our Metro Manila Hubs
            </h2>
            <p className="text-xs text-brand-earth/60">
              Each branch operates with full kitchen compliance, hot dine-in seating, and express delivery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Cubao Hub */}
            <div className="p-6 bg-background rounded-2xl border border-gray-200/60 space-y-4 hover:border-brand-green/40 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-brand-earth">Cubao Hub (Arayat Market)</h3>
                  <p className="text-xs text-brand-earth/50">Quezon City Central Hub</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-brand-green/10 text-brand-green text-[9px] font-bold uppercase tracking-wider">
                  Active
                </span>
              </div>

              <div className="space-y-2 text-xs text-brand-earth/70">
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-brand-green shrink-0" />
                  <span>Stall # EA-05, Arayat Market, Cubao, Quezon City</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-brand-green shrink-0" />
                  <span>0970 156 9881 / +63 966 142 3992</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-brand-green shrink-0" />
                  <span>Dine-in, Takeout, GrabFood & Foodpanda Delivery</span>
                </div>
              </div>
            </div>

            {/* Bagong Silang Hub */}
            <div className="p-6 bg-background rounded-2xl border border-gray-200/60 space-y-4 hover:border-brand-green/40 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-brand-earth">Bagong Silang Hub (Langit Road)</h3>
                  <p className="text-xs text-brand-earth/50">North Caloocan Hub</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/30 text-[9px] font-bold uppercase tracking-wider">
                  Open 24/7
                </span>
              </div>

              <div className="space-y-2 text-xs text-brand-earth/70">
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-brand-green shrink-0" />
                  <span>Langit Road, Bagong Silang, Caloocan City</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-brand-green shrink-0" />
                  <span>0954 261 9188 / 0927 572 3661</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkle size={15} className="text-brand-yellow shrink-0" />
                  <span>Free Soup & Unli Chicken Oil for Dine-in Customers</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Bar */}
        <section className="bg-brand-earth rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold font-display">Ready for an Authentic Mindanao Meal?</h3>
            <p className="text-xs text-white/70 max-w-md">
              Order your favorite classic, budbod, or overload pastil directly online or check out our nationwide franchise package.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/menu"
              className="px-6 py-3 bg-brand-green hover:bg-brand-green/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
            >
              <span>Explore Menu</span>
              <ArrowRight size={14} weight="bold" />
            </Link>
            <Link
              href="/franchise"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              Franchise
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
