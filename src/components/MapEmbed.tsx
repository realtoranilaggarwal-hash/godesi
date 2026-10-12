import { cachedQuery } from "@/lib/cache";

type Point = { lat: number; lon: number };

/**
 * Free OpenStreetMap geocoding (Nominatim). One address text in, one point
 * out; cached for a month because venues do not move. Any failure (rate limit,
 * unknown address, network) yields null and the page shows no map.
 */
async function lookup(query: string): Promise<Point | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "GoDesi.com (https://godesi.com; hello@godesi.com)",
        "Accept-Language": "en",
      },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as { lat: string; lon: string }[];
    const hit = rows[0];
    if (!hit) return null;
    const lat = Number(hit.lat);
    const lon = Number(hit.lon);
    return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
  } catch {
    return null;
  }
}

/** Hits are kept for a month; a miss is retried after an hour. */
const longLookup = cachedQuery("osm-geocode", 60 * 60 * 24 * 30, lookup);
const retryLookup = cachedQuery("osm-geocode-retry", 60 * 60, lookup);

async function geocode(query: string) {
  return (await longLookup(query)) ?? retryLookup(query);
}

/**
 * OpenStreetMap map of an address with a pin — no API key, no billing. When
 * the address cannot be geocoded nothing renders, so pages degrade to the
 * plain "Open in maps" link.
 */
export async function MapEmbed({
  parts,
  title,
  className = "",
}: {
  /**
   * Most-specific first: venue name, street address, city, state. Geocoding
   * is retried with the leading parts dropped, so an unknown venue name or
   * a street OSM lacks still lands on the right town.
   */
  parts: (string | null | undefined)[];
  title: string;
  className?: string;
}) {
  const pieces = parts.map((p) => p?.trim() ?? "").filter(Boolean);
  let point: Point | null = null;
  for (let i = 0; i < pieces.length && !point; i++) {
    point = await geocode(pieces.slice(i).join(", "));
  }
  if (!point) return null;
  const d = 0.008;
  const bbox = [
    point.lon - d,
    point.lat - d,
    point.lon + d,
    point.lat + d,
  ].join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${point.lat},${point.lon}`;
  return (
    <div className={className}>
      <iframe
        title={`Map: ${title}`}
        src={src}
        loading="lazy"
        className="h-56 w-full rounded-xl border border-slate-200"
      />
      <a
        href={`https://www.openstreetmap.org/?mlat=${point.lat}&mlon=${point.lon}#map=16/${point.lat}/${point.lon}`}
        target="_blank"
        rel="noreferrer"
        className="mt-1 block text-[11px] text-slate-400 hover:text-slate-600"
      >
        © OpenStreetMap contributors · larger map ↗
      </a>
    </div>
  );
}
