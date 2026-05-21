"use client";

import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { Truck, Package } from "@phosphor-icons/react";

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
  return (
    <div className="space-y-12">
      {/* Live Retail Orders Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Live Routed B2C Orders</h2>
          <span className="bg-brand-green/10 text-brand-green text-[9px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
            {customerOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length} Active
          </span>
        </div>

        {customerOrders.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-100/80 text-center space-y-2">
            <p className="text-sm font-semibold text-brand-earth/40">No active customer orders routed to your hub yet.</p>
            <p className="text-[10px] text-brand-earth/30 uppercase tracking-widest">Orders placed near your region will automatically buffer here.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {customerOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-6 rounded-xl border border-gray-100/65 shadow-sm flex flex-col justify-between space-y-5 hover:border-brand-green/20 transition-all duration-300"
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
                      className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${
                        order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                        order.status === 'preparing' ? 'bg-orange-50 text-orange-600' :
                        order.status === 'out_for_delivery' ? 'bg-blue-50 text-blue-600' :
                        'bg-yellow-50 text-yellow-600'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-100/60 space-y-2">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-[11px] text-brand-earth/70">
                        <span className="font-semibold">{item.quantity}x {item.product?.name}</span>
                        <span className="font-bold">₱{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100/60 flex justify-between items-center">
                  <div className="text-left">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-brand-earth/30">Total</p>
                    <p className="text-sm font-bold text-brand-earth">₱{parseFloat(order.total_amount).toFixed(2)}</p>
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
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              </div>
              <div className="space-y-4">
                {hubInventory.length === 0 ? (
                  <p className="text-[10px] text-brand-earth/40 py-4 text-center">No retail stock yet. Place a bulk order to restock!</p>
                ) : (
                  hubInventory.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-xs text-brand-earth/70">
                      <span className="font-semibold">{item.product?.name}</span>
                      <span className={`font-bold px-3 py-1 rounded-full text-[9px] ${item.stock_quantity < 50 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {item.stock_quantity} units
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Recent Commissary Shipments</h2>
            <div className="space-y-3">
              {orders.length === 0 ? (
                <p className="text-[10px] text-brand-earth/40 py-2 text-center">No recent orders</p>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="bg-white p-4 rounded-xl border border-gray-100/80 flex justify-between items-center group hover:border-brand-green/30 transition-all shadow-sm">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-brand-earth/30 uppercase tracking-widest">Order #{order.id}</p>
                      <p className="text-sm font-bold text-brand-earth">₱{parseFloat(order.total_amount).toFixed(2)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${order.status === 'delivered' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
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
