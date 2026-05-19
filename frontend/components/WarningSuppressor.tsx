'use client';

// Evaluate pre-emptively on file-import in browser before React hydration executes
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const origError = console.error;
  console.error = function (...args: any[]) {
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
    origError.apply(console, args);
  };
}

export default function WarningSuppressor() {
  return null;
}
