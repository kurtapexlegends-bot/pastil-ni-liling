import { useState } from "react";
import { Order } from "@/types/admin";
import { Receipt, Truck, ShoppingCart } from "@phosphor-icons/react";
import { formatCurrency } from "@/lib/format";
import SegmentedControl from "@/components/ui/SegmentedControl";

interface OrderManagementProps {
  orders: Order[];
  b2bOrders: any[];
  updateOrderStatus: (id: number, status: string, isB2B?: boolean) => Promise<void>;
  viewMode: 'b2c' | 'b2b';
  setViewMode: (mode: 'b2c' | 'b2b') => void;
}

export default function OrderManagement({ orders, b2bOrders, updateOrderStatus, viewMode, setViewMode }: OrderManagementProps) {
  const activeOrders = viewMode === 'b2c' ? orders : b2bOrders;

  return (
    <div className="space-y-6">
      {/* Sleek, Premium Mode Toggle Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <SegmentedControl
          value={viewMode}
          onChange={setViewMode}
          options={[
            { id: "b2c", label: "Customer Sales (B2C)", icon: ShoppingCart },
            { id: "b2b", label: "Commissary Restocks (B2B)", icon: Truck }
          ] as const}
        />

        <div className="text-right hidden sm:block">
          <p className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/30">Total Active Requests</p>
          <p className="text-sm font-bold text-brand-earth">
            {activeOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length} Pending
          </p>
        </div>
      </div>

      {/* Main Orders Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Order ID & Type</th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">
                  {viewMode === 'b2c' ? 'Customer & Contact' : 'Franchisee operator'}
                </th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Branch Routing</th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Ordered Items</th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Total Price</th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Status</th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">HQ Action</th>
              </tr>
            </thead>
            <tbody>
              {activeOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                      <Receipt size={48} weight="duotone" className="text-brand-earth" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-earth">
                        No orders recorded yet
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                activeOrders.map((order, index) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-gray-50/30 transition-colors animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                    style={{ animationDelay: `${index * 50}ms`, animationDuration: '400ms' }}
                  >
                    <td className="px-6 py-4 border-b border-gray-100">
                      <p className="text-xs font-semibold text-brand-earth">#{order.id}</p>
                      <span className={`inline-block px-1.5 py-0.2 mt-0.5 rounded text-[7px] font-bold uppercase tracking-wider ${
                        viewMode === 'b2b' 
                          ? 'bg-amber-100 text-amber-800'
                          : order.type === 'wholesale' 
                            ? 'bg-brand-green/10 text-brand-green' 
                            : 'bg-blue-50 text-blue-600'
                      }`}>
                        {viewMode === 'b2b' ? 'B2B Restock' : (order.type || 'retail')}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100">
                      <p className="text-[11px] font-semibold text-brand-earth">{order.user?.name || 'Operator'}</p>
                      <p className="text-[10px] text-brand-earth/40">{order.contact_number}</p>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100">
                      <p className="text-[11px] text-brand-earth/60 font-medium leading-relaxed">
                        {viewMode === 'b2b' 
                          ? `HQ ➔ ${order.hub?.name || 'Hub'}` 
                          : order.type === 'wholesale' 
                            ? 'HQ Restock' 
                            : (order.hub?.name || 'HQ Managed')}
                      </p>
                      {order.shipping_address && (
                        <p className="text-[9px] text-brand-earth/30 leading-relaxed max-w-[120px] truncate" title={order.shipping_address}>
                          {order.shipping_address}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100 max-w-xs">
                      <div className="space-y-0.5">
                        {order.items?.map((item: any) => (
                          <p key={item.id} className="text-[10px] text-brand-earth/60 font-medium leading-tight">
                            {item.quantity}x {item.product?.name || 'Product'}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100 font-semibold text-brand-earth text-xs">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100">
                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-semibold uppercase tracking-wider ${
                        order.status === 'delivered' ? 'bg-green-50 text-green-700 border border-green-100/50' : 
                        order.status === 'out_for_delivery' ? 'bg-blue-50 text-blue-700 border border-blue-100/50' : 
                        'bg-yellow-50 text-yellow-700 border border-yellow-100/50'
                      }`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100">
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value, viewMode === 'b2b')}
                        className="bg-gray-50 border border-gray-100 rounded-md text-[9px] font-semibold uppercase tracking-wider px-2 py-1.5 outline-none focus:ring-2 focus:ring-brand-green/30 text-brand-earth"
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
