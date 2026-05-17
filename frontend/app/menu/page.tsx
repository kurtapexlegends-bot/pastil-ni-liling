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
    <div className="min-h-screen bg-[#fafafa] font-sans text-brand-earth">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-earth/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl grid md:grid-cols-2 animate-in zoom-in slide-in-from-bottom-8 duration-500">
            <div className="relative aspect-square bg-gray-50">
              <Image src={selectedProduct.image_url || "/hero.png"} alt={selectedProduct.name} fill className="object-cover" />
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 left-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-12 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-[10px] font-black uppercase tracking-widest text-brand-green">
                  {selectedProduct.category.replace('_', ' ')}
                </div>
                <h2 className="text-4xl font-black tracking-tighter leading-tight">{selectedProduct.name}</h2>
                <p className="text-brand-earth/60 font-medium leading-relaxed">{selectedProduct.description}</p>
                <div className="text-4xl font-black text-brand-earth">₱{selectedProduct.price}</div>
              </div>

              <div className="pt-12 flex gap-4">
                <button 
                  onClick={() => handleAddToCart(selectedProduct)}
                  className="flex-1 bg-brand-earth text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-green transition-all shadow-xl shadow-brand-earth/10"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center justify-between px-6 h-16 max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="Logo" width={32} height={32} className="rounded-full" />
            <span className="text-xs font-black uppercase tracking-tighter">Pastil ni Liling</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <div 
              onClick={() => setIsCartOpen(true)}
              className="relative cursor-pointer group"
            >
              <span className="text-xl">🛒</span>
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-green text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </div>
            <Link href="/" className="text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-6 max-w-6xl mx-auto">
        <header className="space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/30 border border-brand-yellow text-[9px] font-bold uppercase tracking-widest text-brand-earth">
            Our Full Menu
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
            Swak sa Bulsa, <br />
            <span className="text-brand-green">Sarap na Babalik-balikan.</span>
          </h1>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 pt-4">
            {[
              { id: "all", label: "All Items" },
              { id: "pastil", label: "Pastil Variants" },
              { id: "bagoong", label: "Bottled Bagoong" },
              { id: "chili_oil", label: "Chili Oil" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === cat.id 
                    ? "bg-brand-earth text-white shadow-xl shadow-brand-earth/20" 
                    : "bg-white border border-gray-100 hover:border-brand-green text-brand-earth/50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-gray-100 aspect-square rounded-[2rem]"></div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
          <div className="py-20 text-center space-y-4">
            <div className="text-4xl">🍃</div>
            <p className="text-sm font-bold text-brand-earth/40 uppercase tracking-widest">No products found in this category.</p>
          </div>
        )}
      </main>

      {/* Footer Lite */}
      <footer className="py-12 border-t border-gray-100 text-center">
        <p className="text-[9px] font-bold uppercase tracking-widest opacity-30">
          &copy; 2026 Pastil ni Liling. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
