interface AdminSidebarProps {
  activeTab: 'applications' | 'orders' | 'products' | 'hubs' | 'supply_chain';
  setActiveTab: (tab: 'applications' | 'orders' | 'products' | 'hubs' | 'supply_chain') => void;
  handleLogout: () => void;
}

export default function AdminSidebar({ activeTab, setActiveTab, handleLogout }: AdminSidebarProps) {
  const tabs = [
    { id: 'applications', label: 'Partner Applications' },
    { id: 'orders', label: 'Order Management' },
    { id: 'products', label: 'Product Catalog' },
    { id: 'hubs', label: 'Franchise Branches' },
    { id: 'supply_chain', label: 'Supply Chain & Batches' }
  ] as const;

  return (
    <aside className="w-64 border-r border-gray-100 bg-white flex flex-col justify-between p-6 select-none shrink-0">
      <div className="space-y-8">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center border border-brand-green/20">
            <span className="text-[11px] font-bold text-brand-green uppercase">HQ</span>
          </div>
          <div>
            <h1 className="text-xs font-bold text-brand-earth uppercase tracking-wider leading-none">Liling's Pastil</h1>
            <p className="text-[9px] font-semibold text-brand-earth/30 uppercase tracking-widest mt-0.5">Control Center</p>
          </div>
        </div>

        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-earth text-white shadow-sm'
                  : 'text-brand-earth/50 hover:bg-gray-50 hover:text-brand-earth'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <button 
        onClick={handleLogout}
        className="w-full border border-gray-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-brand-earth/40 transition-colors"
      >
        Sign Out
      </button>
    </aside>
  );
}
