import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";

/** Counts the click, then sends the visitor on to the destination. */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const link = await db.resourceLink.findUnique({ where: { id: params.id } });
  if (!link) return NextResponse.redirect(siteUrl(), { status: 302 });

  await db.resourceLink
    .update({ where: { id: link.id }, data: { clicks: { increment: 1 } } })
    .catch(() => null);

  return NextResponse.redirect(link.url, { status: 302 });
}
