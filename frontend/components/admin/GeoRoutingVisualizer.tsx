"use client";

import { useState, useMemo } from "react";
import { MapPin, Target, Path } from "@phosphor-icons/react";

interface Hub {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
}

interface GeoRoutingVisualizerProps {
  hubs: Hub[];
}

export default function GeoRoutingVisualizer({ hubs }: GeoRoutingVisualizerProps) {
  // Generate stable mock coordinates for hubs that lack them (for demonstration)
  const mapNodes = useMemo(() => {
    return hubs.map((hub, idx) => ({
      ...hub,
      // Abstracting real-world Lat/Lng to a visually pleasing 2D Grid
      x: hub.longitude ? ((hub.longitude - 120.9) / 0.2) * 100 : 15 + (idx * 37) % 70,
      y: hub.latitude ? ((hub.latitude - 14.4) / 0.3) * 100 : 15 + (idx * 23) % 70,
    }));
  }, [hubs]);

  const [customerPin, setCustomerPin] = useState<{ x: number, y: number } | null>(null);

  // Calculate distances using standard Euclidean math for the 2D grid simulator
  const routingData = useMemo(() => {
    if (!customerPin || mapNodes.length === 0) return null;

    const distances = mapNodes.map(node => {
      const dx = node.x - customerPin.x;
      const dy = node.y - customerPin.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return { ...node, distance };
    });

    distances.sort((a, b) => a.distance - b.distance);
    return distances;
  }, [customerPin, mapNodes]);

  const closestHub = routingData ? routingData[0] : null;

  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCustomerPin({ x, y });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm space-y-6">
      <header>
        <h2 className="text-xl font-black text-brand-earth tracking-tighter uppercase">Geo-Routing Simulator</h2>
        <p className="text-[10px] font-bold text-brand-earth/40 uppercase tracking-widest mt-1">Interactive Logistics Grid. Click anywhere to drop a customer order pin.</p>
      </header>

      <div 
        className="relative w-full h-[400px] bg-gray-50 rounded-2xl overflow-hidden cursor-crosshair border border-gray-100 group"
        onClick={handleGridClick}
      >
        {/* Grid Background Pattern */}
        <div className="absolute inset-0 opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        {/* SVG Drawing Layer for Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {customerPin && routingData?.map(hub => {
            const isClosest = hub.id === closestHub?.id;
            return (
              <line 
                key={hub.id}
                x1={`${customerPin.x}%`} 
                y1={`${customerPin.y}%`} 
                x2={`${hub.x}%`} 
                y2={`${hub.y}%`} 
                stroke={isClosest ? "#16a34a" : "#9ca3af"} 
                strokeWidth={isClosest ? "3" : "1"} 
                strokeDasharray={isClosest ? "none" : "4 4"}
                className={isClosest ? "animate-pulse drop-shadow-md" : "opacity-30"}
              />
            );
          })}
        </svg>

        {/* Hub Pins */}
        {mapNodes.map(hub => {
          const isClosest = hub.id === closestHub?.id;
          return (
            <div 
              key={hub.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-all duration-300"
              style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
            >
              <div className={`p-2 rounded-full shadow-xl transition-all duration-300 ${isClosest ? 'bg-brand-green text-white scale-125' : 'bg-white text-brand-earth/40 border border-gray-200'}`}>
                <MapPin size={isClosest ? 20 : 16} weight={isClosest ? "fill" : "bold"} />
              </div>
              <span className={`mt-1.5 text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm transition-colors duration-300 ${isClosest ? 'bg-brand-green text-white' : 'bg-white text-brand-earth/60 border border-gray-100'}`}>
                {hub.name}
              </span>
            </div>
          );
        })}

        {/* Customer Pin Drop */}
        {customerPin && (
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-in fade-in zoom-in duration-300"
            style={{ left: `${customerPin.x}%`, top: `${customerPin.y}%` }}
          >
            <div className="text-rose-500 drop-shadow-xl animate-bounce">
              <Target size={32} weight="fill" />
            </div>
          </div>
        )}

        {!customerPin && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-brand-earth/20 font-black uppercase tracking-widest text-2xl">
            Click to Simulate Customer Drop
          </div>
        )}
      </div>

      {closestHub && (
        <div className="bg-brand-green/10 border border-brand-green/20 p-5 rounded-2xl flex items-center justify-between animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-brand-green uppercase tracking-widest">Routing Decision Algorithm Triggered</p>
            <p className="text-base font-black text-brand-earth">Order physically routed to: <span className="text-brand-green">{closestHub.name}</span></p>
          </div>
          <div className="bg-brand-green text-white p-3 rounded-xl shadow-lg shadow-brand-green/30">
            <Path size={24} weight="bold" />
          </div>
        </div>
      )}
    </div>
  );
}
