import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ensureDefaultFeeds, ingestIfStale } from "@/lib/news";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Pulls the wire feeds every half hour (see vercel.json). The news page used to
 * do this inside the visitor's request, which made it wait for nine feeds.
 */
function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function run() {
  await ensureDefaultFeeds();
  const result = await ingestIfStale(25);
  revalidatePath("/news");
  revalidatePath("/");
  return NextResponse.json({ ok: true, result });
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
