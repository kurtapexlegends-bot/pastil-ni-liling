import React from 'react';
import Image from 'next/image';
import { Product } from '@/types/admin';

interface SiteSettings {
  featured_products: number[];
}

interface FeaturedPickerProps {
  formData: SiteSettings;
  products: Product[];
  onToggleFeaturedProduct: (id: number) => void;
}

export default function FeaturedPicker({ formData, products, onToggleFeaturedProduct }: FeaturedPickerProps) {
  return (
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
                onClick={() => onToggleFeaturedProduct(prod.id!)}
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
                  <p className="text-[10px] font-black truncate leading-tight mt-0.5">{prod.name}</p>
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
  );
}
