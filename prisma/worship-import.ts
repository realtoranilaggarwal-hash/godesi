import type { Faith } from "@prisma/client";
import { db } from "../src/lib/db";
import { slugify } from "../src/lib/slug";

/**
 * Seeds the places-of-worship directory from OpenStreetMap via Overpass.
 * Re-runnable: rows are keyed by `osmId`, and user edits are never overwritten.
 *
 *   npm run db:worship                # 30 USA places (defaults)
 *   npm run db:worship -- India 50    # or another country / cap
 *
 * Deliberately capped: OSM is only a starter set, the directory grows from
 * user submissions. Imported rows are attributed to OpenStreetMap (ODbL).
 */

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const CITIES: { name: string; state: string; country: string; area: [number, number, number, number] }[] = [
  // [south, west, north, east]
  { name: "Delhi", state: "Delhi", country: "India", area: [28.4, 76.8, 28.9, 77.4] },
  { name: "Mumbai", state: "Maharashtra", country: "India", area: [18.89, 72.75, 19.28, 72.99] },
  { name: "Pune", state: "Maharashtra", country: "India", area: [18.4, 73.7, 18.65, 73.99] },
  { name: "Bengaluru", state: "Karnataka", country: "India", area: [12.83, 77.45, 13.14, 77.75] },
  { name: "Hyderabad", state: "Telangana", country: "India", area: [17.26, 78.29, 17.56, 78.61] },
  { name: "Chennai", state: "Tamil Nadu", country: "India", area: [12.9, 80.15, 13.2, 80.31] },
  { name: "Kolkata", state: "West Bengal", country: "India", area: [22.45, 88.26, 22.66, 88.44] },
  { name: "Ahmedabad", state: "Gujarat", country: "India", area: [22.95, 72.45, 23.15, 72.72] },
  { name: "Amritsar", state: "Punjab", country: "India", area: [31.55, 74.79, 31.72, 74.94] },
  { name: "Jaipur", state: "Rajasthan", country: "India", area: [26.79, 75.68, 27.0, 75.91] },
  { name: "New York", state: "NY", country: "USA", area: [40.55, -74.05, 40.92, -73.7] },
  { name: "Jersey City", state: "NJ", country: "USA", area: [40.66, -74.12, 40.78, -74.02] },
  { name: "Chicago", state: "IL", country: "USA", area: [41.7, -87.9, 42.02, -87.52] },
  { name: "Houston", state: "TX", country: "USA", area: [29.6, -95.6, 29.95, -95.2] },
  { name: "Dallas", state: "TX", country: "USA", area: [32.65, -96.95, 32.95, -96.65] },
  { name: "Atlanta", state: "GA", country: "USA", area: [33.65, -84.55, 33.89, -84.29] },
  { name: "San Jose", state: "CA", country: "USA", area: [37.2, -122.05, 37.45, -121.75] },
  { name: "Fremont", state: "CA", country: "USA", area: [37.46, -122.05, 37.6, -121.88] },
  { name: "Seattle", state: "WA", country: "USA", area: [47.5, -122.44, 47.73, -122.24] },
  { name: "Edison", state: "NJ", country: "USA", area: [40.49, -74.44, 40.6, -74.31] },
  { name: "Los Angeles", state: "CA", country: "USA", area: [33.9, -118.45, 34.2, -118.15] },
  { name: "Irvine", state: "CA", country: "USA", area: [33.61, -117.87, 33.73, -117.7] },
  { name: "Phoenix", state: "AZ", country: "USA", area: [33.35, -112.2, 33.7, -111.9] },
  { name: "Austin", state: "TX", country: "USA", area: [30.15, -97.9, 30.45, -97.6] },
  { name: "Boston", state: "MA", country: "USA", area: [42.28, -71.19, 42.42, -70.99] },
  { name: "Philadelphia", state: "PA", country: "USA", area: [39.87, -75.28, 40.09, -74.96] },
  { name: "Washington", state: "DC", country: "USA", area: [38.8, -77.12, 39.0, -76.9] },
  { name: "Charlotte", state: "NC", country: "USA", area: [35.1, -80.95, 35.36, -80.68] },
  { name: "Raleigh", state: "NC", country: "USA", area: [35.7, -78.75, 35.92, -78.5] },
  { name: "Detroit", state: "MI", country: "USA", area: [42.25, -83.3, 42.45, -82.95] },
  { name: "Minneapolis", state: "MN", country: "USA", area: [44.88, -93.33, 45.05, -93.19] },
  { name: "Denver", state: "CO", country: "USA", area: [39.6, -105.11, 39.83, -104.85] },
  { name: "Tampa", state: "FL", country: "USA", area: [27.87, -82.6, 28.1, -82.35] },
  { name: "Orlando", state: "FL", country: "USA", area: [28.4, -81.47, 28.62, -81.25] },
  { name: "Columbus", state: "OH", country: "USA", area: [39.9, -83.13, 40.1, -82.85] },
];

function faithOf(tags: Record<string, string>): Faith | null {
  const religion = tags.religion;
  const denomination = tags.denomination ?? "";

  if (religion === "hindu") return "HINDU_TEMPLE";
  if (religion === "sikh") return "GURUDWARA";
  if (religion === "muslim") return "MOSQUE";
  if (religion === "christian") return "CHURCH";
  if (religion === "jain") return "JAIN_TEMPLE";
  if (religion === "buddhist") return "BUDDHIST_TEMPLE";
  if (denomination === "sikh") return "GURUDWARA";
  return null;
}

async function overpass(area: [number, number, number, number]) {
  const [south, west, north, east] = area;
  const query = `
    [out:json][timeout:120];
    (
      node["amenity"="place_of_worship"](${south},${west},${north},${east});
      way["amenity"="place_of_worship"](${south},${west},${north},${east});
    );
    out center tags;`;

  // The public instance is rate-limited and often replies 429/504 under load.
  for (let attempt = 1; ; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Overpass rejects requests without a contactable agent (HTTP 406).
        "User-Agent": "godesi.com worship directory import (admin@godesi.com)",
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (response.ok) {
      const payload = (await response.json()) as { elements: OverpassElement[] };
      return payload.elements ?? [];
    }
    if (attempt >= 4) throw new Error(`Overpass HTTP ${response.status}`);
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, attempt * 20_000));
  }
}

/** Desi-first: temples, gurudwaras and mosques before the long tail of churches. */
const FAITH_PRIORITY: Faith[] = [
  "HINDU_TEMPLE",
  "GURUDWARA",
  "JAIN_TEMPLE",
  "BUDDHIST_TEMPLE",
  "MOSQUE",
  "CHURCH",
  "OTHER",
];

async function importCity(city: (typeof CITIES)[number], budget: number) {
  const elements = await overpass(city.area);
  let created = 0;
  let updated = 0;

  const ranked = elements
    .filter((element) => element.tags?.name && faithOf(element.tags ?? {}))
    .sort(
      (a, b) =>
        FAITH_PRIORITY.indexOf(faithOf(a.tags ?? {})!) -
        FAITH_PRIORITY.indexOf(faithOf(b.tags ?? {})!),
    );

  for (const element of ranked) {
    if (created >= budget) break;
    const tags = element.tags ?? {};
    const name = tags.name?.trim();
    const faith = faithOf(tags);
    if (!name || !faith) continue;

    const osmId = `${element.type}/${element.id}`;
    const latitude = element.lat ?? element.center?.lat ?? null;
    const longitude = element.lon ?? element.center?.lon ?? null;
    const address =
      [tags["addr:housenumber"], tags["addr:street"], tags["addr:suburb"]]
        .filter(Boolean)
        .join(" ") || null;

    // eslint-disable-next-line no-await-in-loop
    const existing = await db.worshipPlace.findUnique({ where: { osmId } });
    if (existing) {
      // Never clobber a submission a human has curated.
      if (existing.source !== "osm") continue;
      // eslint-disable-next-line no-await-in-loop
      await db.worshipPlace.update({
        where: { id: existing.id },
        data: { name, faith, latitude, longitude, address, city: city.name },
      });
      updated += 1;
      continue;
    }

    const base = slugify(`${name} ${city.name}`) || `place-${element.id}`;
    // eslint-disable-next-line no-await-in-loop
    const clash = await db.worshipPlace.findUnique({ where: { slug: base } });

    // eslint-disable-next-line no-await-in-loop
    await db.worshipPlace.create({
      data: {
        slug: clash ? `${base}-${element.id}` : base,
        osmId,
        faith,
        name,
        address,
        city: city.name,
        state: city.state,
        country: city.country,
        latitude,
        longitude,
        websiteUrl: tags.website ?? tags["contact:website"] ?? null,
        phone: tags.phone ?? tags["contact:phone"] ?? null,
        source: "osm",
        status: "APPROVED",
      },
    });
    created += 1;
  }

  return { created, updated, seen: elements.length };
}

async function main() {
  const country = process.argv[2] ?? "USA";
  const limit = Number(process.argv[3] ?? 30);
  const cities = CITIES.filter((city) => city.country === country);
  if (!cities.length) throw new Error(`No cities configured for ${country}`);

  // Spread the cap across cities so one metro cannot fill the whole directory.
  const perCity = Math.max(1, Math.ceil(limit / cities.length));
  let imported = await db.worshipPlace.count({ where: { source: "osm", country } });

  for (const city of cities) {
    if (imported >= limit) break;
    try {
      // eslint-disable-next-line no-await-in-loop
      const result = await importCity(city, Math.min(perCity, limit - imported));
      imported += result.created;
      console.log(
        `${city.name}, ${city.country}: +${result.created} new, ${result.updated} refreshed (${result.seen} OSM rows)`,
      );
    } catch (error) {
      console.log(`${city.name}: failed — ${(error as Error).message}`);
    }
    // Overpass asks for a pause between heavy queries.
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 4000));
  }

  const total = await db.worshipPlace.count();
  console.log(`Places of worship in the directory: ${total}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
