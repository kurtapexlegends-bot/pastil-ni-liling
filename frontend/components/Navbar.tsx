'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface NavbarProps {
  variant?: 'landing' | 'menu' | 'checkout' | 'franchise' | 'dashboard';
  cartCount?: number;
  onCartClick?: () => void;
  onLogout?: () => void;
}

export default function Navbar({
  variant = 'landing',
  cartCount = 0,
  onCartClick,
  onLogout,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/50 transition-all">
      <div className="flex items-center justify-between px-6 h-20 max-w-6xl mx-auto w-full">
        {/* LEFT LOGO & BRANDING */}
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-green/20 rounded-full blur-md group-hover:bg-brand-green/40 transition-all"></div>
            <Image
              src="/logo.jpg"
              alt="Pastil ni Liling Logo"
              width={42}
              height={42}
              className="relative rounded-full shadow-sm"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none tracking-tight uppercase text-brand-earth">
              {variant === 'franchise' ? 'Franchise Portal' : 'Pastil ni Liling'}
            </span>
            <span className="text-[9px] font-medium text-brand-green uppercase tracking-[0.2em] mt-1">
              Authentic Mindanao
            </span>
          </div>
        </Link>

        {/* VARIANT-SPECIFIC NAVIGATION CONTENT */}

        {/* 1. Landing Page Navigation */}
        {variant === 'landing' && (
          <>
            <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-brand-earth/60">
              <Link href="/menu" className="hover:text-brand-green transition-colors">
                Retail Menu
              </Link>
              <Link href="/franchise" className="hover:text-brand-green transition-colors">
                Franchise
              </Link>
              <Link href="/about" className="hover:text-brand-green transition-colors">
                Our Story
              </Link>
            </div>

            <div className="flex items-center gap-5">
              <Link
                href="/login"
                className="hidden sm:block text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 text-brand-earth"
              >
                Sign In
              </Link>
              <Link
                href="/menu"
                className="bg-brand-earth text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-brand-earth/10 hover:bg-brand-green transition-all active:scale-95"
              >
                Order Online
              </Link>
              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-brand-earth p-1 focus:outline-none"
                aria-label="Toggle Menu"
              >
                <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
              </button>
            </div>
          </>
        )}

        {/* 2. Menu Page Navigation */}
        {variant === 'menu' && (
          <div className="flex items-center gap-6">
            <div onClick={onCartClick} className="relative cursor-pointer group p-2 select-none">
              <span className="text-xl filter hover:brightness-95 transition-all">🛒</span>
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-brand-green text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </div>
            <Link
              href="/"
              className="text-[10px] font-semibold uppercase tracking-wider text-brand-earth/55 hover:text-brand-green transition-colors"
            >
              Back to Home
            </Link>
          </div>
        )}

        {/* 3. Checkout Page Navigation */}
        {variant === 'checkout' && (
          <Link href="/menu" className="flex items-center gap-2 group">
            <span className="text-sm text-brand-earth/60 group-hover:text-brand-earth transition-colors">
              ←
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-earth/60 group-hover:text-brand-earth transition-colors">
              Back to Menu
            </span>
          </Link>
        )}

        {/* 4. Franchise Page Navigation */}
        {variant === 'franchise' && (
          <Link
            href="/"
            className="text-[10px] font-semibold uppercase tracking-wider text-brand-earth/55 hover:text-brand-green transition-colors"
          >
            Back to Home
          </Link>
        )}

        {/* 5. User Dashboard Navigation */}
        {variant === 'dashboard' && (
          <div className="flex items-center gap-6">
            <Link
              href="/menu"
              className="text-[10px] font-bold uppercase tracking-widest hover:text-brand-green transition-colors"
            >
              Order More
            </Link>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>

      {/* MOBILE MENU DROPDOWN (Landing Page Variant Only) */}
      {variant === 'landing' && mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200/50 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col px-6 py-4 space-y-4 text-[10px] font-bold uppercase tracking-widest text-brand-earth/70">
            <Link
              href="/menu"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-green transition-colors"
            >
              Retail Menu
            </Link>
            <Link
              href="/franchise"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-green transition-colors"
            >
              Franchise
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-green transition-colors"
            >
              Our Story
            </Link>
            <hr className="border-gray-100" />
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-green transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
