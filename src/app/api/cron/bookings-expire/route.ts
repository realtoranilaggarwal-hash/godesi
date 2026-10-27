import { NextResponse } from "next/server";
import { expireStaleBookings } from "@/lib/bookings";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Every 15 min (see vercel.json): refunds deposits nobody answered in time. */
function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function run(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, ...(await expireStaleBookings()) });
}

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}
