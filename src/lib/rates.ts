/** Display currencies people can switch the site into. Prices are stored as posted. */
export const DISPLAY_CURRENCIES = [
  { code: "INR", symbol: "₹", flag: "🇮🇳", label: "Indian rupee" },
  { code: "USD", symbol: "$", flag: "🇺🇸", label: "US dollar" },
  { code: "GBP", symbol: "£", flag: "🇬🇧", label: "British pound" },
  { code: "EUR", symbol: "€", flag: "🇪🇺", label: "Euro" },
  { code: "AED", symbol: "AED", flag: "🇦🇪", label: "UAE dirham" },
  { code: "CAD", symbol: "C$", flag: "🇨🇦", label: "Canadian dollar" },
  { code: "AUD", symbol: "A$", flag: "🇦🇺", label: "Australian dollar" },
  { code: "SGD", symbol: "S$", flag: "🇸🇬", label: "Singapore dollar" },
] as const;

export type DisplayCurrency = (typeof DISPLAY_CURRENCIES)[number]["code"];

export function isDisplayCurrency(value: string): value is DisplayCurrency {
  return DISPLAY_CURRENCIES.some((item) => item.code === value);
}

export function currencyMeta(code: string) {
  return DISPLAY_CURRENCIES.find((item) => item.code === code);
}

/** Country of the visitor → the currency they think in. */
export const COUNTRY_CURRENCY: Record<string, DisplayCurrency> = {
  IN: "INR",
  US: "USD",
  GB: "GBP",
  AE: "AED",
  CA: "CAD",
  AU: "AUD",
  NZ: "AUD",
  SG: "SGD",
  IE: "EUR",
  DE: "EUR",
  FR: "EUR",
  NL: "EUR",
  ES: "EUR",
  IT: "EUR",
};

/**
 * Fallback rates per 1 USD, used until the live feed answers. Approximate on
 * purpose — converted amounts are always labelled as approximate.
 */
const FALLBACK_RATES: Record<DisplayCurrency, number> = {
  USD: 1,
  INR: 87,
  GBP: 0.78,
  EUR: 0.92,
  AED: 3.67,
  CAD: 1.37,
  AUD: 1.52,
  SGD: 1.34,
};

type RateTable = Record<string, number>;

/**
 * Live mid-market rates from the free open.er-api.com feed, cached for twelve
 * hours. Any failure falls back to the built-in table so prices never vanish.
 */
export async function getRates(): Promise<RateTable> {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 43200 },
    });
    if (!response.ok) return FALLBACK_RATES;
    const data: unknown = await response.json();
    if (
      typeof data === "object" &&
      data !== null &&
      "rates" in data &&
      typeof (data as { rates: unknown }).rates === "object"
    ) {
      const rates = (data as { rates: Record<string, unknown> }).rates;
      const table: RateTable = { ...FALLBACK_RATES };
      for (const item of DISPLAY_CURRENCIES) {
        const value = rates[item.code];
        if (typeof value === "number" && value > 0) table[item.code] = value;
      }
      return table;
    }
  } catch {
    // The feed being down must never break a page.
  }
  return FALLBACK_RATES;
}

/** Converts through USD; unknown currencies are returned unchanged. */
export function convert(
  amount: number,
  from: string,
  to: string,
  rates: RateTable,
): number | null {
  const fromRate = rates[from.toUpperCase()];
  const toRate = rates[to.toUpperCase()];
  if (!fromRate || !toRate) return null;
  return (amount / fromRate) * toRate;
}

export function formatDisplay(amount: number, code: string) {
  const locale = code === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    maximumFractionDigits: amount >= 100 ? 0 : 2,
  }).format(amount);
}
