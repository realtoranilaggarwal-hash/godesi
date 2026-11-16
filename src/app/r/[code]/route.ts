import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  PROMO_COOKIE_MAX_AGE,
  normalizePromoCode,
  promoCookieName,
  visitorHash,
} from "@/lib/ambassadorPromo";

export const dynamic = "force-dynamic";

const BOT_UA = /bot|crawl|spider|slurp|preview|fetch|curl|wget|python|headless|facebookexternalhit|whatsapp/i;

/**
 * Ambassador tracking link: records the click, remembers the code for that
 * event in a cookie so the booking is credited, then opens the event page.
 */
export async function GET(
  request: Request,
  { params }: { params: { code: string } },
) {
  const code = normalizePromoCode(params.code);
  const campaign = code
    ? await db.ambassadorPromoEvent.findUnique({
        where: { code },
        select: {
          id: true,
          code: true,
          active: true,
          eventId: true,
          event: { select: { slug: true, status: true } },
          ambassador: { select: { status: true } },
        },
      })
    : null;

  if (
    !campaign ||
    !campaign.active ||
    campaign.ambassador.status !== "APPROVED" ||
    campaign.event.status === "REJECTED"
  ) {
    return NextResponse.redirect(
      new URL(campaign ? `/events/${campaign.event.slug}` : "/events", request.url),
      302,
    );
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  if (!BOT_UA.test(userAgent)) {
    const ip =
      (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "";
    try {
      await db.ambassadorClick.create({
        data: {
          promoEventId: campaign.id,
          code: campaign.code,
          eventId: campaign.eventId,
          visitorHash: visitorHash(ip, userAgent),
        },
      });
    } catch {
      // A failed click log must never stop the visitor reaching the event.
    }
  }

  const response = NextResponse.redirect(
    new URL(
      `/events/${campaign.event.slug}?promo=${encodeURIComponent(campaign.code)}`,
      request.url,
    ),
    302,
  );
  response.cookies.set(promoCookieName(campaign.eventId), campaign.code, {
    maxAge: PROMO_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}
