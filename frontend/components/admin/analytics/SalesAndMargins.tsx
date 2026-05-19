'use client';

import { useState } from 'react';

interface MarginData {
  total_revenue: number;
  cogs: number;
  labor_cost: number;
  waste_cost: number;
  expenses_cost: number;
  gross_profit: number;
  margin_percent: number;
}

interface TimelineData {
  day: string;
  retail: number;
  wholesale: number;
  pos: number;
}

interface SalesAndMarginsProps {
  salesTimeline: TimelineData[];
  grossMargins: MarginData;
}

export default function SalesAndMargins({ salesTimeline, grossMargins }: SalesAndMarginsProps) {
  const [hoveredSalesIndex, setHoveredSalesIndex] = useState<number | null>(null);

  // SVG Dimension Metrics for Sales Timeline Area Chart
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 20;

  // Calculate coordinates dynamically based on backend timeline data
  const maxDayRevenue = Math.max(...salesTimeline.map((d) => d.retail + d.wholesale + d.pos)) || 1000;
  const points = salesTimeline.map((item, index) => {
    const x = paddingX + (index * (svgWidth - paddingX * 2)) / (salesTimeline.length - 1);
    const totalRev = item.retail + item.wholesale + item.pos;
    const y = svgHeight - paddingY - (totalRev * (svgHeight - paddingY * 2)) / maxDayRevenue;
    return { x, y, totalRev, ...item };
  });

  // SVG Area path construction
  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaPathD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
      : '';

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Sales Timeline Trend Area Graph */}
      <div className="lg:col-span-2 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between relative">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-earth">
                Sales Performance
              </h3>
              <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest mt-0.5">
                Daily revenue tracking across retail POS, wholesale spokes, and delivery channels
              </p>
            </div>
            <div className="flex gap-3 text-[8px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-brand-green"></span> Retail / POS
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-brand-earth/40"></span> Wholesale
              </span>
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
                    ₱
                    {valueLabel >= 1000
                      ? `${(valueLabel / 1000).toFixed(0)}k`
                      : valueLabel}
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
            {areaPathD && <path d={areaPathD} fill="url(#chartGradient)" />}

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
                  fill={hoveredSalesIndex === idx ? '#1e3f20' : '#ffffff'}
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
                  className="text-[8px] font-bold"
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
                transform: 'translateX(-50%)',
              }}
            >
              <p className="font-black text-brand-yellow uppercase tracking-widest text-[8px] mb-1">
                {points[hoveredSalesIndex].day} Performance
              </p>
              <div className="space-y-0.5">
                <p className="flex justify-between gap-4 font-bold text-white/60">
                  Wholesale:{' '}
                  <span className="text-white">
                    ₱{points[hoveredSalesIndex].wholesale.toLocaleString()}
                  </span>
                </p>
                <p className="flex justify-between gap-4 font-bold text-white/60">
                  Retail Order:{' '}
                  <span className="text-white">
                    ₱{points[hoveredSalesIndex].retail.toLocaleString()}
                  </span>
                </p>
                <p className="flex justify-between gap-4 font-bold text-white/60">
                  POS Shift Sales:{' '}
                  <span className="text-white">
                    ₱{points[hoveredSalesIndex].pos.toLocaleString()}
                  </span>
                </p>
                <div className="h-px bg-white/10 my-1"></div>
                <p className="flex justify-between gap-4 font-black text-brand-green">
                  Net Gross:{' '}
                  <span>₱{points[hoveredSalesIndex].totalRev.toLocaleString()}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Corporate Margin structures Breakdown (COGS, Waste, Labor) */}
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider">
            Revenue & Cost Breakdown
          </h3>
          <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest mt-0.5">
            Allocation of sales revenue towards ingredients, labor, waste, and expenses
          </p>
        </div>

        {(() => {
          const totalRev = Math.max(1, grossMargins.total_revenue);
          const cogsPct = (grossMargins.cogs / totalRev) * 100;
          const laborPct = (grossMargins.labor_cost / totalRev) * 100;
          const wastePct = (grossMargins.waste_cost / totalRev) * 100;
          const expensesPct = ((grossMargins.expenses_cost || 0) / totalRev) * 100;
          
          return (
            <div className="space-y-4">
              <div className="h-6 w-full rounded-xl overflow-hidden flex shadow-inner border border-gray-100">
                <div
                  style={{ width: `${cogsPct}%` }}
                  className="bg-brand-earth/30 h-full"
                  title={`COGS: ${cogsPct.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${laborPct}%` }}
                  className="bg-brand-yellow/60 h-full"
                  title={`Labor & Commissions: ${laborPct.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${wastePct}%` }}
                  className="bg-red-400/80 h-full"
                  title={`Wasted Inventory: ${wastePct.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${expensesPct}%` }}
                  className="bg-orange-400 h-full"
                  title={`Operational Expenses: ${expensesPct.toFixed(1)}%`}
                />
                <div
                  style={{
                    width: `${(grossMargins.gross_profit / totalRev) * 100}%`,
                  }}
                  className="bg-brand-green h-full"
                  title={`Net Profit: ${grossMargins.margin_percent.toFixed(1)}%`}
                />
              </div>

              <div className="space-y-2.5 pt-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-brand-earth/30"></span> Ingredients / COGS ({cogsPct.toFixed(0)}%)
                  </span>
                  <span>
                    ₱
                    {grossMargins.cogs.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-brand-yellow/60"></span> Labor & Comm ({laborPct.toFixed(0)}%)
                  </span>
                  <span>
                    ₱
                    {grossMargins.labor_cost.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-red-400/80"></span> Food Waste Cost ({wastePct.toFixed(0)}%)
                  </span>
                  <span className="text-red-500">
                    ₱
                    {grossMargins.waste_cost.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-orange-400"></span> Operating Expenses ({expensesPct.toFixed(0)}%)
                  </span>
                  <span className="text-orange-600">
                    ₱
                    {(grossMargins.expenses_cost || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="h-px bg-gray-50 my-1"></div>
                <div className="flex justify-between items-center text-xs font-black text-brand-green">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-brand-green"></span> Net Profit Margin ({grossMargins.margin_percent.toFixed(1)}%)
                  </span>
                  <span>
                    ₱
                    {grossMargins.gross_profit.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
