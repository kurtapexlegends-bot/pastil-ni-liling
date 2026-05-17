"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import { Product, CartItem } from "@/types";

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, []);

  const filteredProducts = filter === "all" 
    ? products 
    : products.filter(p => p.category === filter);

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-earth/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-xl grid md:grid-cols-2 animate-in zoom-in-95 duration-200">
            <div className="relative aspect-square bg-gray-50 md:h-full">
              <Image src={selectedProduct.image_url || "/hero.png"} alt={selectedProduct.name} fill className="object-cover" />
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 left-4 w-8 h-8 bg-white/95 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors text-xs text-brand-earth/70"
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

              <div className="pt-4">
                <button 
                  onClick={() => handleAddToCart(selectedProduct)}
                  className="w-full bg-brand-earth hover:bg-brand-green text-white py-2.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-6 h-16 max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="Logo" width={24} height={24} className="rounded-full" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-earth/80">Pastil ni Liling</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div 
              onClick={() => setIsCartOpen(true)}
              className="relative cursor-pointer group p-1"
            >
              <span className="text-lg">🛒</span>
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-green text-white text-[8px] font-semibold w-3.5 h-3.5 rounded-full flex items-center justify-center animate-in zoom-in">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </div>
            <Link href="/" className="text-[10px] font-semibold uppercase tracking-wider text-brand-earth/50 hover:text-brand-earth transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

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
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              { id: "all", label: "All Items" },
              { id: "pastil", label: "Pastil Variants" },
              { id: "bagoong", label: "Bottled Bagoong" },
              { id: "chili_oil", label: "Chili Oil" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-wider transition-colors ${
                  filter === cat.id 
                    ? "bg-brand-earth text-white" 
                    : "bg-white border border-gray-100 hover:border-brand-green text-brand-earth/50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-gray-100 aspect-square rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart} 
                onClick={setSelectedProduct}
              />
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="py-16 text-center space-y-3">
            <div className="text-3xl">🍃</div>
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
