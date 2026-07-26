import { NextResponse } from "next/server";
import type { EventType } from "@prisma/client";
import { db } from "@/lib/db";

const VALID: EventType[] = ["PROFILE_VIEW", "QR_SCAN", "WHATSAPP_CLICK"];

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    slug?: string;
    type?: EventType;
  } | null;

  if (!body?.slug || !body.type || !VALID.includes(body.type)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const business = await db.business.findUnique({
    where: { slug: body.slug },
    select: { id: true },
  });
  if (!business) return NextResponse.json({ ok: false }, { status: 404 });

  await db.analyticsEvent.create({ data: { businessId: business.id, type: body.type } });
  return NextResponse.json({ ok: true });
}
