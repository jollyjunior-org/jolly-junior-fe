/**
 * Format stored discount percent for display.
 * DB stores int only (e.g. 10); UI hardcodes "% OFF".
 * Args: percent — number, string legacy value, or null/undefined
 * Returns: "10% OFF" or empty string when no discount
 */
export function formatDiscountLabel(
  percent: number | string | null | undefined,
): string {
  if (percent === null || percent === undefined || percent === '') return '';
  const n =
    typeof percent === 'number'
      ? percent
      : Number(String(percent).replace(/[^0-9]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return '';
  return `${Math.round(n)}% OFF`;
}

/**
 * Parse discount from API / form into integer percent (or null).
 * Args: value — number, "10% OFF", etc.
 * Returns: 1–100 int, or null
 */
export function parseDiscountPercentValue(
  value: number | string | null | undefined,
): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n =
    typeof value === 'number'
      ? value
      : Number(String(value).replace(/[^0-9]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.max(1, Math.min(100, Math.round(n)));
}
