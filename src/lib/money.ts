import type { Locale } from "@/i18n/config";

/**
 * Prices are stored as integer **fils**. The Kuwaiti dinar is a 3-decimal
 * currency (1 KWD = 1000 fils), so 12.500 KD is `12500`. Never store money as
 * a float.
 */
export type Fils = number;

export const CURRENCY = "KWD";

/**
 * Kuwaiti retail writes the amount first and abbreviates the currency:
 * `12.500 KD` / `12.500 د.ك`. `Intl`'s own currency style would give
 * "KWD 12.500", which reads as a bank statement, so the symbol is appended.
 */
const SYMBOL: Record<Locale, string> = { en: "KD", ar: "د.ك" };

// `-u-nu-latn` keeps Latin digits on the Arabic site; Kuwaiti storefronts
// overwhelmingly show 12.500 rather than ١٢٫٥٠٠.
const numberTag = (locale: Locale) =>
  locale === "ar" ? "ar-KW-u-nu-latn" : "en-KW";

const formatters = new Map<string, Intl.NumberFormat>();

function formatter(locale: Locale, decimals: number) {
  const key = `${numberTag(locale)}:${decimals}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(numberTag(locale), {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    formatters.set(key, f);
  }
  return f;
}

export function formatPrice(fils: Fils, locale: Locale): string {
  return `${formatter(locale, 3).format(fils / 1000)} ${SYMBOL[locale]}`;
}

/** Bare number, no currency — for use next to a separate "KD" label. */
export function formatAmount(fils: Fils, locale: Locale): string {
  return formatter(locale, 3).format(fils / 1000);
}

export function currencySymbol(locale: Locale) {
  return SYMBOL[locale];
}

export function formatNumber(value: number, locale: Locale): string {
  return formatter(locale, 0).format(value);
}

export function discountPercent(price: Fils, compareAt: Fils): number {
  if (compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/**
 * Delivery charge for a subtotal.
 *
 * The rates are passed in rather than being constants here: they're editable in
 * the admin, and this used to be the third place a threshold was written down.
 * Taking them as an argument means there's no way to read a stale one.
 */
export type ShippingRates = { freeThreshold: Fils; flatRate: Fils };

export function shippingFor(subtotal: Fils, rates: ShippingRates): Fils {
  if (subtotal <= 0) return 0;
  return subtotal >= rates.freeThreshold ? 0 : rates.flatRate;
}
