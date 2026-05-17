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
      className="group bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-4">
        <Image
          src={product.image_url || "/hero.png"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[10px] font-semibold text-brand-earth shadow-sm">
          ₱{product.price}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-brand-green">
            {product.category.replace('_', ' ')}
          </span>
        </div>
        
        <h3 className="text-sm font-semibold tracking-tight text-brand-earth leading-snug">
          {product.name}
        </h3>
        
        <p className="text-xs text-brand-earth/50 leading-relaxed line-clamp-2">
          {product.description}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="w-full mt-2 bg-brand-earth hover:bg-brand-green text-white py-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
