import { NextResponse } from "next/server";
import { sendMorningEmails } from "@/lib/morningEmail";
import { sendWellnessLaunchEmails } from "@/lib/wellnessLaunchEmail";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Daily at 7am New York in winter (see vercel.json). Vercel Cron sends CRON_SECRET as a bearer token. */
function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function run(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const dryRun = new URL(request.url).searchParams.get("dry") === "1";
  const morning = await sendMorningEmails({ dryRun });
  // Runs after the morning email so it only ever uses what is left of the day.
  const wellnessLaunch = await sendWellnessLaunchEmails({ dryRun }).catch((error) => ({
    sent: 0,
    error: error instanceof Error ? error.message : "failed",
  }));
  return NextResponse.json({ ok: true, ...morning, wellnessLaunch });
}

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}
