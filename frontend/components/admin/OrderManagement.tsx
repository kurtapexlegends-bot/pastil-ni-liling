import { Order } from "../../app/admin/types";

interface OrderManagementProps {
  orders: Order[];
  updateOrderStatus: (id: number, status: string) => Promise<void>;
}

export default function OrderManagement({ orders, updateOrderStatus }: OrderManagementProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Order ID & Type</th>
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Customer & Contact</th>
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Branch Routing</th>
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Ordered Items</th>
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Total Price</th>
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Status</th>
              <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">HQ Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-xs text-brand-earth/40 font-normal">
                  No orders recorded on the platform yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4 border-b border-gray-100">
                    <p className="text-xs font-semibold text-brand-earth">#{order.id}</p>
                    <span className={`inline-block px-1.5 py-0.2 mt-0.5 rounded text-[7px] font-bold uppercase tracking-wider ${
                      order.type === 'wholesale' 
                        ? 'bg-brand-green/10 text-brand-green' 
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      {order.type || 'retail'}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b border-gray-100">
                    <p className="text-[11px] font-semibold text-brand-earth">{order.user?.name || 'Guest Customer'}</p>
                    <p className="text-[10px] text-brand-earth/40">{order.contact_number}</p>
                  </td>
                  <td className="px-6 py-4 border-b border-gray-100">
                    <p className="text-[11px] text-brand-earth/60 font-medium leading-relaxed">
                      {order.type === 'wholesale' ? 'HQ Restock' : (order.hub?.name || 'HQ Managed')}
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
                    ₱{Number(order.total_amount).toFixed(2)}
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
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="bg-gray-50 border border-gray-100 rounded-md text-[9px] font-semibold uppercase tracking-wider px-2 py-1.5 outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
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
  );
}
