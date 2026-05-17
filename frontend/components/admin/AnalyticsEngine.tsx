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

  // Interactive Hover States
  const [hoveredSalesIndex, setHoveredSalesIndex] = useState<number | null>(null);
  const [hoveredStockIndex, setHoveredStockIndex] = useState<number | null>(null);
  const [hoveredHubId, setHoveredHubId] = useState<number | null>(null);

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

  const { gross_margins, branches, food_waste, sales_timeline, ingredients_safety, trends } = data;

  // SVG Dimension Metrics for Sales Timeline Area Chart
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 20;

  // Calculate coordinates dynamically based on backend timeline data
  const maxDayRevenue = Math.max(...sales_timeline.map(d => d.retail + d.wholesale + d.pos)) || 1000;
  const points = sales_timeline.map((item, index) => {
    const x = paddingX + (index * (svgWidth - paddingX * 2)) / (sales_timeline.length - 1);
    const totalRev = item.retail + item.wholesale + item.pos;
    const y = svgHeight - paddingY - (totalRev * (svgHeight - paddingY * 2)) / maxDayRevenue;
    return { x, y, totalRev, ...item };
  });

  // SVG Area path construction
  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaPathD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
    : "";

  return (
    <div className="space-y-8 animate-fade-in text-brand-earth">
      
      {/* SECTION 1: ENTERPRISE FINANCIAL ALLOCATION & REVENUE TIMELINE */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Sales Timeline Trend Area Graph */}
        <div className="lg:col-span-2 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between relative">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-brand-earth">Sales Velocity Timeline</h3>
                <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Dual-channel revenue velocity trends with interactive point analysis</p>
              </div>
              <div className="flex gap-3 text-[8px] font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-brand-green"></span> Retail / POS</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-brand-earth/40"></span> Wholesale Spoke</span>
              </div>
            </div>
          </div>

          {/* Fully Responsive Vector Graph */}
          <div className="w-full relative overflow-visible mt-2">
            <svg 
              className="w-full h-auto overflow-visible" 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Horizontal Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const yPos = paddingY + ratio * (svgHeight - paddingY * 2);
                const valueLabel = Math.round(maxDayRevenue * (1 - ratio));
                return (
                  <g key={idx}>
                    <line 
                      x1={paddingX} 
                      y1={yPos} 
                      x2={svgWidth - paddingX} 
                      y2={yPos} 
                      stroke="#f3f4f6" 
                      strokeWidth="1"
                    />
                    <text 
                      x={paddingX - 10} 
                      y={yPos + 3} 
                      textAnchor="end" 
                      fill="#9ca3af" 
                      className="text-[8px] font-bold"
                    >
                      ₱{valueLabel >= 1000 ? `${(valueLabel / 1000).toFixed(0)}k` : valueLabel}
                    </text>
                  </g>
                );
              })}

              {/* Gradient Shading */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e3f20" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#1e3f20" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Area Path */}
              {areaPathD && (
                <path d={areaPathD} fill="url(#chartGradient)" />
              )}

              {/* Main Line Path */}
              {pathD && (
                <path 
                  d={pathD} 
                  stroke="#1e3f20" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

              {/* Interactive Hover Guides & Interactive Nodes */}
              {points.map((p, idx) => (
                <g key={idx}>
                  {/* Vertical hover alignment ruler */}
                  {hoveredSalesIndex === idx && (
                    <line 
                      x1={p.x} 
                      y1={paddingY} 
                      x2={p.x} 
                      y2={svgHeight - paddingY} 
                      stroke="#1e3f20" 
                      strokeDasharray="4 4" 
                      strokeWidth="1"
                    />
                  )}
                  {/* Interactive Nodes */}
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r={hoveredSalesIndex === idx ? 6 : 4} 
                    fill={hoveredSalesIndex === idx ? "#1e3f20" : "#ffffff"} 
                    stroke="#1e3f20" 
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredSalesIndex(idx)}
                    onMouseLeave={() => setHoveredSalesIndex(null)}
                  />
                  {/* Timeline labels */}
                  <text 
                    x={p.x} 
                    y={svgHeight - 4} 
                    textAnchor="middle" 
                    fill="#9ca3af" 
                    className="text-[8.5px] font-bold"
                  >
                    {p.day}
                  </text>
                </g>
              ))}
            </svg>

            {/* Float Tooltip overlay */}
            {hoveredSalesIndex !== null && (
              <div 
                className="absolute z-30 bg-brand-earth text-white p-3 rounded-lg shadow-lg border border-white/10 text-[9px] pointer-events-none transition-all duration-150"
                style={{ 
                  left: `${(points[hoveredSalesIndex].x / svgWidth) * 100}%`,
                  top: `${(points[hoveredSalesIndex].y / svgHeight) * 100 - 32}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <p className="font-black text-brand-yellow uppercase tracking-widest text-[8px] mb-1">{points[hoveredSalesIndex].day} Performance</p>
                <div className="space-y-0.5">
                  <p className="flex justify-between gap-4 font-bold text-white/60">Wholesale: <span className="text-white">₱{points[hoveredSalesIndex].wholesale.toLocaleString()}</span></p>
                  <p className="flex justify-between gap-4 font-bold text-white/60">Retail Order: <span className="text-white">₱{points[hoveredSalesIndex].retail.toLocaleString()}</span></p>
                  <p className="flex justify-between gap-4 font-bold text-white/60">POS Shift Sales: <span className="text-white">₱{points[hoveredSalesIndex].pos.toLocaleString()}</span></p>
                  <div className="h-px bg-white/10 my-1"></div>
                  <p className="flex justify-between gap-4 font-black text-brand-green">Net Gross: <span>₱{points[hoveredSalesIndex].totalRev.toLocaleString()}</span></p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Corporate Margin structures Breakdown (COGS, Waste, Labor) */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider">Margin Structure Allocation</h3>
            <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Corporate breakdown of revenue into capital operations vs net profit</p>
          </div>

          <div className="space-y-4">
            <div className="h-6 w-full rounded-xl overflow-hidden flex shadow-inner border border-gray-100">
              <div style={{ width: `${(gross_margins.cogs / Math.max(1, gross_margins.total_revenue)) * 100}%` }} className="bg-brand-earth/30 h-full" title="COGS" />
              <div style={{ width: `${(gross_margins.labor_cost / Math.max(1, gross_margins.total_revenue)) * 100}%` }} className="bg-brand-yellow/60 h-full" title="Labor & Commissions" />
              <div style={{ width: `${(gross_margins.waste_cost / Math.max(1, gross_margins.total_revenue)) * 100}%` }} className="bg-red-400/80 h-full" title="Wasted Inventory" />
              <div style={{ width: `${(gross_margins.gross_profit / Math.max(1, gross_margins.total_revenue)) * 100}%` }} className="bg-brand-green h-full" title="Profit margin" />
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-brand-earth/30"></span> COGS (42%)</span>
                <span>₱{gross_margins.cogs.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-brand-yellow/60"></span> Labor & Comm</span>
                <span>₱{gross_margins.labor_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-400/80"></span> Expired / Wasted</span>
                <span className="text-red-500">₱{gross_margins.waste_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="h-px bg-gray-50 my-1"></div>
              <div className="flex justify-between items-center text-xs font-black text-brand-green">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-brand-green"></span> Net Gross Margin ({gross_margins.margin_percent.toFixed(1)}%)</span>
                <span>₱{gross_margins.gross_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: SUPPLY CHAIN STOCK-TO-SAFETY INDEX BAR GRAPH */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Ingredient Depletion & Safety Forecast (Horizontal Bar Chart) */}
        <div className="lg:col-span-2 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-earth">Supply Chain Stock-to-Safety Index</h3>
            <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Comparing active commissary raw inventory against critical reserve thresholds</p>
          </div>

          <div className="space-y-4 mt-2">
            {ingredients_safety.map((item, idx) => {
              const ratio = (item.current / item.safety) * 100;
              const isBreached = item.current < item.safety;
              const isWarning = item.current >= item.safety && item.current <= item.safety * 1.25;
              
              const barColor = isBreached 
                ? "bg-red-500" 
                : isWarning 
                  ? "bg-amber-500" 
                  : "bg-brand-green";

              return (
                <div 
                  key={idx} 
                  className="space-y-1 cursor-pointer group"
                  onMouseEnter={() => setHoveredStockIndex(idx)}
                  onMouseLeave={() => setHoveredStockIndex(null)}
                >
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="flex items-center gap-1.5">
                      {isBreached && <span className="text-red-500 animate-pulse">⚠️</span>}
                      {item.ingredient}
                    </span>
                    <span className="text-brand-earth/60">
                      {item.current} / <span className="font-semibold text-brand-earth/30">{item.safety} {item.unit} safety</span>
                    </span>
                  </div>

                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.min(ratio, 100)}%` }}
                    />
                    {/* Safety Line Notch Marker */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-brand-earth/40 z-10" 
                      style={{ left: `${(item.safety / Math.max(item.current, item.safety)) * 100}%` }}
                    />
                  </div>

                  {/* Procurement Call-to-action Tooltip inside the card */}
                  {hoveredStockIndex === idx && (
                    <div className="text-[8.5px] bg-gray-50 border border-gray-100 p-2 rounded-lg text-brand-earth/70 font-semibold transition-all flex justify-between items-center animate-fade-in mt-1">
                      <span>
                        {isBreached 
                          ? `CRITICAL OUTAGE! Immediate replenishment order of at least ${item.safety - item.current} ${item.unit} required.`
                          : isWarning
                            ? `COMMISSARY ALERT: stock levels nearing threshold limit. Schedule bulk re-order.`
                            : `Stock levels fully healthy. Reserve buffer index at ${ratio.toFixed(0)}% safety.`
                        }
                      </span>
                      {(isBreached || isWarning) && (
                        <button className="bg-brand-earth hover:bg-brand-green text-white text-[7px] uppercase tracking-wider font-bold px-2 py-0.5 rounded transition-colors shadow-sm">
                          Restock
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Circular Waste Tracker Card */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider">FIFO Food Waste Tracker</h3>
            <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Automated batch shelf-life audit and raw materials depreciation valuation</p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="3.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#f87171"
                  strokeWidth="3.5"
                  strokeDasharray={`${food_waste.waste_rate_percent} 100`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-lg font-black text-brand-earth">{food_waste.waste_rate_percent}%</span>
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

      {/* SECTION 3: SPOKE PERFORMANCE BUBBLE MATRIX CHART & DEMAND FORECASTER */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Branch Quality vs Sales Correlation Matrix */}
        <div className="lg:col-span-2 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-brand-earth">Spoke Quality vs Sales Correlation Matrix</h3>
                <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Corporate ranking grid correlating financial velocity (X-Axis) against QC compliance (Y-Axis)</p>
              </div>
              <span className="bg-brand-earth/5 border border-brand-earth/10 px-2 py-0.5 rounded text-[8px] font-bold text-brand-earth uppercase tracking-widest">
                Real-Time Spoke Mapping
              </span>
            </div>
          </div>

          <div className="relative w-full border border-gray-100 rounded-2xl p-5 bg-gradient-to-br from-gray-50/50 to-white shadow-inner">
            {/* Background Quadrant Shading & Labels */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-[0.03] pointer-events-none p-5">
              <div className="border-r border-b border-dashed border-brand-earth flex items-start p-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-brand-earth">QC Elite (Low Vol / High compliance)</span>
              </div>
              <div className="border-b border-dashed border-brand-earth flex items-start justify-end p-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-brand-green">Champions (High Vol / High compliance)</span>
              </div>
              <div className="border-r border-dashed border-brand-earth flex items-end p-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-red-500">Critical Attention (Low Vol / Low compliance)</span>
              </div>
              <div className="flex items-end justify-end p-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-amber-600">Operational Risk (High Vol / Low compliance)</span>
              </div>
            </div>

            {/* Plot Area */}
            <div className="w-full h-56 flex flex-col justify-between relative border-l border-b border-gray-200/80 pt-3 pl-3 overflow-visible">
              
              {/* Y Axis Guide lines & Labels */}
              {[100, 95, 90, 85].map((qcVal, idx) => {
                const topPercent = idx * 25;
                return (
                  <div 
                    key={idx} 
                    className="absolute left-0 right-0 border-t border-dashed border-gray-100 pointer-events-none"
                    style={{ top: `${topPercent}%` }}
                  >
                    <span className="absolute -left-10 -top-2 text-[7.5px] font-extrabold text-brand-earth/30">{qcVal}% QC</span>
                  </div>
                );
              })}

              {/* Scatter Plots bubbles */}
              {branches.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-[10px] text-brand-earth/30 uppercase tracking-widest">No active spoke nodes mapped</p>
                </div>
              ) : (
                branches.map((branch) => {
                  const maxRev = Math.max(...branches.map(b => b.revenue)) || 10000;
                  const minRev = Math.min(...branches.map(b => b.revenue)) || 0;
                  const revSpan = maxRev - minRev || 1;
                  
                  // Coordinate margins: 10% to 90% boundary to prevent clipping
                  const leftPos = 15 + ((branch.revenue - minRev) / revSpan) * 70;
                  const bottomPos = Math.max(15, Math.min(85, ((branch.compliance_score - 80) / 20) * 80));

                  // Active stock dictates bubble radius scale
                  const radiusSize = Math.max(34, Math.min(branch.active_stock / 4, 58));

                  // Gradient color mapped to Compliance
                  const bubbleBg = branch.compliance_score >= 95 
                    ? "bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-emerald-500/25 border-emerald-300" 
                    : branch.compliance_score >= 90
                      ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-orange-500/25 border-orange-300"
                      : "bg-gradient-to-br from-rose-400 to-red-600 text-white shadow-red-500/25 border-red-300";

                  return (
                    <div
                      key={branch.id}
                      className={`absolute rounded-full border flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-115 hover:shadow-lg active:scale-95 ${bubbleBg}`}
                      style={{
                        left: `${leftPos}%`,
                        bottom: `${bottomPos}%`,
                        width: `${radiusSize}px`,
                        height: `${radiusSize}px`,
                        transform: 'translate(-50%, 50%)'
                      }}
                      onMouseEnter={() => setHoveredHubId(branch.id)}
                      onMouseLeave={() => setHoveredHubId(null)}
                    >
                      {/* Branch identifier initials */}
                      <span className="text-[8px] font-black uppercase tracking-wider drop-shadow-sm pointer-events-none">
                        {branch.name.substring(0, 3)}
                      </span>
                      <span className="text-[6.5px] opacity-80 font-bold pointer-events-none">
                        {branch.compliance_score}%
                      </span>

                      {/* Premium Floating Context Tooltip */}
                      {hoveredHubId === branch.id && (
                        <div className="absolute bottom-full mb-3 bg-brand-earth text-white p-4 rounded-xl shadow-xl border border-white/10 text-[9.5px] pointer-events-none z-50 w-52 transition-all duration-200 animate-fade-in">
                          <div className="flex justify-between items-center border-b border-white/10 pb-1.5 mb-2">
                            <p className="font-black text-brand-yellow uppercase tracking-widest text-[8.5px]">{branch.name}</p>
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[7px] font-bold text-white uppercase tracking-wider">
                              Spoke Node
                            </span>
                          </div>
                          <div className="space-y-1.5 font-bold text-white/70">
                            <p className="flex justify-between">Net Revenue: <span className="text-white font-extrabold">₱{branch.revenue.toLocaleString()}</span></p>
                            <p className="flex justify-between">Compliance Rating: <span className="text-white font-extrabold">{branch.compliance_score}% Adherence</span></p>
                            <div className="h-px bg-white/5 my-1"></div>
                            <p className="flex justify-between">Active Batch Stock: <span className="text-white">{branch.active_stock} Jars</span></p>
                            <p className="flex justify-between">Wasted Batches: <span className="text-red-300">{branch.wasted_stock} Jars expired</span></p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Axis Labels */}
            <div className="flex justify-between text-[7.5px] font-bold text-brand-earth/30 uppercase tracking-widest pt-6 border-t border-gray-100/50 mt-4">
              <span>Low-Sales Spoke</span>
              <span>Financial Hub Velocity (X-Axis)</span>
              <span>High-Sales Spoke</span>
            </div>
          </div>
        </div>

        {/* Flavor Demand Forecaster */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-earth">Flavor Demand Forecaster</h3>
            <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest mt-0.5">Moving average flavor metrics with integrated weekly growth velocity projections</p>
          </div>

          <div className="space-y-3 flex-1 mt-2 max-h-[224px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
            {trends.length === 0 ? (
              <div className="text-center py-12 text-brand-earth/30 uppercase tracking-wider text-[9px]">
                No flavor catalogs detected.
              </div>
            ) : (
              trends.map((trend) => {
                const growth = Number(trend.projected_weekly_growth || 0);
                const isPositive = growth >= 0;
                
                // Real-time Velocity Score matching market share + week-on-week trend growth
                const velocityScore = Math.max(10, Math.min(100, Math.round(50 + growth * 1.5 + Number(trend.share_percent) * 0.8)));

                return (
                  <div 
                    key={trend.flavor} 
                    className="group border border-gray-100 hover:border-brand-green/30 hover:shadow-md hover:shadow-brand-green/5 transition-all duration-300 bg-gradient-to-br from-gray-50/50 to-white p-3.5 rounded-xl flex flex-col justify-between space-y-2.5 relative overflow-hidden"
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9px] font-black text-brand-earth uppercase tracking-wider">{trend.flavor.replace(" Pastil", "")}</p>
                          <p className="text-[7px] text-brand-earth/30 uppercase tracking-widest mt-0.5">Velocity Score: {velocityScore}/100</p>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded-full text-[6px] font-black uppercase tracking-wider flex items-center gap-1 ${
                          trend.demand_status === 'High Surge' ? 'bg-red-50 text-red-600 border border-red-100/50' :
                          trend.demand_status === 'Stable Growth' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 
                          'bg-gray-50 text-gray-500 border border-gray-100'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${
                            trend.demand_status === 'High Surge' ? 'bg-red-500 animate-pulse' :
                            trend.demand_status === 'Stable Growth' ? 'bg-emerald-500' : 'bg-gray-400'
                          }`} />
                          {trend.demand_status}
                        </span>
                      </div>

                      <div className="flex justify-between items-baseline pt-0.5">
                        <div>
                          <p className="text-[6.5px] text-brand-earth/30 uppercase tracking-wider font-semibold">Total Retail Units Sold</p>
                          <p className="text-xs font-extrabold text-brand-earth">{trend.units_sold} jars</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[6.5px] text-brand-earth/30 uppercase tracking-wider font-semibold">Sales Share</p>
                          <p className="text-[10px] font-black text-brand-green">{trend.share_percent}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Proportional visual share progress gauge bar */}
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-brand-yellow/80 to-brand-green h-full rounded-full transition-all duration-500"
                        style={{ width: `${trend.share_percent}%` }}
                      />
                    </div>

                    <div className="pt-1.5 border-t border-gray-100 flex justify-between items-center text-[7.5px] font-bold">
                      <span className="text-brand-earth/40 uppercase tracking-wider">Weekly Forecast</span>
                      <span className={`flex items-center gap-0.5 text-[8.5px] font-black ${
                        isPositive ? 'text-brand-green' : 'text-red-500'
                      }`}>
                        {isPositive ? '▲' : '▼'} {Math.abs(growth)}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
