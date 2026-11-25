import { NextResponse } from "next/server";
import { sendPartnerFollowUps } from "@/lib/partnerFollowUp";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Daily (see vercel.json): partner-proposal reminders until paid or the deadline. */
function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, results: await sendPartnerFollowUps() });
}
