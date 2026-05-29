/**
 * Automatically inserts commas as thousands separators for any numbers >= 1000.
 * Preserves decimal points and original non-digit characters (like currency symbols, text labels).
 */
export function formatThousands(val: any): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  
  return str.replace(/-?\b\d+(\.\d+)?\b/g, (match) => {
    const num = Number(match);
    if (isNaN(num)) return match;
    
    if (match.includes(".")) {
      const parts = match.split(".");
      const integerPart = Number(parts[0]).toLocaleString("en-US");
      return `${integerPart}.${parts[1]}`;
    } else {
      return num.toLocaleString("en-US");
    }
  });
}

/**
 * Standard currency formatter formatting any numeric value to Philippine Peso (PHP)
 * with thousands separators and 2 decimal places.
 */
export function formatCurrency(val: any): string {
  if (val === null || val === undefined) return "";
  const num = Number(val);
  if (isNaN(num)) return String(val);
  return `₱${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
