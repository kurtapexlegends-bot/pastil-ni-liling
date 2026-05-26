import { FranchiseApplication, Order, Product, Hub } from "@/types/admin";

interface StatsGridProps {
  activeTab: 'applications' | 'orders' | 'products' | 'hubs' | 'supply_chain' | 'employees' | 'compliance' | 'payroll' | 'analytics' | 'website_content';
  applications: FranchiseApplication[];
  orders: Order[];
  products: Product[];
  hubs: Hub[];
  ingredients?: any[];
  batches?: any[];
}

export default function StatsGrid({ activeTab, applications, orders, products, hubs, ingredients = [], batches = [] }: StatsGridProps) {
  if (activeTab === 'website_content') {
    return null;
  }

  if (activeTab === 'analytics') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Total Sales Revenue</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-earth">₱ 342,850.00</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Average Profit Margin</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-green">52.8%</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Food Waste Ratio</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-rose-600">2.1%</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Franchise Spokes</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-earth">3 Active Branches</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'employees') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Total Staff Active</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-earth">12 Personnel</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">HQ Operations Directors</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-green">2 Members</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Franchise Owners</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-earth">4 Active Partners</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Branch Cashiers</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-earth">6 Cashiers</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'compliance') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Total Audits Logged</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-earth">8 Audits</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Hygiene Average</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-green">96.8% Score</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Recipe Adherence</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-earth">98.5% Taste Adherence</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Violations Flagged</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-rose-600">0 Violations</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'payroll') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Work Shifts Logged</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-earth">24 Completed Shifts</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Active cashiers online</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-green">2 Live Shifts</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Commission pay disbursed</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-earth">₱ 8,420.00 Comm</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Gross Payroll Ledger</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-earth">₱ 48,200.00 Gross</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'applications') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Total Applicants</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-earth">{applications.length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Approved Partners</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-green">{applications.filter(a => a.status === 'approved').length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Pending Review</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-amber-600">{applications.filter(a => a.status === 'pending').length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Rejected</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-rose-600">{applications.filter(a => a.status === 'rejected').length}</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'orders') {
    const revenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + Number(o.total_amount), 0);

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Total Orders</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-earth">{orders.length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Delivered Orders</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-green">{orders.filter(o => o.status === 'delivered').length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Pending/Preparing</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-amber-600">
            {orders.filter(o => o.status === 'pending' || o.status === 'preparing').length}
          </p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Delivered Revenue</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-earth">₱{revenue.toFixed(2)}</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'products') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Catalog Size</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-earth">{products.length} Items</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Retail Exclusive</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-stone-600">{products.filter(p => !p.is_wholesale).length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Wholesale Bulk</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-green">{products.filter(p => p.is_wholesale).length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Active Products</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-earth">{products.filter(p => p.is_active).length}</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'supply_chain') {
    const totalIngredients = ingredients.length;
    const lowStockIngredients = ingredients.filter(i => Number(i.stock) <= Number(i.min_stock)).length;
    const totalBatches = batches.length;
    const expiringBatches = batches.filter(b => {
      const daysRemaining = Math.ceil((new Date(b.expiry_date).getTime() - Date.now()) / (1000 * 3600 * 24));
      return daysRemaining <= 3 && daysRemaining >= 0;
    }).length;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Total Raw Materials</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-earth">{totalIngredients} Items</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Depleted / Low Stock</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-amber-600">{lowStockIngredients}</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">FIFO Batches Loaded</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-green">{totalBatches} Batches</p>
        </div>
        <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Near-Expiry Warnings</p>
          <p className="text-[16px] md:text-xl leading-tight font-bold text-rose-600">{expiringBatches}</p>
        </div>
      </div>
    );
  }

  // activeTab === 'hubs'
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
        <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Hub Spoke Network</p>
        <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-earth">{hubs.length} Spokes</p>
      </div>
      <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
        <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Active Locations</p>
        <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-green">{hubs.filter(h => h.status === 'active').length}</p>
      </div>
      <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
        <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Assigned Franchisees</p>
        <p className="text-[16px] md:text-xl leading-tight font-bold text-brand-earth">{hubs.filter(h => h.franchisee_id).length}</p>
      </div>
      <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm">
        <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">Under Maintenance</p>
        <p className="text-[16px] md:text-xl leading-tight font-bold text-rose-600">{hubs.filter(h => h.status === 'inactive').length}</p>
      </div>
    </div>
  );
}
