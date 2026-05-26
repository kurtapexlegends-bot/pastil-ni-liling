"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react";
import ProductCard from "@/components/consumer/ProductCard";
import CartDrawer from "@/components/layout/CartDrawer";
import Navbar from "@/components/layout/Navbar";
import { Product, CartItem } from "@/types";

export default function MenuPage() {
  const [filter, setFilter] = useState("all");
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderMethod, setOrderMethod] = useState<"direct" | "apps">("direct");

  const handleSelectProduct = (product: Product | null) => {
    setSelectedProduct(product);
    setOrderMethod("direct");
  };

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart");
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const { data, isLoading: loading } = useSWR("http://127.0.0.1:8000/api/products", (url) => fetch(url).then(res => res.json()));
  const products = (data?.success && Array.isArray(data.data)) ? data.data : [];

  const filteredProducts = Array.isArray(products)
    ? (filter === "all" ? products : products.filter((p: Product) => p.category === filter))
    : [];

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setSelectedProduct(null);
    setIsCartOpen(true); // Open cart immediately when item added
  };

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-brand-earth flex flex-col">
      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />

      {/* Selected Product Modal */}
      {selectedProduct && (
        <div 
          onClick={() => handleSelectProduct(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-earth/40 backdrop-blur-sm animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-xl grid md:grid-cols-2 animate-slide-up"
          >
            <div className="relative aspect-square md:aspect-auto md:h-full w-full bg-gray-50 shrink-0">
              <Image src={selectedProduct.image_url || "/hero.png"} alt={selectedProduct.name} fill className="object-cover" />
              <button 
                onClick={() => handleSelectProduct(null)}
                className="absolute top-4 left-4 w-8 h-8 bg-white/95 rounded-full flex items-center justify-center shadow-sm hover:bg-white active:scale-95 transition-all text-xs text-brand-earth/70"
              >
                ✕
              </button>
            </div>
            <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-brand-green/10 text-[9px] font-semibold uppercase tracking-wider text-brand-green">
                  {selectedProduct.category.replace('_', ' ')}
                </div>
                <h2 className="text-xl font-bold tracking-tight text-brand-earth leading-tight">{selectedProduct.name}</h2>
                <p className="text-xs text-brand-earth/60 leading-relaxed font-normal">{selectedProduct.description}</p>
                <div className="text-xl font-bold text-brand-earth">₱{selectedProduct.price}</div>
              </div>

              {/* ordering channel selection */}
              <div className="space-y-3">
                <p className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Select Order Option</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderMethod("direct")}
                    className={`p-3 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
                      orderMethod === "direct"
                        ? "bg-brand-earth text-white border-brand-earth shadow-sm"
                        : "bg-white border-gray-100 text-brand-earth/50 hover:border-brand-green hover:text-brand-green"
                    }`}
                  >
                    <span>Direct Delivery</span>
                    <span className="text-[7px] font-medium lowercase opacity-60">From our local branch</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderMethod("apps")}
                    className={`p-3 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
                      orderMethod === "apps"
                        ? "bg-brand-earth text-white border-brand-earth shadow-sm"
                        : "bg-white border-gray-100 text-brand-earth/50 hover:border-brand-green hover:text-brand-green"
                    }`}
                  >
                    <span>Delivery Apps</span>
                    <span className="text-[7px] font-medium lowercase opacity-60">Foodpanda & Grab</span>
                  </button>
                </div>
              </div>

              {orderMethod === "direct" ? (
                <div className="pt-2 space-y-2">
                  <button 
                    onClick={() => handleAddToCart(selectedProduct)}
                    className="w-full bg-brand-green text-white py-3.5 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-brand-green/90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-brand-green/10"
                  >
                    Add to Basket
                  </button>
                  <p className="text-[7.5px] text-center font-bold text-brand-earth/40 uppercase tracking-wider leading-none">
                    Select your nearest branch & payment option at checkout
                  </p>
                </div>
              ) : (
                <div className="pt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="https://www.foodpanda.ph/?query=pastil+ni+liling"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#D70F64] hover:bg-[#D70F64]/95 text-white py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#D70F64]/10 text-center"
                    >
                      Foodpanda
                    </a>
                    <a
                      href="https://food.grab.com/ph/en/restaurants?search=Pastil+ni+Liling"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#00B14F] hover:bg-[#00B14F]/95 text-white py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#00B14F]/10 text-center"
                    >
                      GrabFood
                    </a>
                  </div>
                  <p className="text-[7.5px] text-center font-bold text-brand-earth/40 uppercase tracking-wider leading-none">
                    Opens the delivery app in a new browser tab
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Navbar
        variant="menu"
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
      />

      <main className="pt-24 pb-16 px-6 max-w-6xl mx-auto w-full flex-1">
        <header className="space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-brand-yellow/10 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/60">
            Our Full Menu
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-earth leading-tight">
            Swak sa Bulsa, <br />
            <span className="text-brand-green">Sarap na Babalik-balikan.</span>
          </h1>

          {/* Categories */}
          <div className="flex overflow-x-auto gap-2 pt-2 pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:flex-wrap [&::-webkit-scrollbar]:hidden">
            {[
              { id: "all", label: "All Items" },
              { id: "pastil", label: "Pastil Variants" },
              { id: "bagoong", label: "Bottled Bagoong" },
              { id: "chili_oil", label: "Chili Oil" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.97] duration-150 ${
                  filter === cat.id 
                    ? "bg-brand-earth text-white shadow-sm" 
                    : "bg-white border border-gray-100 hover:border-brand-green text-brand-earth/50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm space-y-4 animate-pulse">
                <div className="aspect-square rounded-xl bg-gray-100 w-full" />
                <div className="space-y-2">
                  <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="space-y-1.5 pt-1">
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                  </div>
                  <div className="h-8 bg-gray-100 rounded-xl w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product: Product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart} 
                onClick={handleSelectProduct}
              />
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="py-16 text-center space-y-3 flex flex-col items-center justify-center">
            <MagnifyingGlass size={36} className="text-brand-earth/30" />
            <p className="text-xs font-semibold text-brand-earth/40 uppercase tracking-wider">No products found in this category.</p>
          </div>
        )}
      </main>

      {/* Footer Lite */}
      <footer className="py-8 border-t border-gray-100 text-center bg-white mt-auto">
        <p className="text-[8px] font-medium uppercase tracking-wider text-brand-earth/30">
          &copy; 2026 Pastil ni Liling. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
