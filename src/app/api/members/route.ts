import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Newest members for the floating bubbles on the home hero. */
export async function GET() {
  const [members, total] = await Promise.all([
    db.user.findMany({
      where: { emailVerifiedAt: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 18,
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        location: true,
      },
    }),
    db.user.count(),
  ]);

  return NextResponse.json(
    { members, total },
    { headers: { "cache-control": "no-store" } },
  );
}
