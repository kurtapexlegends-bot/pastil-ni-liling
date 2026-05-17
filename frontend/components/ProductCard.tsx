"use client";

import Image from "next/image";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClick: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onClick }: ProductCardProps) {
  return (
    <div 
      onClick={() => onClick(product)}
      className="group bg-white rounded-3xl border border-gray-100 p-4 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-6">
        <Image
          src={product.image_url || "/hero.png"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-earth shadow-sm">
          ₱{product.price}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-brand-green">
            {product.category.replace('_', ' ')}
          </span>
        </div>
        
        <h3 className="text-lg font-extrabold tracking-tight text-brand-earth leading-tight">
          {product.name}
        </h3>
        
        <p className="text-xs text-brand-earth/50 font-medium line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <button
          onClick={() => onAddToCart(product)}
          className="w-full mt-4 bg-brand-earth text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-green transition-all active:scale-95 shadow-lg shadow-brand-earth/5"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
