import { unstable_cache } from "next/cache";
import { parseIcs } from "@/lib/ics";

/**
 * The Vaishnava (ISKCON) observance calendar — Ekadashi, appearance and
 * disappearance days. These are dates rather than events at a venue, so they
 * are shown as a panel on /religious instead of being imported into /events.
 */
export const VAISNAVA_CREDIT = "vaisnavacalendar.info";

/** Files are published per city and per year, and only the year changes. */
function feedUrl(year: number, city = "New York City [United States of America]") {
  return `https://www.vaisnavacalendar.info/ICS/${year}/${encodeURIComponent(city)}-a${year}-ICS.ics`;
}

export type Observance = { title: string; date: Date };

/** The cache stores JSON, so dates travel as ISO strings and are revived. */
type StoredObservance = { title: string; date: string };

async function loadObservances(): Promise<StoredObservance[]> {
  const year = new Date().getUTCFullYear();
  try {
    const response = await fetch(feedUrl(year), {
      headers: { "User-Agent": "GodesiEventWire/1.0 (+https://godesi.com)" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return [];
    return parseIcs(await response.text(), 500).map((entry) => ({
      title: entry.title,
      date: entry.startsAt.toISOString(),
    }));
  } catch {
    // The panel simply does not render when their site is unreachable.
    return [];
  }
}

const cachedObservances = unstable_cache(loadObservances, ["vaisnava-calendar"], {
  revalidate: 60 * 60 * 12,
});

/** Today's observances, then the next ones coming up. */
export async function upcomingObservances(count = 6) {
  const all = await cachedObservances();
  const today = new Date();
  const startOfDay = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  return all
    .map((entry) => ({ title: entry.title, date: new Date(entry.date) }))
    .filter((entry) => entry.date.getTime() >= startOfDay - 43_200_000)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, count);
}
