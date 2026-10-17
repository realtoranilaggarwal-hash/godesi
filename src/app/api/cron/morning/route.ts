import { NextResponse } from "next/server";
import { sendMorningEmails } from "@/lib/morningEmail";

export const dynamic = "force-dynamic";
/** Sends are paced at 5 a second, so a long list needs more than a minute. */
export const maxDuration = 300;

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
  return NextResponse.json({
    ok: true,
    ...(await sendMorningEmails({ dryRun })),
  });
}

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}
