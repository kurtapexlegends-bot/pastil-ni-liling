import React, { useState } from "react";
import { MagnifyingGlass, Storefront } from "@phosphor-icons/react";
import { formatCurrency } from "@/lib/format";
import EmptyState from "@/components/ui/EmptyState";

interface POSCatalogProps {
  hubInventory: any[];
  onAddToPOSCart: (item: any) => void;
}

export default function POSCatalog({ hubInventory, onAddToPOSCart }: POSCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    "all",
    ...Array.from(
      new Set(
        hubInventory
          .map((item) => item.product?.category)
          .filter(Boolean)
      )
    ),
  ];

  const filteredInventory = hubInventory.filter((item: any) => {
    const matchesCategory =
      selectedCategory === "all" ||
      item.product?.category === selectedCategory;
    const matchesSearch = item.product?.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search & Category Pills Track */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-earth/40">
            <MagnifyingGlass size={14} />
          </span>
          <input
            type="text"
            placeholder="Search branch inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-100 rounded-xl text-xs font-medium text-brand-earth placeholder-brand-earth/30 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
          />
        </div>
        
        <div className="flex flex-wrap gap-1.5 items-center">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-wider transition-all active:scale-[0.96] ${
                selectedCategory === cat
                  ? 'bg-brand-earth text-white border-brand-earth shadow-sm'
                  : 'bg-white text-brand-earth/50 border-gray-100 hover:border-brand-green hover:text-brand-green'
              }`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filteredInventory.length === 0 ? (
          <div className="col-span-2">
            <EmptyState
              icon={Storefront}
              title={hubInventory.length === 0 ? "No Retail Stock Available" : "No Matches Found"}
              description={
                hubInventory.length === 0
                  ? "Order retail supply jars from HQ Central Commissary hub using the Logistics Tab first."
                  : "No products matched your active filters or search terms. Try modifying your active query."
              }
            />
          </div>
        ) : (
          filteredInventory.map((item: any) => (
            <div 
              key={item.id} 
              onClick={() => item.stock_quantity > 0 && onAddToPOSCart(item)}
              className={`bg-white p-5 rounded-xl border border-gray-100/60 shadow-sm hover:shadow-md hover:border-brand-green/30 transition-all duration-300 flex flex-col justify-between space-y-4 cursor-pointer relative active:scale-[0.99] ${
                item.stock_quantity === 0 ? 'opacity-45 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-[8px] bg-brand-earth/5 text-brand-earth/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{item.product?.category}</span>
                  <h3 className="text-sm font-bold text-brand-earth tracking-tight leading-tight">{item.product?.name}</h3>
                  <p className="text-sm font-bold text-brand-green mt-1">{formatCurrency(item.product?.price)}</p>
                </div>
                <span className={`text-[9px] font-bold px-3 py-1 rounded-full border ${
                  item.stock_quantity === 0 
                    ? 'bg-rose-50 text-rose-600 border-rose-100/50' 
                    : item.stock_quantity < 30 
                    ? 'bg-amber-50 text-amber-600 border-amber-100/50' 
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
                }`}>
                  {item.stock_quantity === 0 ? 'Out of Stock' : `${item.stock_quantity} available`}
                </span>
              </div>
              <div className="flex justify-end pt-3 border-t border-gray-50">
                <button 
                  disabled={item.stock_quantity === 0}
                  className="bg-brand-green text-white text-[9px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-full shadow-sm hover:bg-brand-green/90 transition-colors disabled:opacity-0 active:scale-[0.95]"
                >
                  + Add to Receipt
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
