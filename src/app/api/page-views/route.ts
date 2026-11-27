import { NextResponse } from "next/server";
import { countPageView, pageViewKey, pageViews } from "@/lib/pageViews";

export const dynamic = "force-dynamic";

/** POST { path, count } → { views }. `count: false` only reads the total. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { path?: unknown; count?: unknown } | null;
  const path = pageViewKey(body?.path);
  if (!path) return NextResponse.json({ views: 0 });
  const views = body?.count === false ? await pageViews(path) : await countPageView(path);
  return NextResponse.json({ views }, { headers: { "cache-control": "no-store" } });
}
