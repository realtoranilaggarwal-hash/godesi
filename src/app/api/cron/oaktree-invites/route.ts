import { NextResponse } from "next/server";
import { sendOakTreeInvites } from "@/lib/oakTreeOutreach";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Daily (see vercel.json): Oak Tree claim + NYE local-support emails, day 0/4/10. */
function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, results: await sendOakTreeInvites() });
}
