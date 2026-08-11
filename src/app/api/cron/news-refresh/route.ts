import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ensureDefaultFeeds, ingestIfStale } from "@/lib/news";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Manual top-up between the daily pulls: ingestion runs once a day (see
 * vercel.json), so this is only called by hand when a story cannot wait.
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
