'use client';

import { useState } from 'react';

interface HubPerformance {
  id: number;
  name: string;
  revenue: number;
  compliance_score: number;
  active_stock: number;
  wasted_stock: number;
}

interface FlavorTrend {
  flavor: string;
  units_sold: number;
  share_percent: number;
  projected_weekly_growth: number;
  demand_status: string;
}

interface SpokesAndFlavorsProps {
  branches: HubPerformance[];
  trends: FlavorTrend[];
}

export default function SpokesAndFlavors({ branches, trends }: SpokesAndFlavorsProps) {
  const [hoveredHubId, setHoveredHubId] = useState<number | null>(null);

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Branch Quality vs Sales Correlation Matrix */}
      <div className="lg:col-span-2 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-earth">
                Spoke Quality vs Sales Correlation Matrix
              </h3>
              <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest mt-0.5">
                Corporate ranking grid correlating financial velocity (X-Axis) against QC compliance (Y-Axis)
              </p>
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
              <span className="text-[8px] font-black uppercase tracking-widest text-brand-earth">
                QC Elite (Low Vol / High compliance)
              </span>
            </div>
            <div className="border-b border-dashed border-brand-earth flex items-start justify-end p-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-brand-green">
                Champions (High Vol / High compliance)
              </span>
            </div>
            <div className="border-r border-dashed border-brand-earth flex items-end p-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-red-500">
                Critical Attention (Low Vol / Low compliance)
              </span>
            </div>
            <div className="flex items-end justify-end p-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-amber-600">
                Operational Risk (High Vol / Low compliance)
              </span>
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
                  <span className="absolute -left-10 -top-2 text-[7.5px] font-extrabold text-brand-earth/30">
                    {qcVal}% QC
                  </span>
                </div>
              );
            })}

            {/* Scatter Plots bubbles */}
            {branches.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-[10px] text-brand-earth/30 uppercase tracking-widest">
                  No active spoke nodes mapped
                </p>
              </div>
            ) : (
              branches.map((branch) => {
                const maxRev = Math.max(...branches.map((b) => b.revenue)) || 10000;
                const minRev = Math.min(...branches.map((b) => b.revenue)) || 0;
                const revSpan = maxRev - minRev || 1;

                // Coordinate margins: 15% to 85% boundary to prevent clipping
                const leftPos = 15 + ((branch.revenue - minRev) / revSpan) * 70;
                const bottomPos = Math.max(
                  15,
                  Math.min(85, ((branch.compliance_score - 80) / 20) * 80)
                );

                // Active stock dictates bubble radius scale
                const radiusSize = Math.max(34, Math.min(branch.active_stock / 4, 58));

                // Gradient color mapped to Compliance
                const bubbleBg =
                  branch.compliance_score >= 95
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-emerald-500/25 border-emerald-300'
                    : branch.compliance_score >= 90
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-orange-500/25 border-orange-300'
                      : 'bg-gradient-to-br from-rose-400 to-red-600 text-white shadow-red-500/25 border-red-300';

                return (
                  <div
                    key={branch.id}
                    className={`absolute rounded-full border flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 ${bubbleBg}`}
                    style={{
                      left: `${leftPos}%`,
                      bottom: `${bottomPos}%`,
                      width: `${radiusSize}px`,
                      height: `${radiusSize}px`,
                      transform: 'translate(-50%, 50%)',
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
                          <p className="font-black text-brand-yellow uppercase tracking-widest text-[8.5px]">
                            {branch.name}
                          </p>
                          <span className="bg-white/10 px-1.5 py-0.5 rounded text-[7px] font-bold text-white uppercase tracking-wider">
                            Spoke Node
                          </span>
                        </div>
                        <div className="space-y-1.5 font-bold text-white/70">
                          <p className="flex justify-between">
                            Net Revenue:{' '}
                            <span className="text-white font-extrabold">
                              ₱{branch.revenue.toLocaleString()}
                            </span>
                          </p>
                          <p className="flex justify-between">
                            Compliance Rating:{' '}
                            <span className="text-white font-extrabold">
                              {branch.compliance_score}% Adherence
                            </span>
                          </p>
                          <div className="h-px bg-white/5 my-1"></div>
                          <p className="flex justify-between">
                            Active Batch Stock:{' '}
                            <span className="text-white">{branch.active_stock} Jars</span>
                          </p>
                          <p className="flex justify-between">
                            Wasted Batches:{' '}
                            <span className="text-red-300">
                              {branch.wasted_stock} Jars expired
                            </span>
                          </p>
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
          <h3 className="text-xs font-black uppercase tracking-wider text-brand-earth">
            Flavor Demand Forecaster
          </h3>
          <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest mt-0.5">
            Moving average flavor metrics with weekly growth velocity projections
          </p>
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
              const velocityScore = Math.max(
                10,
                Math.min(
                  100,
                  Math.round(50 + growth * 1.5 + Number(trend.share_percent) * 0.8)
                )
              );

              return (
                <div
                  key={trend.flavor}
                  className="group border border-gray-100 hover:border-brand-green/30 hover:shadow-md hover:shadow-brand-green/5 transition-all duration-300 bg-gradient-to-br from-gray-50/50 to-white p-3.5 rounded-xl flex flex-col justify-between space-y-2.5 relative overflow-hidden"
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[9px] font-black text-brand-earth uppercase tracking-wider">
                          {trend.flavor.replace(' Pastil', '')}
                        </p>
                        <p className="text-[7px] text-brand-earth/30 uppercase tracking-widest mt-0.5">
                          Velocity Score: {velocityScore}/100
                        </p>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[6px] font-black uppercase tracking-wider flex items-center gap-1 ${
                          trend.demand_status === 'High Surge'
                            ? 'bg-red-50 text-red-600 border border-red-100/50'
                            : trend.demand_status === 'Stable Growth'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50'
                              : 'bg-gray-50 text-gray-500 border border-gray-100'
                        }`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${
                            trend.demand_status === 'High Surge'
                              ? 'bg-red-500 animate-pulse'
                              : trend.demand_status === 'Stable Growth'
                                ? 'bg-emerald-500'
                                : 'bg-gray-400'
                          }`}
                        />
                        {trend.demand_status}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-0.5">
                      <div>
                        <p className="text-[6.5px] text-brand-earth/30 uppercase tracking-wider font-semibold">
                          Total Retail Units Sold
                        </p>
                        <p className="text-xs font-extrabold text-brand-earth">
                          {trend.units_sold} jars
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[6.5px] text-brand-earth/30 uppercase tracking-wider font-semibold">
                          Sales Share
                        </p>
                        <p className="text-[10px] font-black text-brand-green">
                          {trend.share_percent}%
                        </p>
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
                    <span className="text-brand-earth/40 uppercase tracking-wider">
                      Weekly Forecast
                    </span>
                    <span
                      className={`flex items-center gap-0.5 text-[8.5px] font-black ${
                        isPositive ? 'text-brand-green' : 'text-red-500'
                      }`}
                    >
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
  );
}
