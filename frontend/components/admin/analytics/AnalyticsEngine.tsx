'use client';

import useSWR from 'swr';
import SalesAndMargins from './SalesAndMargins';
import SupplyAndWaste from './SupplyAndWaste';
import SpokesAndFlavors from './SpokesAndFlavors';
import { deleteCookie } from '@/lib/cookies';

interface MarginData {
  total_revenue: number;
  cogs: number;
  labor_cost: number;
  waste_cost: number;
  expenses_cost: number;
  gross_profit: number;
  margin_percent: number;
}

interface HubPerformance {
  id: number;
  name: string;
  revenue: number;
  compliance_score: number;
  active_stock: number;
  wasted_stock: number;
}

interface WasteMetrics {
  expired_jars_count: number;
  waste_cost_php: number;
  waste_rate_percent: number;
  total_produced_jars: number;
}

interface TimelineData {
  day: string;
  retail: number;
  wholesale: number;
  pos: number;
}

interface SafetyStockData {
  ingredient: string;
  current: number;
  safety: number;
  unit: string;
}

interface FlavorTrend {
  flavor: string;
  units_sold: number;
  share_percent: number;
  projected_weekly_growth: number;
  demand_status: string;
}

interface AnalyticsData {
  gross_margins: MarginData;
  branches: HubPerformance[];
  food_waste: WasteMetrics;
  sales_timeline: TimelineData[];
  ingredients_safety: SafetyStockData[];
  trends: FlavorTrend[];
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

export default function AnalyticsEngine() {
  const { data: resData, error, isLoading } = useSWR('http://127.0.0.1:8000/api/analytics/summary', fetcher, {
    refreshInterval: 60000 // Auto-poll every minute for live dashboard updates
  });
  
  const data: AnalyticsData | null = resData?.success ? resData.data : null;
  const loading = isLoading;
  const fetchError = error ? 'Failed to establish network connection with the intelligence server.' : (resData && !resData.success ? resData.message : null);

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 p-12 rounded-2xl text-center space-y-3 shadow-sm">
        <div className="w-8 h-8 rounded-full border-2 border-brand-green border-t-transparent animate-spin mx-auto"></div>
        <p className="text-xs text-brand-earth/50 font-medium uppercase tracking-wider animate-pulse">
          Loading analytics...
        </p>
      </div>
    );
  }

  if (fetchError || !data) {
    return (
      <div className="bg-white border border-red-100 p-8 rounded-2xl text-center space-y-2 shadow-sm">
        <p className="text-xs font-bold text-red-500 uppercase tracking-wider">
          Analytics Offline
        </p>
        <p className="text-[10px] text-brand-earth/50 leading-relaxed max-w-md mx-auto">
          {fetchError || 'Could not load analytics summary.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-brand-earth">
      {/* SECTION 1: ENTERPRISE FINANCIAL ALLOCATION & REVENUE TIMELINE */}
      <SalesAndMargins
        salesTimeline={data.sales_timeline}
        grossMargins={data.gross_margins}
      />

      {/* SECTION 2: SUPPLY CHAIN STOCK-TO-SAFETY INDEX BAR GRAPH */}
      <SupplyAndWaste
        ingredientsSafety={data.ingredients_safety}
        foodWaste={data.food_waste}
      />

      {/* SECTION 3: SPOKE PERFORMANCE BUBBLE MATRIX CHART & DEMAND FORECASTER */}
      <SpokesAndFlavors branches={data.branches} trends={data.trends} />
    </div>
  );
}
