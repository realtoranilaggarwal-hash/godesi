import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";

/** Counts the click, then sends the visitor on to the store's tracking link. */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const offer = await db.storeOffer.findUnique({ where: { id: params.id } });
  if (!offer)
    return NextResponse.redirect(`${siteUrl()}/deals`, { status: 302 });

  await db.storeOffer
    .update({ where: { id: offer.id }, data: { clicks: { increment: 1 } } })
    .catch(() => null);

  return NextResponse.redirect(offer.clickUrl, { status: 302 });
}
