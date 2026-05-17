interface AdminHeaderProps {
  activeTab: 'applications' | 'orders' | 'products' | 'hubs' | 'supply_chain';
  onAddProduct: () => void;
  onCreateHub: () => void;
}

export default function AdminHeader({ activeTab, onAddProduct, onCreateHub }: AdminHeaderProps) {
  const titles = {
    applications: "Franchise Partnerships",
    orders: "Order Pipeline",
    products: "Product Catalog",
    hubs: "Physical Franchise Spokes",
    supply_chain: "Commissary Logistics & Batches"
  } as const;

  const descriptions = {
    applications: "Review investment capabilities and applicant targets",
    orders: "Real-time dispatch and delivery monitoring across hubs",
    products: "HQ Centralized command and live branch sync",
    hubs: "Interactive control of regional operations hubs",
    supply_chain: "FIFO Batch integrity tracking and recipe formula config"
  } as const;

  return (
    <header className="flex justify-between items-center">
      <div>
        <h2 className="text-lg font-bold text-brand-earth uppercase tracking-wide">
          {titles[activeTab]}
        </h2>
        <p className="text-[10px] text-brand-earth/40 font-semibold uppercase tracking-wider mt-0.5">
          {descriptions[activeTab]}
        </p>
      </div>

      {activeTab === 'products' && (
        <button
          onClick={onAddProduct}
          className="bg-brand-earth hover:bg-brand-green text-white px-4 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-colors shadow-sm"
        >
          Add Product
        </button>
      )}

      {activeTab === 'hubs' && (
        <button
          onClick={onCreateHub}
          className="bg-brand-earth hover:bg-brand-green text-white px-4 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-colors shadow-sm"
        >
          Create Franchise Hub
        </button>
      )}
    </header>
  );
}
