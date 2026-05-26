"use client";

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
  prefix?: string;
  format?: 'd_h_m_s' | 'h_m_s';
  expiredBehavior?: 'hide' | 'display';
  expiredText?: string;
  onExpire?: () => void;
  className?: string;
}

export default function CountdownTimer({ 
  targetDate, 
  prefix = 'Ends in:', 
  format = 'h_m_s', 
  expiredBehavior = 'display', 
  expiredText = 'Expired!', 
  onExpire,
  className
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (isDone && onExpire) {
      onExpire();
    }
  }, [isDone, onExpire]);

  useEffect(() => {
    if (!targetDate) return;

    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setIsDone(true);
        return expiredText;
      }

      setIsDone(false);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = format === 'd_h_m_s' 
        ? Math.floor((difference / (1000 * 60 * 60)) % 24)
        : Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const pad = (num: number) => String(num).padStart(2, '0');

      const label = prefix ? `${prefix} ` : '';

      if (format === 'd_h_m_s' && days > 0) {
        return `${label}${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
      }

      return `${label}${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    };

    setTimeLeft(calculateTime());

    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, prefix, format, expiredText]);

  if (!targetDate) return null;
  if (isDone && expiredBehavior === 'hide') return null;

  return (
    <span 
      style={{ opacity: 0.85 }}
      className={className || "text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black/10 shrink-0 ml-1.5"}
    >
      {timeLeft}
    </span>
  );
}
