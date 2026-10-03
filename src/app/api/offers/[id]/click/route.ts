import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";
import { liveStoreOfferWhere } from "@/lib/storeOffers";

/** Counts the click, then sends the visitor on to the store's tracking link. */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const offer = await db.storeOffer.findFirst({
    where: { id: params.id, ...liveStoreOfferWhere() },
    select: { id: true, clickUrl: true },
  });
  if (!offer)
    return NextResponse.redirect(`${siteUrl()}/deals`, { status: 302 });

  await db.storeOffer
    .update({ where: { id: offer.id }, data: { clicks: { increment: 1 } } })
    .catch(() => null);

  return NextResponse.redirect(offer.clickUrl, { status: 302 });
}
