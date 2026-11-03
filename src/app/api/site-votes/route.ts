import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { VOTABLE_KEYS } from "@/lib/desiWebsites";

const BOT_UA = /bot|crawl|spider|slurp|preview|fetch|curl|wget|python|headless/i;
const Body = z.object({ siteKey: z.string().max(120) });

/** Records one vote per visitor (salted IP + user agent hash) per listed site. */
export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !VOTABLE_KEYS.has(parsed.data.siteKey)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const store = headers();
  const userAgent = store.get("user-agent") ?? "";
  if (BOT_UA.test(userAgent)) return NextResponse.json({ ok: false }, { status: 403 });
  const ip = (store.get("x-forwarded-for") ?? "").split(",")[0].trim() || store.get("x-real-ip") || "";
  const voterHash = createHash("sha256").update(`site-vote|${ip}|${userAgent}`).digest("hex");

  try {
    await db.siteVote.createMany({
      data: [{ siteKey: parsed.data.siteKey, voterHash }],
      skipDuplicates: true,
    });
  } catch {
    // A failed vote must never surface as an error to the visitor.
  }
  return NextResponse.json({ ok: true });
}
