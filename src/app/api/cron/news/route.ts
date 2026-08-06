import { NextResponse } from "next/server";
import { ensureDefaultFeeds, ingestNews } from "@/lib/news";
import { expireFoundingFeatures } from "@/lib/founding";
import { streamRecentChanges } from "@/lib/indexNow";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Runs daily (see vercel.json): pulls new items and drops anything older than six
 * days. Vercel Cron sends an Authorization
 * header built from CRON_SECRET; manual calls must send the same bearer token.
 */
function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function run() {
  await ensureDefaultFeeds();
  const result = await ingestNews();
  const foundingFeaturesExpired = await expireFoundingFeatures();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const indexNow = await streamRecentChanges(dayAgo);
  return NextResponse.json({ ok: true, ...result, foundingFeaturesExpired, indexNow });
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return run();
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return run();
}
