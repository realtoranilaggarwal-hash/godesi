import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { liveSnapshot, pruneVisitorPings } from "@/lib/live";

export const dynamic = "force-dynamic";

/**
 * Every open tab polls this, so the answer is shared: cached at the edge and
 * memoised on the server. However many people are browsing, the database is
 * read about twice a minute — otherwise the polling alone keeps the database
 * awake around the clock and burns the compute quota.
 */
const cachedSnapshot = unstable_cache(liveSnapshot, ["live-snapshot"], {
  revalidate: 30,
});

export async function GET() {
  return NextResponse.json(await cachedSnapshot(), {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
    },
  });
}

function header(request: Request, name: string) {
  const value = request.headers.get(name);
  if (!value) return null;
  // Vercel percent-encodes non-ASCII city names.
  try {
    return decodeURIComponent(value).slice(0, 80) || null;
  } catch {
    return value.slice(0, 80);
  }
}

function coordinate(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Records one anonymous page view with the edge's coarse geo headers — no IP,
 * user agent or member id is stored.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    path?: string;
  } | null;
  const path = (body?.path ?? "/").slice(0, 200);

  await db.visitorPing.create({
    data: {
      path,
      city: header(request, "x-vercel-ip-city"),
      region: header(request, "x-vercel-ip-country-region"),
      country: header(request, "x-vercel-ip-country"),
      lat: coordinate(request.headers.get("x-vercel-ip-latitude")),
      lng: coordinate(request.headers.get("x-vercel-ip-longitude")),
    },
  });

  // Cheap housekeeping without a dedicated cron.
  if (Math.random() < 0.02) await pruneVisitorPings();

  return NextResponse.json({ ok: true });
}
