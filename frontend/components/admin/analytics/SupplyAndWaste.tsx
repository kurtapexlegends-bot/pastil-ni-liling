'use client';

import { useState } from 'react';

interface SafetyStockData {
  ingredient: string;
  current: number;
  safety: number;
  unit: string;
}

interface WasteMetrics {
  expired_jars_count: number;
  waste_cost_php: number;
  waste_rate_percent: number;
  total_produced_jars: number;
}

interface SupplyAndWasteProps {
  ingredientsSafety: SafetyStockData[];
  foodWaste: WasteMetrics;
}

export default function SupplyAndWaste({ ingredientsSafety, foodWaste }: SupplyAndWasteProps) {
  const [hoveredStockIndex, setHoveredStockIndex] = useState<number | null>(null);

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Ingredient Depletion & Safety Forecast (Horizontal Bar Chart) */}
      <div className="lg:col-span-2 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-brand-earth">
            Ingredient Stock Levels
          </h3>
          <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest mt-0.5">
            Monitoring current stock vs minimum safe reserve limits at HQ commissary
          </p>
        </div>

        <div className="space-y-4 mt-2">
          {ingredientsSafety.map((item, idx) => {
            const ratio = (item.current / item.safety) * 100;
            const isBreached = item.current < item.safety;
            const isWarning = item.current >= item.safety && item.current <= item.safety * 1.25;

            const barColor = isBreached
              ? 'bg-red-500'
              : isWarning
                ? 'bg-amber-500'
                : 'bg-brand-green';

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
                    {item.current} /{' '}
                    <span className="font-semibold text-brand-earth/30">
                      {item.safety} {item.unit} safety
                    </span>
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
                    style={{
                      left: `${(item.safety / Math.max(item.current, item.safety)) * 100}%`,
                    }}
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
                          : `Stock levels fully healthy. Reserve buffer index at ${ratio.toFixed(0)}% safety.`}
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
          <h3 className="text-xs font-black uppercase tracking-wider">
            Food Waste Tracker
          </h3>
          <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest mt-0.5">
            Expired batches and total cost of discarded pastil jars
          </p>
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
                strokeDasharray={`${foodWaste.waste_rate_percent} 100`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-lg font-black text-brand-earth">
                {foodWaste.waste_rate_percent}%
              </span>
              <p className="text-[7px] text-brand-earth/30 uppercase tracking-wider font-bold">
                Waste Ratio
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-brand-earth/50">Wasted Batches Cost Factor</p>
            <p className="text-base font-extrabold text-red-500">
              ₱
              {foodWaste.waste_cost_php.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-[8px] text-brand-earth/30 uppercase tracking-wider font-semibold">
              {foodWaste.expired_jars_count} Jars Discarded of {foodWaste.total_produced_jars}{' '}
              Produced
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
