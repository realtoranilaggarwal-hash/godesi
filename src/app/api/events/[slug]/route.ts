import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eventJson, FEED_HEADERS } from "@/lib/publicEvents";

export const dynamic = "force-dynamic";

/** One event in full, for network sites that publish their own event page. */
export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const ref = new URL(request.url).searchParams.get("ref")?.trim() || undefined;

  const event = await db.event.findFirst({
    where: { slug: params.slug, status: "APPROVED" },
    include: {
      speakers: { orderBy: { sortOrder: "asc" } },
      sessions: { orderBy: { sortOrder: "asc" } },
      tiers: { orderBy: { sortOrder: "asc" } },
      organizer: { select: { name: true } },
      business: { select: { name: true, slug: true } },
    },
  });

  if (!event) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404, headers: FEED_HEADERS },
    );
  }

  return NextResponse.json(eventJson(event, ref), { headers: FEED_HEADERS });
}
