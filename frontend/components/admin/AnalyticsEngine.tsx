'use client';

import { useState, useEffect } from 'react';
import SalesAndMargins from './analytics/SalesAndMargins';
import SupplyAndWaste from './analytics/SupplyAndWaste';
import SpokesAndFlavors from './analytics/SpokesAndFlavors';

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

export default function AnalyticsEngine() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Missing authentication token.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://127.0.0.1:8000/api/analytics/summary', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.message || 'Failed to load BI analytics summary.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to establish network connection with the intelligence server.');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 p-12 rounded-2xl text-center space-y-3 shadow-sm">
        <div className="w-8 h-8 rounded-full border-2 border-brand-green border-t-transparent animate-spin mx-auto"></div>
        <p className="text-xs text-brand-earth/50 font-medium uppercase tracking-wider animate-pulse">
          Running advanced BI predictive algorithms...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white border border-red-100 p-8 rounded-2xl text-center space-y-2 shadow-sm">
        <p className="text-xs font-bold text-red-500 uppercase tracking-wider">
          Intelligence System Offline
        </p>
        <p className="text-[10px] text-brand-earth/50 leading-relaxed max-w-md mx-auto">
          {error || 'Could not retrieve corporate intelligence parameters.'}
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
