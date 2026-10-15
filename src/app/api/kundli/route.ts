import { NextResponse } from "next/server";
import tzlookup from "tz-lookup";
import { z } from "zod";
import { computeKundli, localToUtc } from "@/lib/kundli";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  place: z.string().trim().min(2).max(120),
});

/** Cheap per-IP throttle so one visitor cannot flood OpenStreetMap's free geocoder. */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 40;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

async function geocode(place: string) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", place);
  const res = await fetch(url, {
    headers: { "User-Agent": "Godesi/1.0 (https://godesi.com)" },
    next: { revalidate: 60 * 60 * 24 * 30 },
  });
  if (!res.ok) throw new Error("lookup failed");
  const [hit] = (await res.json()) as {
    lat: string;
    lon: string;
    display_name: string;
  }[];
  return hit
    ? {
        latitude: Number(hit.lat),
        longitude: Number(hit.lon),
        label: hit.display_name,
      }
    : null;
}

/** Birth details are used for this one calculation and never stored. */
export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many charts in an hour. Please try again later." },
      { status: 429 },
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a birth date and a birth place." },
      { status: 400 },
    );
  }
  const { date, time, place } = parsed.data;
  const year = Number(date.slice(0, 4));
  if (year < 1800 || year > 2100) {
    return NextResponse.json(
      { error: "Birth year must be between 1800 and 2100." },
      { status: 400 },
    );
  }

  let location: Awaited<ReturnType<typeof geocode>>;
  try {
    location = await geocode(place);
  } catch {
    return NextResponse.json(
      { error: "Couldn't look up that place right now. Try again shortly." },
      { status: 502 },
    );
  }
  if (!location) {
    return NextResponse.json(
      {
        error:
          'Couldn\'t find that place. Try the city with its state or country, e.g. "Jaipur, India".',
      },
      { status: 404 },
    );
  }

  const timeZone = tzlookup(location.latitude, location.longitude);
  const utc = localToUtc(date, time ?? "12:00", timeZone);
  if (Number.isNaN(utc.getTime())) {
    return NextResponse.json(
      { error: "That date or time isn't valid." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    place: location.label,
    timeZone,
    utc: utc.toISOString(),
    kundli: computeKundli(
      utc,
      location.latitude,
      location.longitude,
      Boolean(time),
    ),
    attribution: "Place lookup © OpenStreetMap contributors",
  });
}
