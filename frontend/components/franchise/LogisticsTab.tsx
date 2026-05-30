"use client";

import { Product } from "@/types";
import ProductCard from "@/components/consumer/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import { Truck, Package, Leaf, ArrowUpRight } from "@phosphor-icons/react";
import { formatCurrency } from "@/lib/format";

interface LogisticsTabProps {
  customerOrders: any[];
  handleUpdateCustomerOrderStatus: (orderId: number, nextStatus: string) => Promise<void>;
  products: Product[];
  handleAddToCart: (product: Product) => void;
  hub: any;
  hubInventory: any[];
  orders: any[];
}

export default function LogisticsTab({
  customerOrders,
  handleUpdateCustomerOrderStatus,
  products,
  handleAddToCart,
  hub,
  hubInventory,
  orders,
}: LogisticsTabProps) {
  const handleExportB2COrdersCSV = () => {
    const headers = ["Order ID", "Customer Name", "Contact Number", "Address", "Items Ordered", "Total Amount", "Status"];
    const rows = customerOrders.map(order => {
      const itemsStr = order.items?.map((item: any) => `${item.quantity}x ${item.product?.name}`).join(" | ");
      return [
        order.id,
        `"${order.user?.name || 'Guest Customer'}"`,
        `"${order.contact_number || ''}"`,
        `"${order.shipping_address || ''}"`,
        `"${itemsStr}"`,
        order.total_amount,
        `"${order.status}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `B2C_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportInventoryCSV = () => {
    const headers = ["Product Name", "Stock Quantity", "Hub Location", "Status"];
    const rows = hubInventory.map(item => {
      const name = `"${item.product?.name}"`;
      const qty = item.stock_quantity;
      const hubName = `"${hub?.name || ''}"`;
      const status = qty < 20 ? "Low Stock" : "In Stock";
      return [name, qty, hubName, status];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Branch_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCommissaryOrdersCSV = () => {
    const headers = ["Order ID", "Total Amount", "Status"];
    const rows = orders.map(order => [
      order.id,
      order.total_amount,
      `"${order.status}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Commissary_Shipments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-12">
      {/* Live Retail Orders Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Live Routed B2C Orders</h2>
            <span className="bg-brand-green/10 text-brand-green text-[9px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
              {customerOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length} Active
            </span>
          </div>
          {customerOrders.length > 0 && (
            <button
              onClick={handleExportB2COrdersCSV}
              className="border border-gray-200 hover:bg-gray-50 text-brand-earth/70 font-bold uppercase tracking-widest text-[8px] px-4 py-2 rounded-full transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-sm"
            >
              <ArrowUpRight size={12} weight="bold" />
              Export CSV
            </button>
          )}
        </div>

        {customerOrders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No Active B2C Orders"
            description="Live customer retail orders routed from register checkout channels will appear here."
          />
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {customerOrders.map((order, index) => (
              <div
                key={order.id}
                className="bg-white p-6 rounded-xl border border-gray-100/65 shadow-sm flex flex-col justify-between space-y-5 hover:border-brand-green/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                style={{ animationDelay: `${index * 50}ms`, animationDuration: '400ms' }}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/30">Order #{order.id}</p>
                      <p className="text-sm font-bold tracking-tight text-brand-earth">{order.user?.name || 'Guest Customer'}</p>
                      <p className="text-xs font-semibold text-brand-earth/50">{order.contact_number}</p>
                      <p className="text-[10px] text-brand-earth/40 leading-relaxed line-clamp-1">{order.shipping_address}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        order.status === 'preparing' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        order.status === 'out_for_delivery' ? 'bg-stone-100 text-stone-700 border-stone-200' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-100/60 space-y-2">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-[11px] text-brand-earth/70">
                        <span className="font-semibold">{item.quantity}x {item.product?.name}</span>
                        <span className="font-bold">{formatCurrency(parseFloat(item.price) * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100/60 flex justify-between items-center">
                  <div className="text-left">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-brand-earth/30">Total</p>
                    <p className="text-sm font-bold text-brand-earth">{formatCurrency(order.total_amount)}</p>
                  </div>

                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateCustomerOrderStatus(order.id, 'preparing')}
                        className="bg-brand-earth text-white px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-brand-green transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => handleUpdateCustomerOrderStatus(order.id, 'out_for_delivery')}
                        className="bg-brand-earth text-white px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-brand-green transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Ship Order
                      </button>
                    )}
                    {order.status === 'out_for_delivery' && (
                      <button
                        onClick={() => handleUpdateCustomerOrderStatus(order.id, 'delivered')}
                        className="bg-brand-green text-white px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-brand-green/80 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Deliver
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid lg:grid-cols-3 gap-12 pt-4">
        {/* Wholesale Catalog */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Request Restock Supplies (Commissary Bulk)</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{ ...product, price: product.wholesale_price || product.price }}
                onAddToCart={handleAddToCart}
                onClick={() => handleAddToCart(product)}
              />
            ))}
          </div>
        </div>

        {/* Branch Stock and History */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Active Spoke Inventory</h2>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                <div>
                  <p className="text-xs font-bold text-brand-earth tracking-tight">{hub?.name || 'Loading Branch...'}</p>
                  <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest font-semibold mt-0.5">{hub?.address || 'Locating...'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {hubInventory.length > 0 && (
                    <button
                      onClick={handleExportInventoryCSV}
                      className="border border-gray-200 hover:bg-gray-50 text-brand-earth/70 font-bold uppercase tracking-widest text-[7px] px-2.5 py-1.5 rounded-full transition-all active:scale-[0.98] flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowUpRight size={10} weight="bold" />
                      Export
                    </button>
                  )}
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>
                </div>
              </div>
              <div className="space-y-4">
                {hubInventory.length === 0 ? (
                  <EmptyState
                    icon={Leaf}
                    title="Retail Stock Is Empty"
                    description="This spoke outlet has not initialized any retail product inventories."
                  />
                ) : (
                  hubInventory.map((item: any) => {
                    const isLowStock = item.stock_quantity < 20;
                    return (
                      <div key={item.id} className="flex flex-col gap-2 py-2 border-b border-gray-50/50 last:border-0">
                        <div className="flex justify-between items-center text-xs text-brand-earth/70">
                          <span className="font-semibold flex items-center gap-2">
                            {item.product?.name}
                            {isLowStock && (
                              <span className="flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                              </span>
                            )}
                          </span>
                          <span className={`font-bold px-3 py-1 rounded-full text-[9px] border ${isLowStock ? 'bg-rose-50 text-rose-600 border-rose-100/50' : 'bg-emerald-50 text-emerald-600 border-emerald-100/50'}`}>
                            {item.stock_quantity} units
                          </span>
                        </div>
                        {isLowStock && (
                          <div className="flex justify-end">
                            <button 
                              onClick={() => {
                                const wholesaleEquivalent = products.find(p => p.id === item.product_id);
                                if (wholesaleEquivalent) {
                                  handleAddToCart(wholesaleEquivalent);
                                }
                              }}
                              className="text-[9px] flex items-center gap-1 font-bold bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white transition-colors px-3 py-1.5 rounded-full uppercase tracking-widest"
                            >
                              <Truck size={12} weight="bold" /> 1-Click Restock
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Recent Commissary Shipments</h2>
              {orders.length > 0 && (
                <button
                  onClick={handleExportCommissaryOrdersCSV}
                  className="border border-gray-200 hover:bg-gray-50 text-brand-earth/70 font-bold uppercase tracking-widest text-[7px] px-2.5 py-1.5 rounded-full transition-all active:scale-[0.98] flex items-center gap-1 cursor-pointer"
                >
                  <ArrowUpRight size={10} weight="bold" />
                  Export
                </button>
              )}
            </div>
            <div className="space-y-3">
              {orders.length === 0 ? (
                <EmptyState
                  icon={Truck}
                  title="No Commissary Orders"
                  description="Wholesale supply restocks and active delivery records will display here."
                />
              ) : (
                orders.slice(0, 5).map((order, index) => (
                  <div 
                    key={order.id} 
                    className="bg-white p-4 rounded-xl border border-gray-100/80 flex justify-between items-center group hover:border-brand-green/30 transition-all shadow-sm animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                    style={{ animationDelay: `${index * 50}ms`, animationDuration: '400ms' }}
                  >
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-brand-earth/30 uppercase tracking-widest">Order #{order.id}</p>
                      <p className="text-sm font-bold text-brand-earth">{formatCurrency(order.total_amount)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' : 'bg-amber-50 text-amber-700 border-amber-100/50'}`}>
                      {order.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
