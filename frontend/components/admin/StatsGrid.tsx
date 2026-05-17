import { FranchiseApplication, Order, Product, Hub } from "../../app/admin/types";

interface StatsGridProps {
  activeTab: 'applications' | 'orders' | 'products' | 'hubs' | 'supply_chain' | 'employees' | 'compliance' | 'payroll' | 'analytics';
  applications: FranchiseApplication[];
  orders: Order[];
  products: Product[];
  hubs: Hub[];
  ingredients?: any[];
  batches?: any[];
}

export default function StatsGrid({ activeTab, applications, orders, products, hubs, ingredients = [], batches = [] }: StatsGridProps) {
  if (activeTab === 'analytics') {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Total Sales Revenue</p>
          <p className="text-xl font-bold text-brand-earth">₱ 342,850.00</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Average Profit Margin</p>
          <p className="text-xl font-bold text-brand-green">52.8%</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Food Waste Ratio</p>
          <p className="text-xl font-bold text-red-500">2.1%</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Franchise Spokes</p>
          <p className="text-xl font-bold text-brand-earth">3 Active Branches</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'employees') {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Total Staff Active</p>
          <p className="text-xl font-bold text-brand-earth">12 Personnel</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">HQ Operations Directors</p>
          <p className="text-xl font-bold text-brand-green">2 Members</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Franchise Owners</p>
          <p className="text-xl font-bold text-brand-earth">4 Active Partners</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Branch Cashiers</p>
          <p className="text-xl font-bold text-brand-earth">6 Cashiers</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'compliance') {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Total Audits Logged</p>
          <p className="text-xl font-bold text-brand-earth">8 Audits</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Hygiene Average</p>
          <p className="text-xl font-bold text-brand-green">96.8% Score</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Recipe Adherence</p>
          <p className="text-xl font-bold text-brand-earth">98.5% Taste Adherence</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Violations Flagged</p>
          <p className="text-xl font-bold text-red-500">0 Violations</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'payroll') {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Work Shifts Logged</p>
          <p className="text-xl font-bold text-brand-earth">24 Completed Shifts</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Active cashiers online</p>
          <p className="text-xl font-bold text-brand-green">2 Live Shifts</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Commission pay disbursed</p>
          <p className="text-xl font-bold text-brand-earth">₱ 8,420.00 Comm</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Gross Payroll Ledger</p>
          <p className="text-xl font-bold text-brand-earth">₱ 48,200.00 Gross</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'applications') {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Total Applicants</p>
          <p className="text-xl font-bold text-brand-earth">{applications.length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Approved Partners</p>
          <p className="text-xl font-bold text-brand-green">{applications.filter(a => a.status === 'approved').length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Pending Review</p>
          <p className="text-xl font-bold text-yellow-600">{applications.filter(a => a.status === 'pending').length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Rejected</p>
          <p className="text-xl font-bold text-red-500">{applications.filter(a => a.status === 'rejected').length}</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'orders') {
    const revenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + Number(o.total_amount), 0);

    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Total Orders</p>
          <p className="text-xl font-bold text-brand-earth">{orders.length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Delivered Orders</p>
          <p className="text-xl font-bold text-brand-green">{orders.filter(o => o.status === 'delivered').length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Pending/Preparing</p>
          <p className="text-xl font-bold text-yellow-600">
            {orders.filter(o => o.status === 'pending' || o.status === 'preparing').length}
          </p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Delivered Revenue</p>
          <p className="text-xl font-bold text-brand-earth">₱{revenue.toFixed(2)}</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'products') {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Catalog Size</p>
          <p className="text-xl font-bold text-brand-earth">{products.length} Items</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Retail Exclusive</p>
          <p className="text-xl font-bold text-blue-600">{products.filter(p => !p.is_wholesale).length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Wholesale Bulk</p>
          <p className="text-xl font-bold text-brand-green">{products.filter(p => p.is_wholesale).length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Active Products</p>
          <p className="text-xl font-bold text-brand-earth">{products.filter(p => p.is_active).length}</p>
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
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Total Raw Materials</p>
          <p className="text-xl font-bold text-brand-earth">{totalIngredients} Items</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Depleted / Low Stock</p>
          <p className="text-xl font-bold text-amber-600">{lowStockIngredients}</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">FIFO Batches Loaded</p>
          <p className="text-xl font-bold text-brand-green">{totalBatches} Batches</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Near-Expiry Warnings</p>
          <p className="text-xl font-bold text-red-500">{expiringBatches}</p>
        </div>
      </div>
    );
  }

  // activeTab === 'hubs'
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Hub Spoke Network</p>
        <p className="text-xl font-bold text-brand-earth">{hubs.length} Spokes</p>
      </div>
      <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Active Locations</p>
        <p className="text-xl font-bold text-brand-green">{hubs.filter(h => h.status === 'active').length}</p>
      </div>
      <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Assigned Franchisees</p>
        <p className="text-xl font-bold text-brand-earth">{hubs.filter(h => h.franchisee_id).length}</p>
      </div>
      <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-1 shadow-sm">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40">Under Maintenance</p>
        <p className="text-xl font-bold text-red-500">{hubs.filter(h => h.status === 'inactive').length}</p>
      </div>
    </div>
  );
}
