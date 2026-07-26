import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const { id } = (await request.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await db.banner
    .update({ where: { id }, data: { impressions: { increment: 1 } } })
    .catch(() => null);

  return new NextResponse(null, { status: 204 });
}
