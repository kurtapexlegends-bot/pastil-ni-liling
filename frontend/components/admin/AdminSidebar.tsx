'use client';

import { 
  ChartPieSlice, 
  Handshake, 
  Receipt, 
  BowlFood, 
  Storefront, 
  Package, 
  UsersThree, 
  ShieldCheck, 
  Coins, 
  SignOut 
} from '@phosphor-icons/react';

interface AdminSidebarProps {
  activeTab: 'applications' | 'orders' | 'products' | 'hubs' | 'supply_chain' | 'employees' | 'compliance' | 'payroll' | 'analytics';
  setActiveTab: (tab: 'applications' | 'orders' | 'products' | 'hubs' | 'supply_chain' | 'employees' | 'compliance' | 'payroll' | 'analytics') => void;
  handleLogout: () => void;
}

export default function AdminSidebar({ activeTab, setActiveTab, handleLogout }: AdminSidebarProps) {
  const groups = [
    {
      title: 'Intelligence',
      items: [
        { id: 'analytics', label: 'Analytics', icon: ChartPieSlice },
      ]
    },
    {
      title: 'Operations',
      items: [
        { id: 'orders', label: 'Orders', icon: Receipt },
        { id: 'products', label: 'Products', icon: BowlFood },
        { id: 'hubs', label: 'Branches', icon: Storefront },
        { id: 'supply_chain', label: 'Inventory', icon: Package },
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'applications', label: 'Applications', icon: Handshake },
        { id: 'employees', label: 'Employees', icon: UsersThree },
        { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
        { id: 'payroll', label: 'Payroll', icon: Coins }
      ]
    }
  ] as const;

  return (
    <aside className="w-64 border-r border-gray-100 bg-white flex flex-col justify-between p-6 select-none shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div className="space-y-6">
        {/* Header/Logo Branding */}
        <div className="flex items-center gap-2.5 px-2 pb-2">
          <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center border border-brand-green/20">
            <span className="text-[11px] font-bold text-brand-green uppercase">HQ</span>
          </div>
          <div>
            <h1 className="text-xs font-black text-brand-earth uppercase tracking-wider leading-none">Liling's Pastil</h1>
            <p className="text-[9px] font-bold text-brand-earth/30 uppercase tracking-widest mt-0.5">Control Center</p>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <h2 className="text-[8px] font-black uppercase tracking-widest text-brand-earth/30 px-3">
                {group.title}
              </h2>
              <nav className="space-y-0.5">
                {group.items.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all group ${
                        isActive
                          ? 'bg-brand-earth text-white shadow-sm shadow-brand-earth/10'
                          : 'text-brand-earth/50 hover:bg-gray-50 hover:text-brand-earth'
                      }`}
                    >
                      <Icon 
                        size={16} 
                        weight="duotone" 
                        className={`transition-colors ${
                          isActive
                            ? 'text-brand-yellow'
                            : 'text-brand-earth/40 group-hover:text-brand-earth'
                        }`} 
                      />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Logout Footer Section */}
      <button 
        onClick={handleLogout}
        className="w-full border border-gray-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-brand-earth/40 transition-colors"
      >
        <SignOut size={14} weight="duotone" />
        Sign Out
      </button>
    </aside>
  );
}
