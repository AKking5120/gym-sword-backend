/**
 * Currency formatting. Single source of truth for all price rendering.
 * Default currency is INR (₹). Change via env / settings later if needed.
 */
export const CURRENCY_SYMBOL = "₹";
export const CURRENCY_CODE = "INR";
export const CURRENCY_LOCALE = "en-IN";

export function formatPrice(amount, opts = {}) {
  const { withSymbol = true, decimals = 0 } = opts;
  if (amount === null || amount === undefined || isNaN(amount)) return withSymbol ? `${CURRENCY_SYMBOL}0` : "0";
  const formatter = new Intl.NumberFormat(CURRENCY_LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const num = formatter.format(amount);
  return withSymbol ? `${CURRENCY_SYMBOL}${num}` : num;
}

export function formatPriceCompact(amount) {
  if (!amount && amount !== 0) return `${CURRENCY_SYMBOL}0`;
  if (amount >= 100000) return `${CURRENCY_SYMBOL}${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `${CURRENCY_SYMBOL}${(amount / 1000).toFixed(1)}K`;
  return `${CURRENCY_SYMBOL}${Math.round(amount)}`;
}
