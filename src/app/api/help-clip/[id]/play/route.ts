import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** Counts a play so staff can see which clips people actually watch. */
export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  await db.helpClip.updateMany({
    where: { id: params.id, active: true },
    data: { plays: { increment: 1 } },
  });

  return NextResponse.json({ ok: true });
}
