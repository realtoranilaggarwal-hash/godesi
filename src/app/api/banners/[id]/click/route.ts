import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";

/** Counts the click, then bounces the visitor to the advertiser. */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const banner = await db.banner.findUnique({ where: { id: params.id } });
  if (!banner) return NextResponse.redirect(siteUrl(), { status: 302 });

  await db.banner
    .update({ where: { id: banner.id }, data: { clicks: { increment: 1 } } })
    .catch(() => null);

  return NextResponse.redirect(banner.linkUrl, { status: 302 });
}
