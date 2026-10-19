import { cachedQuery } from "@/lib/cache";

export type FearGreedDay = { value: number; label: string; date: string };

/**
 * Crypto Fear & Greed Index from alternative.me's free public API (no key).
 * Their terms require the attribution right next to the data. It updates once
 * a day, so an hourly cache is plenty.
 */
export const cryptoFearGreed = cachedQuery(
  "crypto-fear-greed",
  3600,
  async (): Promise<FearGreedDay[]> => {
    try {
      const res = await fetch("https://api.alternative.me/fng/?limit=31", {
        next: { revalidate: 3600 },
      });
      if (!res.ok) return [];
      const data = (await res.json()) as {
        data?: {
          value?: string;
          value_classification?: string;
          timestamp?: string;
        }[];
      };
      return (data.data ?? []).flatMap((day) => {
        const value = Number(day.value);
        const seconds = Number(day.timestamp);
        if (!Number.isFinite(value) || !Number.isFinite(seconds)) return [];
        return [
          {
            value,
            label: day.value_classification ?? fearGreedLabel(value),
            date: new Date(seconds * 1000).toISOString().slice(0, 10),
          },
        ];
      });
    } catch {
      return [];
    }
  },
);

export function fearGreedLabel(value: number) {
  if (value <= 24) return "Extreme Fear";
  if (value <= 46) return "Fear";
  if (value <= 54) return "Neutral";
  if (value <= 75) return "Greed";
  return "Extreme Greed";
}

export function fearGreedColor(value: number) {
  if (value <= 24) return "#dc2626";
  if (value <= 46) return "#f97316";
  if (value <= 54) return "#eab308";
  if (value <= 75) return "#84cc16";
  return "#16a34a";
}
