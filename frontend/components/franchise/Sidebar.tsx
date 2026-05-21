'use client';

import { 
  Truck, 
  DeviceTablet, 
  ShieldCheck, 
  Coins, 
  Receipt, 
  SignOut 
} from '@phosphor-icons/react';

interface FranchiseSidebarProps {
  activeTab: 'logistics' | 'pos' | 'compliance' | 'payroll' | 'expenses';
  setActiveTab: (tab: 'logistics' | 'pos' | 'compliance' | 'payroll' | 'expenses') => void;
  handleLogout: () => void;
  isFranchisee: boolean;
  isCashier: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function FranchiseSidebar({ 
  activeTab, 
  setActiveTab, 
  handleLogout, 
  isFranchisee,
  isCashier,
  isOpen = false, 
  onClose 
}: FranchiseSidebarProps) {

  // Build navigation menu groups
  const groups = [
    {
      title: 'Operations',
      items: [
        { id: 'pos', label: 'POS Cashier', icon: DeviceTablet, show: true },
        { id: 'logistics', label: 'Logistics', icon: Truck, show: isFranchisee },
      ]
    },
    {
      title: 'Management',
      items: [
        { id: 'compliance', label: 'QC Compliance', icon: ShieldCheck, show: isFranchisee },
        { id: 'payroll', label: 'Shifts & Payroll', icon: Coins, show: true },
        { id: 'expenses', label: 'Expenses', icon: Receipt, show: true },
      ]
    }
  ] as const;

  return (
    <>
      {/* Backdrop for Mobile Drawer */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-brand-earth/20 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`border-r border-gray-100 bg-white flex flex-col justify-between p-6 select-none shrink-0 h-screen overflow-y-auto transition-transform duration-300 lg:translate-x-0 lg:w-64 lg:static lg:flex z-50
        ${isOpen ? 'fixed inset-y-0 left-0 w-64 translate-x-0 shadow-2xl' : 'fixed inset-y-0 left-0 w-64 -translate-x-full lg:flex'}
      `}>
        <div className="space-y-6">
          {/* Header/Logo Branding */}
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center border border-brand-green/20">
                <span className="text-[11px] font-bold text-brand-green uppercase">
                  {isCashier ? 'CS' : 'FR'}
                </span>
              </div>
              <div>
                <h1 className="text-xs font-bold text-brand-earth uppercase tracking-wider leading-none">Liling's Franchise</h1>
                <p className="text-[9px] font-semibold text-brand-earth/40 uppercase tracking-widest mt-1">
                  {isCashier ? 'Cashier Station' : 'Partner Portal'}
                </p>
              </div>
            </div>
            {onClose && (
              <button 
                onClick={onClose}
                className="lg:hidden w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs text-brand-earth/70 hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Navigation Groups */}
          <div className="space-y-5">
            {groups.map((group) => {
              // Check if group has any visible items
              const visibleItems = group.items.filter(item => item.show);
              if (visibleItems.length === 0) return null;

              return (
                <div key={group.title} className="space-y-1.5">
                  <h2 className="text-[8px] font-bold uppercase tracking-widest text-brand-earth/40 px-3">
                    {group.title}
                  </h2>
                  <nav className="space-y-0.5">
                    {visibleItems.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id as any);
                            onClose?.();
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all group ${
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
              );
            })}
          </div>
        </div>

        {/* Logout Footer Section */}
        <button 
          onClick={handleLogout}
          className="w-full border border-gray-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest text-brand-earth/40 transition-colors"
        >
          <SignOut size={14} weight="duotone" />
          Sign Out
        </button>
      </aside>
    </>
  );
}
