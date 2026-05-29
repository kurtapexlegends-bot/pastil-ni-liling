"use client";

import useSWR from 'swr';
import { deleteCookie } from '@/lib/cookies';
import { FranchiseApplication, Order, Product, Hub } from "@/types/admin";
import { 
  AnalyticsStats, 
  EmployeesStats, 
  ComplianceStats, 
  PayrollStats, 
  ApplicationsStats, 
  OrdersStats, 
  B2BOrdersStats,
  ProductsStats, 
  SupplyChainStats, 
  HubsStats 
} from "./stats/TabStatsGrids";

interface StatsGridProps {
  activeTab: 'applications' | 'orders' | 'products' | 'hubs' | 'supply_chain' | 'employees' | 'compliance' | 'payroll' | 'analytics' | 'website_content';
  applications: FranchiseApplication[];
  orders: Order[];
  products: Product[];
  hubs: Hub[];
  ingredients?: any[];
  batches?: any[];
  b2bOrders?: any[];
  orderViewMode?: 'b2c' | 'b2b';
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Missing authentication token.');
  
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    deleteCookie('token');
    deleteCookie('user_role');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }

  return res.json();
};

export default function StatsGrid({ activeTab, applications, orders, products, hubs, ingredients = [], batches = [], b2bOrders = [], orderViewMode = 'b2c' }: StatsGridProps) {
  // 1. Fetch Employees Data
  const { data: empRes } = useSWR(
    activeTab === 'employees' ? 'http://127.0.0.1:8000/api/admin/employees' : null,
    fetcher
  );
  const employeesList = empRes?.success ? empRes.data : [];
  const totalStaff = employeesList.length;
  const hqOpsCount = employeesList.filter((e: any) => e.roles?.some((r: any) => r.name === 'HQ operations')).length;
  const franchiseeCount = employeesList.filter((e: any) => e.roles?.some((r: any) => r.name === 'Franchisee')).length;
  const cashierCount = employeesList.filter((e: any) => e.roles?.some((r: any) => r.name === 'Branch Cashier')).length;

  // 2. Fetch Compliance Data
  const { data: auditRes } = useSWR(
    activeTab === 'compliance' ? 'http://127.0.0.1:8000/api/compliance/audits' : null,
    fetcher
  );
  const auditsList = auditRes?.success ? auditRes.data : [];
  const totalAudits = auditsList.length;
  const avgHygiene = totalAudits > 0 
    ? auditsList.reduce((sum: number, a: any) => sum + Number(a.hygiene_score), 0) / totalAudits 
    : 0;
  const avgRecipe = totalAudits > 0 
    ? auditsList.reduce((sum: number, a: any) => sum + Number(a.recipe_adherence_score), 0) / totalAudits 
    : 0;
  const violationsCount = auditsList.filter((a: any) => a.status === 'flagged').length;

  // 3. Fetch Payroll and Shifts Data
  const { data: shiftRes } = useSWR(
    activeTab === 'payroll' ? 'http://127.0.0.1:8000/api/payroll/shifts' : null,
    fetcher
  );
  const { data: payoutRes } = useSWR(
    activeTab === 'payroll' ? 'http://127.0.0.1:8000/api/payroll/payouts' : null,
    fetcher
  );
  const shiftsList = shiftRes?.success ? shiftRes.data : [];
  const payoutsList = payoutRes?.success ? payoutRes.data : [];
  
  const completedShifts = shiftsList.filter((s: any) => s.status === 'completed').length;
  const activeShifts = shiftsList.filter((s: any) => s.status === 'active').length;
  const totalCommissions = payoutsList.reduce((sum: number, p: any) => sum + Number(p.commission_pay), 0);
  const totalGrossPayroll = payoutsList.reduce((sum: number, p: any) => sum + Number(p.total_pay), 0);

  // 4. Fetch Analytics Data
  const { data: analyticsRes } = useSWR(
    activeTab === 'analytics' ? 'http://127.0.0.1:8000/api/analytics/summary' : null,
    fetcher
  );
  const analyticsData = analyticsRes?.success ? analyticsRes.data : null;
  const totalRevenue = analyticsData?.gross_margins?.total_revenue ?? 0;
  const avgMargin = analyticsData?.gross_margins?.margin_percent ?? 0;
  const foodWasteRatio = analyticsData?.food_waste?.waste_rate_percent ?? 0;
  const branchesCount = analyticsData?.branches?.length ?? 0;

  if (activeTab === 'website_content') {
    return null;
  }

  switch (activeTab) {
    case 'analytics':
      return (
        <AnalyticsStats 
          totalRevenue={totalRevenue} 
          avgMargin={avgMargin} 
          foodWasteRatio={foodWasteRatio} 
          branchesCount={branchesCount} 
        />
      );
    case 'employees':
      return (
        <EmployeesStats 
          totalStaff={totalStaff} 
          hqOpsCount={hqOpsCount} 
          franchiseeCount={franchiseeCount} 
          cashierCount={cashierCount} 
        />
      );
    case 'compliance':
      return (
        <ComplianceStats 
          totalAudits={totalAudits} 
          avgHygiene={avgHygiene} 
          avgRecipe={avgRecipe} 
          violationsCount={violationsCount} 
        />
      );
    case 'payroll':
      return (
        <PayrollStats 
          completedShifts={completedShifts} 
          activeShifts={activeShifts} 
          totalCommissions={totalCommissions} 
          totalGrossPayroll={totalGrossPayroll} 
        />
      );
    case 'applications':
      return <ApplicationsStats applications={applications} />;
    case 'orders':
      return orderViewMode === 'b2b' 
        ? <B2BOrdersStats b2bOrders={b2bOrders} />
        : <OrdersStats orders={orders} />;
    case 'products':
      return <ProductsStats products={products} />;
    case 'supply_chain':
      return <SupplyChainStats ingredients={ingredients} batches={batches} />;
    case 'hubs':
      return <HubsStats hubs={hubs} />;
    default:
      return null;
  }
}
