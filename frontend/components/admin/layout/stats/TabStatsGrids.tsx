import React from "react";
import { StatsCard } from "./StatsCard";
import { FranchiseApplication, Order, Product, Hub } from "@/types/admin";

// ==========================================
// 1. Analytics Stats Grid
// ==========================================
interface AnalyticsStatsProps {
  totalRevenue: number;
  avgMargin: number;
  foodWasteRatio: number;
  branchesCount: number;
}

export function AnalyticsStats({ totalRevenue, avgMargin, foodWasteRatio, branchesCount }: AnalyticsStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-fade-in">
      <StatsCard
        label="Total Sales Revenue"
        value={`₱ ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      />
      <StatsCard
        label="Average Profit Margin"
        value={`${avgMargin.toFixed(1)}%`}
        valueColor="text-brand-green"
      />
      <StatsCard
        label="Food Waste Ratio"
        value={`${foodWasteRatio.toFixed(1)}%`}
        valueColor="text-rose-600"
      />
      <StatsCard
        label="Franchise Spokes"
        value={`${branchesCount} Active Branches`}
      />
    </div>
  );
}

// ==========================================
// 2. Users Stats Grid
// ==========================================
interface UsersStatsProps {
  totalStaff: number;
  hqOpsCount: number;
  franchiseeCount: number;
  cashierCount: number;
}

export function UsersStats({ totalStaff, hqOpsCount, franchiseeCount, cashierCount }: UsersStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-fade-in">
      <StatsCard
        label="Total Users Active"
        value={`${totalStaff} Personnel`}
      />
      <StatsCard
        label="HQ Operations Directors"
        value={`${hqOpsCount} Members`}
        valueColor="text-brand-green"
      />
      <StatsCard
        label="Franchise Owners"
        value={`${franchiseeCount} Active Partners`}
      />
      <StatsCard
        label="Branch Cashiers"
        value={`${cashierCount} Cashiers`}
      />
    </div>
  );
}

// ==========================================
// 3. Compliance Stats Grid
// ==========================================
interface ComplianceStatsProps {
  totalAudits: number;
  avgHygiene: number;
  avgRecipe: number;
  violationsCount: number;
}

export function ComplianceStats({ totalAudits, avgHygiene, avgRecipe, violationsCount }: ComplianceStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-fade-in">
      <StatsCard
        label="Total Audits Logged"
        value={`${totalAudits} Audits`}
      />
      <StatsCard
        label="Hygiene Average"
        value={`${avgHygiene.toFixed(1)}% Score`}
        valueColor="text-brand-green"
      />
      <StatsCard
        label="Recipe Adherence"
        value={`${avgRecipe.toFixed(1)}% Taste Adherence`}
      />
      <StatsCard
        label="Violations Flagged"
        value={`${violationsCount} Violations`}
        valueColor="text-rose-600"
      />
    </div>
  );
}

// ==========================================
// 4. Payroll Stats Grid
// ==========================================
interface PayrollStatsProps {
  completedShifts: number;
  activeShifts: number;
  totalCommissions: number;
  totalGrossPayroll: number;
}

export function PayrollStats({ completedShifts, activeShifts, totalCommissions, totalGrossPayroll }: PayrollStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-fade-in">
      <StatsCard
        label="Work Shifts Logged"
        value={`${completedShifts} Completed Shifts`}
      />
      <StatsCard
        label="Active cashiers online"
        value={`${activeShifts} Live Shifts`}
        valueColor="text-brand-green"
      />
      <StatsCard
        label="Commission pay disbursed"
        value={`₱ ${totalCommissions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Comm`}
      />
      <StatsCard
        label="Gross Payroll Ledger"
        value={`₱ ${totalGrossPayroll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Gross`}
      />
    </div>
  );
}

// ==========================================
// 5. Applications Stats Grid
// ==========================================
interface ApplicationsStatsProps {
  applications: FranchiseApplication[];
}

export function ApplicationsStats({ applications }: ApplicationsStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <StatsCard
        label="Total Applicants"
        value={applications.length}
      />
      <StatsCard
        label="Approved Partners"
        value={applications.filter(a => a.status === 'approved').length}
        valueColor="text-brand-green"
      />
      <StatsCard
        label="Pending Review"
        value={applications.filter(a => a.status === 'pending').length}
        valueColor="text-amber-600"
      />
      <StatsCard
        label="Rejected"
        value={applications.filter(a => a.status === 'rejected').length}
        valueColor="text-rose-600"
      />
    </div>
  );
}

// ==========================================
// 6. Orders Stats Grid
// ==========================================
interface OrdersStatsProps {
  orders: Order[];
}

export function OrdersStats({ orders }: OrdersStatsProps) {
  const revenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <StatsCard
        label="Total Orders"
        value={orders.length}
      />
      <StatsCard
        label="Delivered Orders"
        value={orders.filter(o => o.status === 'delivered').length}
        valueColor="text-brand-green"
      />
      <StatsCard
        label="Pending/Preparing"
        value={orders.filter(o => o.status === 'pending' || o.status === 'preparing').length}
        valueColor="text-amber-600"
      />
      <StatsCard
        label="Delivered Revenue"
        value={`₱${revenue.toFixed(2)}`}
      />
    </div>
  );
}

// ==========================================
// 6b. B2B Commissary Restocks Stats Grid
// ==========================================
interface B2BOrdersStatsProps {
  b2bOrders: any[];
}

export function B2BOrdersStats({ b2bOrders }: B2BOrdersStatsProps) {
  const totalValue = b2bOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-fade-in">
      <StatsCard
        label="Total B2B Restocks"
        value={b2bOrders.length}
      />
      <StatsCard
        label="Delivered Restocks"
        value={b2bOrders.filter(o => o.status === 'delivered').length}
        valueColor="text-brand-green"
      />
      <StatsCard
        label="Preparing / Transit"
        value={b2bOrders.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'out_for_delivery').length}
        valueColor="text-amber-600"
      />
      <StatsCard
        label="Disbursed Restock Value"
        value={`₱${totalValue.toFixed(2)}`}
      />
    </div>
  );
}

// ==========================================
// 7. Products Stats Grid
// ==========================================
interface ProductsStatsProps {
  products: Product[];
}

export function ProductsStats({ products }: ProductsStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <StatsCard
        label="Catalog Size"
        value={`${products.length} Items`}
      />
      <StatsCard
        label="Retail Exclusive"
        value={products.filter(p => !p.is_wholesale).length}
        valueColor="text-stone-600"
      />
      <StatsCard
        label="Wholesale Bulk"
        value={products.filter(p => p.is_wholesale).length}
        valueColor="text-brand-green"
      />
      <StatsCard
        label="Active Products"
        value={products.filter(p => p.is_active).length}
      />
    </div>
  );
}

// ==========================================
// 8. Supply Chain Stats Grid
// ==========================================
interface SupplyChainStatsProps {
  ingredients: any[];
  batches: any[];
}

export function SupplyChainStats({ ingredients, batches }: SupplyChainStatsProps) {
  const totalIngredients = ingredients.length;
  const lowStockIngredients = ingredients.filter(i => Number(i.stock) <= Number(i.min_stock)).length;
  const totalBatches = batches.length;
  const expiringBatches = batches.filter(b => {
    const daysRemaining = Math.ceil((new Date(b.expiry_date).getTime() - Date.now()) / (1000 * 3600 * 24));
    return daysRemaining <= 3 && daysRemaining >= 0;
  }).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <StatsCard
        label="Total Raw Materials"
        value={`${totalIngredients} Items`}
      />
      <StatsCard
        label="Depleted / Low Stock"
        value={lowStockIngredients}
        valueColor="text-amber-600"
      />
      <StatsCard
        label="FIFO Batches Loaded"
        value={`${totalBatches} Batches`}
        valueColor="text-brand-green"
      />
      <StatsCard
        label="Near-Expiry Warnings"
        value={expiringBatches}
        valueColor="text-rose-600"
      />
    </div>
  );
}

// ==========================================
// 9. Hubs Stats Grid
// ==========================================
interface HubsStatsProps {
  hubs: Hub[];
}

export function HubsStats({ hubs }: HubsStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <StatsCard
        label="Hub Spoke Network"
        value={`${hubs.length} Spokes`}
      />
      <StatsCard
        label="Active Locations"
        value={hubs.filter(h => h.status === 'active').length}
        valueColor="text-brand-green"
      />
      <StatsCard
        label="Assigned Franchisees"
        value={hubs.filter(h => h.franchisee_id).length}
      />
      <StatsCard
        label="Under Maintenance"
        value={hubs.filter(h => h.status === 'inactive').length}
        valueColor="text-rose-600"
      />
    </div>
  );
}
