import { NextResponse } from "next/server";
import { runEventWire } from "@/lib/eventWire";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Pulls the public community calendars once a day (see vercel.json). Vercel
 * Cron sends an Authorization header built from CRON_SECRET; manual calls must
 * send the same bearer token.
 */
function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function run() {
  const results = await runEventWire();
  return NextResponse.json({
    ok: true,
    sources: results.length,
    added: results.reduce((sum, result) => sum + result.added, 0),
    updated: results.reduce((sum, result) => sum + result.updated, 0),
    results,
  });
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
