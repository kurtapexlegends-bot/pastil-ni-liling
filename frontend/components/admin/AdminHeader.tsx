import { List } from "@phosphor-icons/react";

interface AdminHeaderProps {
  activeTab: 'applications' | 'orders' | 'products' | 'hubs' | 'supply_chain' | 'employees' | 'compliance' | 'payroll' | 'analytics' | 'website_content';
  onToggleSidebar?: () => void;
}

export default function AdminHeader({ activeTab, onToggleSidebar }: AdminHeaderProps) {
  const titles = {
    analytics: "Enterprise Business Intelligence",
    applications: "Franchise Partnerships",
    orders: "Order Pipeline",
    products: "Product Catalog",
    hubs: "Physical Franchise Spokes",
    supply_chain: "Commissary Logistics & Batches",
    employees: "Personnel Access Control",
    compliance: "Digital QC Audits",
    payroll: "Branch Payroll & Shift Logs",
    website_content: "Website Content Manager"
  } as const;

  const descriptions = {
    analytics: "Real-time gross margins, comparative spoke performance, and flavor forecaster",
    applications: "Review investment capabilities and applicant targets",
    orders: "Real-time dispatch and delivery monitoring across hubs",
    products: "HQ Centralized command and live branch sync",
    hubs: "Interactive control of regional operations hubs",
    supply_chain: "FIFO Batch integrity tracking and recipe formula config",
    employees: "Define custom RBAC permission locks and terminate staff credentials",
    compliance: "Review weekly branch cleanliness logs and recipe standard checks",
    payroll: "Dry run direct payouts and track cashier 5% POS sales commissions",
    website_content: "Modify public-facing marketing material"
  } as const;

  return (
    <header className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-100 text-brand-earth hover:bg-gray-50 hover:text-brand-green transition-all shadow-sm shrink-0"
            aria-label="Toggle Sidebar Menu"
          >
            <List size={20} weight="bold" />
          </button>
        )}
        <div>
          <h2 className="text-lg font-bold text-brand-earth uppercase tracking-wide leading-tight">
            {titles[activeTab as keyof typeof titles]}
          </h2>
          <p className="text-[10px] text-brand-earth/40 font-semibold uppercase tracking-wider mt-0.5 leading-snug">
            {descriptions[activeTab as keyof typeof descriptions]}
          </p>
        </div>
      </div>
    </header>
  );
}
