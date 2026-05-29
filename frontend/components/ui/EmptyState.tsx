import React from 'react';

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="h-64 bg-white border border-gray-100 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
      <div className="w-10 h-10 rounded-full bg-brand-earth/5 flex items-center justify-center text-brand-earth/30 mb-3">
        <Icon className="w-5 h-5 animate-in fade-in zoom-in-75 duration-300" size={20} />
      </div>
      <p className="text-[10px] text-brand-earth/40 uppercase tracking-widest font-black">{title}</p>
      <p className="text-[8px] text-brand-earth/30 uppercase tracking-widest font-bold mt-1 max-w-[200px] leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-3 bg-brand-earth hover:bg-brand-earth/95 text-white font-bold uppercase tracking-wider text-[8px] px-3 py-1.5 rounded-lg transition-all active:scale-[0.98]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
