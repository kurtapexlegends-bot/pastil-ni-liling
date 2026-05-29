import React from "react";

interface SegmentOption<T extends string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ size: number; weight: "bold" | "regular" | "fill" | "duotone" | "light" | "thin" }>;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[] | SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex space-x-1.5 bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100 shrink-0 select-none">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-[9px] md:text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-brand-earth text-white shadow-sm shadow-brand-earth/10"
                : "text-brand-earth/50 hover:text-brand-earth hover:bg-gray-100/50"
            }`}
          >
            {Icon && <Icon size={13} weight="bold" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
