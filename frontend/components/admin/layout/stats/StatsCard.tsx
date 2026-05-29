import React from "react";
import { formatThousands } from "@/lib/format";

interface StatsCardProps {
  label: string;
  value: string | number;
  valueColor?: string; // Optional custom color tailwind/css class
}

export function StatsCard({ label, value, valueColor = "text-brand-earth" }: StatsCardProps) {
  return (
    <div className="bg-white border border-gray-100 p-3.5 md:p-5 rounded-xl space-y-1 shadow-sm transition-all hover:shadow-md hover:border-gray-200">
      <p className="text-[8.5px] md:text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 leading-tight">
        {label}
      </p>
      <p className={`text-[16px] md:text-xl leading-tight font-bold ${valueColor}`}>
        {formatThousands(value)}
      </p>
    </div>
  );
}
