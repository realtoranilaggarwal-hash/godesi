import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";

/** Click tracker for pixel-wall blocks: count, then send the visitor onward. */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const block = await db.wallBlock.findUnique({ where: { id: params.id } });
  if (!block) return NextResponse.redirect(siteUrl(), 302);

  db.wallBlock
    .update({ where: { id: block.id }, data: { clicks: { increment: 1 } } })
    .catch(() => {});

  return NextResponse.redirect(new URL(block.linkUrl, siteUrl()), 302);
}
