'use client';

import { useEffect } from 'react';

export default function WarningSuppressor() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const orig = console.error;
      console.error = (...args: any[]) => {
        // Safe stringification helper that avoids circular reference crashes
        const argStr = args
          .map((a) => {
            try {
              return typeof a === 'object' ? JSON.stringify(a) : String(a);
            } catch {
              return String(a);
            }
          })
          .join(' ');

        if (
          argStr.includes('bis_skin_checked') ||
          argStr.includes('bis-skin') ||
          argStr.includes('eppiocemhmnlbhjplcgkofciiegomcon')
        ) {
          return;
        }
        orig.apply(console, args);
      };
    }
  }, []);

  return null;
}
