import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";
import { WELLNESS_PATH, liveProductWhere } from "@/lib/wellness";

/** Counts the click, then sends the visitor on to the approved affiliate link. */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const product = await db.wellnessProduct.findFirst({
    where: { id: params.id, ...liveProductWhere },
    select: { id: true, affiliateUrl: true },
  });
  if (!product?.affiliateUrl)
    return NextResponse.redirect(`${siteUrl()}${WELLNESS_PATH}`, { status: 302 });

  await db.wellnessProduct
    .update({ where: { id: product.id }, data: { clicks: { increment: 1 } } })
    .catch(() => null);

  return NextResponse.redirect(product.affiliateUrl, { status: 302 });
}
