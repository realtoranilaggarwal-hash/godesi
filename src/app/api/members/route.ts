import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function newestMembers() {
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

  return { members, total };
}

/** Newest members for the floating bubbles on the home hero. */
const cachedMembers = unstable_cache(newestMembers, ["newest-members"], {
  revalidate: 120,
});

// Every open home page polls this. A signup showing up two minutes late costs
// nobody anything; a database read per tab per 30 seconds costs compute hours.
export async function GET() {
  return NextResponse.json(await cachedMembers(), {
    headers: {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
    },
  });
}
