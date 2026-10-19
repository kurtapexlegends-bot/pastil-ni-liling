'use client';

import React from 'react';
import { Clock, Coffee, CircleNotch } from '@phosphor-icons/react';

export interface CashierAttendanceConsoleProps {
  activeShift: any | null;
  isLoading: boolean;
  isSubmitting: boolean;
  onClockIn: () => Promise<void>;
  onClockOut: () => Promise<void>;
  onStartBreak: () => Promise<void>;
  onEndBreak: () => Promise<void>;
}

export default function CashierAttendanceConsole({
  activeShift,
  isLoading,
  isSubmitting,
  onClockIn,
  onClockOut,
  onStartBreak,
  onEndBreak
}: CashierAttendanceConsoleProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Cashier Attendance Console</h3>
          <p className="text-[9px] text-brand-earth/40 uppercase tracking-widest font-semibold">Clock in to register shift hours and qualify for POS cashier commissions.</p>
        </div>
        
        {activeShift && (
          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse ${
            activeShift.status === 'on_break' 
              ? 'bg-amber-50 text-amber-700 border border-amber-100/50' 
              : 'bg-emerald-50 text-emerald-700 border border-emerald-100/50'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${activeShift.status === 'on_break' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            {activeShift.status === 'on_break' ? 'On Break' : 'Active Duty Shift'}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <CircleNotch size={28} className="animate-spin text-brand-earth/40" />
          <p className="text-[10px] text-brand-earth/30 uppercase tracking-widest font-bold">Querying Shift Databases...</p>
        </div>
      ) : !activeShift ? (
        /* Check-In Panel (Not clocked in) */
        <div className="p-8 text-center space-y-5 max-w-sm mx-auto">
          <div className="w-12 h-12 bg-brand-earth/5 rounded-full flex items-center justify-center text-brand-earth/30 mx-auto">
            <Clock size={24} weight="duotone" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-brand-earth uppercase tracking-wider">Not Clocked In</p>
            <p className="text-[9px] text-brand-earth/40 leading-relaxed font-semibold">Your daily shift ledger is closed. Clock in now to activate register terminals and shift operational tools.</p>
            <p className="text-[8px] text-brand-earth/30 uppercase tracking-wide font-bold pt-1">Note: POS and Expense tracking controls are hidden until clock-in.</p>
          </div>
          <button
            onClick={onClockIn}
            disabled={isSubmitting}
            className="bg-brand-earth text-white font-bold uppercase tracking-widest text-[9px] px-6 py-3 min-h-[44px] rounded-full transition-all shadow-sm hover:bg-brand-green active:scale-[0.98] disabled:opacity-50 shrink-0 w-full cursor-pointer"
          >
            {isSubmitting ? "Initializing..." : "Clock In Shift"}
          </button>
        </div>
      ) : activeShift.status === 'on_break' ? (
        /* Break Card Panel (On Break) */
        <div className="p-8 bg-amber-50/50 border-t border-b border-amber-100/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 shrink-0">
              <Coffee size={20} weight="fill" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Shift Muted on Unpaid Break</p>
              <p className="text-[9px] text-amber-700/60 leading-relaxed font-medium">Break session started at {new Date(activeShift.current_break_start).toLocaleTimeString()}. Earnings calculation paused.</p>
              {activeShift.total_break_minutes > 0 && (
                <p className="text-[8px] text-amber-800 font-bold uppercase tracking-wider">Accumulated break: {activeShift.total_break_minutes} mins</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEndBreak}
              disabled={isSubmitting}
              className="bg-brand-earth hover:bg-brand-green text-white font-bold uppercase tracking-widest text-[9px] px-5 py-2.5 min-h-[44px] rounded-full transition-all active:scale-[0.97] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Resuming..." : "Resume Shift Duty"}
            </button>
            <button
              onClick={onClockOut}
              disabled={isSubmitting}
              className="border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold uppercase tracking-widest text-[9px] px-5 py-2.5 min-h-[44px] rounded-full transition-all active:scale-[0.97] disabled:opacity-50 cursor-pointer"
            >
              Clock Out
            </button>
          </div>
        </div>
      ) : (
        /* Active Duty Panel (Working) */
        <div className="p-8 bg-emerald-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 shrink-0">
              <Clock size={20} weight="fill" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Currently on Active Duty</p>
              <p className="text-[9px] text-emerald-700/60 leading-relaxed font-medium">Shift started at {new Date(activeShift.clock_in).toLocaleTimeString()} @ ₱{activeShift.hourly_rate}/hr.</p>
              {activeShift.total_break_minutes > 0 && (
                <p className="text-[8px] text-emerald-800 font-bold uppercase tracking-wider">Total Break Deductions: {activeShift.total_break_minutes} mins</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onStartBreak}
              disabled={isSubmitting}
              className="bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 font-bold uppercase tracking-widest text-[9px] px-5 py-2.5 min-h-[44px] rounded-full transition-all active:scale-[0.97] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Processing..." : "Take Shift Break"}
            </button>
            <button
              onClick={onClockOut}
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-widest text-[9px] px-5 py-2.5 min-h-[44px] rounded-full transition-all active:scale-[0.97] disabled:opacity-50 shadow-sm shadow-rose-600/10 cursor-pointer"
            >
              Clock Out Shift
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
