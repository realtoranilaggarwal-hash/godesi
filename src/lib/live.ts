import { db } from "@/lib/db";

/** How far back the map counts as "right now". */
export const LIVE_WINDOW_MINUTES = 30;

export type LiveDot = {
  lat: number;
  lng: number;
  city: string;
  country: string | null;
  weight: number;
};

export type LiveVisit = {
  id: string;
  city: string;
  country: string | null;
  path: string;
  minutesAgo: number;
};

export type LiveSnapshot = {
  online: number;
  cities: number;
  countries: number;
  dots: LiveDot[];
  recent: LiveVisit[];
  topCities: { label: string; count: number }[];
};

function placeLabel(city: string | null, country: string | null) {
  return city || country || "Somewhere";
}

/** Aggregated, anonymous view of who is browsing Godesi right now. */
export async function liveSnapshot(): Promise<LiveSnapshot> {
  const since = new Date(Date.now() - LIVE_WINDOW_MINUTES * 60_000);
  const rows = await db.visitorPing.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      path: true,
      city: true,
      country: true,
      lat: true,
      lng: true,
      createdAt: true,
    },
  });

  const dots = new Map<string, LiveDot>();
  const cityCounts = new Map<string, number>();
  const countries = new Set<string>();

  for (const row of rows) {
    const label = placeLabel(row.city, row.country);
    cityCounts.set(label, (cityCounts.get(label) ?? 0) + 1);
    if (row.country) countries.add(row.country);
    if (row.lat === null || row.lng === null) continue;
    // Round so two visitors in one city share a dot.
    const key = `${row.lat.toFixed(1)},${row.lng.toFixed(1)}`;
    const dot = dots.get(key);
    if (dot) dot.weight += 1;
    else
      dots.set(key, {
        lat: row.lat,
        lng: row.lng,
        city: label,
        country: row.country,
        weight: 1,
      });
  }

  const now = Date.now();
  return {
    online: rows.length,
    cities: cityCounts.size,
    countries: countries.size,
    dots: Array.from(dots.values()).slice(0, 120),
    recent: rows.slice(0, 12).map((row) => ({
      id: row.id,
      city: placeLabel(row.city, row.country),
      country: row.country,
      path: row.path,
      minutesAgo: Math.max(
        0,
        Math.round((now - row.createdAt.getTime()) / 60_000),
      ),
    })),
    topCities: Array.from(cityCounts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
  };
}

/** Keeps the table small; the map only ever needs the last day. */
export async function pruneVisitorPings() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60_000);
  const { count } = await db.visitorPing.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  return count;
}
