import { db } from "@/lib/db";
import { cachedQuery } from "@/lib/cache";
import { newsPath } from "@/lib/newsLinks";

export type TickerRate = { code: string; label: string; perDollar: number };
export type TickerHeadline = { title: string; href: string };

/** Currencies our people actually send money in, plus the majors. */
const WANTED: { code: string; label: string }[] = [
  { code: "INR", label: "₹ India" },
  { code: "PKR", label: "Pakistan" },
  { code: "BDT", label: "Bangladesh" },
  { code: "LKR", label: "Sri Lanka" },
  { code: "NPR", label: "Nepal" },
  { code: "AED", label: "UAE" },
  { code: "GBP", label: "UK" },
  { code: "EUR", label: "Euro" },
  { code: "CAD", label: "Canada" },
];

/**
 * Free daily reference rates from exchangerate-api's open endpoint — no key, no
 * quota, attribution shown next to the ticker. Rates are the previous close,
 * never a live dealing price, and the strip says so.
 */
export const dollarRates = cachedQuery(
  "ticker-fx",
  3600,
  async (): Promise<{ rates: TickerRate[]; asOf: string | null }> => {
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD", {
        next: { revalidate: 3600 },
      });
      if (!res.ok) return { rates: [], asOf: null };
      const data = (await res.json()) as {
        result?: string;
        time_last_update_utc?: string;
        rates?: Record<string, number>;
      };
      if (data.result !== "success" || !data.rates) {
        return { rates: [], asOf: null };
      }
      const rates = WANTED.flatMap((currency) => {
        const value = data.rates?.[currency.code];
        return typeof value === "number"
          ? [{ ...currency, perDollar: value }]
          : [];
      });
      return { rates, asOf: data.time_last_update_utc ?? null };
    } catch {
      // A ticker is decoration: if the feed is down the strip just shows news.
      return { rates: [], asOf: null };
    }
  },
);

/** Headlines already on Godesi, so the strip needs no extra outside feed. */
export const tickerHeadlines = cachedQuery(
  "ticker-news",
  600,
  async (take: number): Promise<TickerHeadline[]> => {
    const items = await db.newsItem.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take,
      select: { id: true, title: true },
    });
    return items.map((item) => ({ title: item.title, href: newsPath(item) }));
  },
);
