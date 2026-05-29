import { List } from "@phosphor-icons/react";

interface AdminHeaderProps {
  activeTab: 'applications' | 'orders' | 'products' | 'hubs' | 'supply_chain' | 'users' | 'compliance' | 'payroll' | 'analytics' | 'website_content';
  onToggleSidebar?: () => void;
}

export default function AdminHeader({ activeTab, onToggleSidebar }: AdminHeaderProps) {
  const titles = {
    analytics: "Business Analytics",
    applications: "Franchise Applications",
    orders: "Orders Dashboard",
    products: "Product Management",
    hubs: "Branch Management",
    supply_chain: "Inventory & Batch Logistics",
    users: "User Registry",
    compliance: "Quality Control & Audits",
    payroll: "Staff Payroll",
    website_content: "Website Content"
  } as const;

  const descriptions = {
    analytics: "Track sales revenue, profit margins, and food waste",
    applications: "Review and manage incoming franchise applications",
    orders: "Monitor customer orders (B2C) and commissary restocks (B2B)",
    products: "Add, edit, or remove products and wholesale items",
    hubs: "Manage regional branches and assign franchise partners",
    supply_chain: "Track raw materials, manufacture batches, and recipes",
    users: "Manage user accounts, roles, and permissions",
    compliance: "Review weekly kitchen hygiene logs and recipe adherence checks",
    payroll: "Track cashier shifts, sales commissions, and payroll logs",
    website_content: "Customize public-facing marketing texts and banner settings"
  } as const;

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "analytics": return titles.analytics;
      case "applications": return titles.applications;
      case "orders": return titles.orders;
      case "products": return titles.products;
      case "hubs": return titles.hubs;
      case "supply_chain": return titles.supply_chain;
      case "users": return titles.users;
      case "compliance": return titles.compliance;
      case "payroll": return titles.payroll;
      case "website_content": return titles.website_content;
      default: return "";
    }
  };

  const getTabDesc = (tab: string) => {
    switch (tab) {
      case "analytics": return descriptions.analytics;
      case "applications": return descriptions.applications;
      case "orders": return descriptions.orders;
      case "products": return descriptions.products;
      case "hubs": return descriptions.hubs;
      case "supply_chain": return descriptions.supply_chain;
      case "users": return descriptions.users;
      case "compliance": return descriptions.compliance;
      case "payroll": return descriptions.payroll;
      case "website_content": return descriptions.website_content;
      default: return "";
    }
  };

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
            {getTabTitle(activeTab)}
          </h2>
          <p className="text-[10px] text-brand-earth/40 font-semibold uppercase tracking-wider mt-0.5 leading-snug">
            {getTabDesc(activeTab)}
          </p>
        </div>
      </div>
    </header>
  );
}
