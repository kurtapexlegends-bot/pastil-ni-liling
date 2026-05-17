"use client";

import { useState, useEffect } from "react";

interface MarginData {
  total_revenue: number;
  cogs: number;
  labor_cost: number;
  waste_cost: number;
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
  trends: FlavorTrend[];
}

export default function AnalyticsEngine() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Missing authentication token.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:8000/api/analytics/summary", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.message || "Failed to load BI analytics summary.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to establish network connection with the intelligence server.");
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
        <p className="text-xs text-brand-earth/50 font-medium uppercase tracking-wider animate-pulse">Running advanced BI predictive algorithms...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white border border-red-100 p-8 rounded-2xl text-center space-y-2 shadow-sm">
        <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Intelligence System Offline</p>
        <p className="text-[10px] text-brand-earth/50 leading-relaxed max-w-md mx-auto">{error || "Could not retrieve corporate intelligence parameters."}</p>
      </div>
    );
  }

  const { gross_margins, branches, food_waste, trends } = data;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Dynamic Visual Breakdown of Revenue */}
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6">
        <div>
          <h3 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Enterprise Margin Allocation</h3>
          <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Real-time breakdown of gross revenue into cost structures and net margins</p>
        </div>

        <div className="space-y-4">
          {/* Compound Allocation Bar */}
          <div className="h-6 w-full rounded-full overflow-hidden flex shadow-inner border border-gray-100">
            <div 
              style={{ width: `${(gross_margins.cogs / gross_margins.total_revenue) * 100}%` }} 
              className="bg-brand-earth/40 h-full relative group transition-all"
              title={`COGS: ₱${gross_margins.cogs.toFixed(2)}`}
            />
            <div 
              style={{ width: `${(gross_margins.labor_cost / gross_margins.total_revenue) * 100}%` }} 
              className="bg-brand-yellow/60 h-full relative group transition-all"
              title={`Labor: ₱${gross_margins.labor_cost.toFixed(2)}`}
            />
            <div 
              style={{ width: `${(gross_margins.waste_cost / gross_margins.total_revenue) * 100}%` }} 
              className="bg-red-400/80 h-full relative group transition-all"
              title={`Waste: ₱${gross_margins.waste_cost.toFixed(2)}`}
            />
            <div 
              style={{ width: `${(gross_margins.gross_profit / gross_margins.total_revenue) * 100}%` }} 
              className="bg-brand-green h-full relative group transition-all"
              title={`Net Margin: ₱${gross_margins.gross_profit.toFixed(2)}`}
            />
          </div>

          {/* Allocation Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-brand-earth/40 block shrink-0" />
              <div>
                <p className="text-[9px] text-brand-earth/40 font-semibold uppercase tracking-wider">COGS Factors (42%)</p>
                <p className="text-xs font-bold text-brand-earth">₱{gross_margins.cogs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-brand-yellow/60 block shrink-0" />
              <div>
                <p className="text-[9px] text-brand-earth/40 font-semibold uppercase tracking-wider">Labor & Commissions</p>
                <p className="text-xs font-bold text-brand-earth">₱{gross_margins.labor_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-red-400/80 block shrink-0" />
              <div>
                <p className="text-[9px] text-brand-earth/40 font-semibold uppercase tracking-wider">Food Waste / Expirations</p>
                <p className="text-xs font-bold text-brand-earth">₱{gross_margins.waste_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-brand-green block shrink-0" />
              <div>
                <p className="text-[9px] text-brand-earth/40 font-semibold uppercase tracking-wider">Net Profit ({gross_margins.margin_percent.toFixed(1)}%)</p>
                <p className="text-xs font-bold text-brand-green">₱{gross_margins.gross_profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Branch Comparative Rankings */}
        <div className="lg:col-span-2 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Comparative Spoke Analytics</h3>
            <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Live performance ranking by revenue, quality assurance, and shelf depletion rates</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 text-[9px] font-bold uppercase tracking-wider text-brand-earth/40">
                  <th className="py-3 px-2">Franchise Branch Spoke</th>
                  <th className="py-3 px-2 text-right">Gross Sales</th>
                  <th className="py-3 px-2 text-center">QC Score</th>
                  <th className="py-3 px-2 text-center">Active Stock</th>
                  <th className="py-3 px-2 text-center">Expired / Wasted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-[10px]">
                {branches.map((branch, idx) => (
                  <tr key={branch.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-2 font-semibold text-brand-earth flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-brand-earth/5 text-[9px] font-bold flex items-center justify-center text-brand-earth">
                        {idx + 1}
                      </span>
                      {branch.name}
                    </td>
                    <td className="py-3.5 px-2 text-right font-bold text-brand-earth">
                      ₱{branch.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-2 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] ${
                        branch.compliance_score >= 95 ? 'bg-green-50 text-green-700' :
                        branch.compliance_score >= 90 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {branch.compliance_score}%
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-center text-brand-earth/60 font-semibold">
                      {branch.active_stock} jars
                    </td>
                    <td className="py-3.5 px-2 text-center">
                      <span className={`font-semibold ${branch.wasted_stock > 0 ? 'text-red-500' : 'text-brand-earth/30'}`}>
                        {branch.wasted_stock} jars
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Circular Waste Tracker Card */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-xs font-bold text-brand-earth uppercase tracking-wider">FIFO Food Waste Tracker</h3>
            <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Automated batch shelf-life audit and raw materials depreciation valuation</p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            {/* Elegant Circular Progress Graph */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-red-400 transition-all duration-1000 ease-out"
                  strokeDasharray={`${food_waste.waste_rate_percent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-lg font-bold text-brand-earth">{food_waste.waste_rate_percent}%</span>
                <p className="text-[7px] text-brand-earth/30 uppercase tracking-wider font-bold">Waste Ratio</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-brand-earth/50">Wasted Batches Cost Factor</p>
              <p className="text-base font-extrabold text-red-500">₱{food_waste.waste_cost_php.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <p className="text-[8px] text-brand-earth/30 uppercase tracking-wider font-semibold">
                {food_waste.expired_jars_count} Jars Discarded of {food_waste.total_produced_jars} Produced
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Flavor Trend Predictions Panel */}
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6">
        <div>
          <h3 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Flavor Demand Forecaster</h3>
          <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Moving average flavor metrics with integrated weekly growth projection metrics</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {trends.map((trend) => (
            <div 
              key={trend.flavor} 
              className="border border-gray-50 bg-gray-50/20 p-5 rounded-xl space-y-4 hover:border-brand-green/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <p className="text-[10px] font-bold text-brand-earth">{trend.flavor}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-wider ${
                    trend.demand_status === 'High Surge' ? 'bg-red-50 text-red-600' :
                    trend.demand_status === 'Stable Growth' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {trend.demand_status}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-2">
                  <div>
                    <p className="text-[7px] text-brand-earth/30 uppercase tracking-wider font-semibold">Total Retail Units Sold</p>
                    <p className="text-lg font-bold text-brand-earth">{trend.units_sold} jars</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[7px] text-brand-earth/30 uppercase tracking-wider font-semibold">Enterprise Share</p>
                    <p className="text-xs font-bold text-brand-earth">{trend.share_percent}%</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                <span className="text-[8px] font-bold text-brand-earth/40 uppercase tracking-wider">Projected Weekly Demand</span>
                <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                  trend.projected_weekly_growth >= 0 ? 'text-brand-green' : 'text-red-500'
                }`}>
                  {trend.projected_weekly_growth >= 0 ? '▲' : '▼'} {Math.abs(trend.projected_weekly_growth)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
