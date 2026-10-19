import { db } from "@/lib/db";
import { cachedQuery } from "@/lib/cache";
import { OFFER_INTERESTS, type OfferInterest } from "@/lib/offerInterests";

export type OfferDemand = { interest: OfferInterest; members: number };

/** How many members ticked each benefit topic — counts only, never who. */
const demandCounts = cachedQuery("offer-demand", 900, async () => {
  const rows = await db.$queryRaw<{ id: string; n: number }[]>`
    SELECT unnest("offerInterests") AS id, count(*)::int AS n
    FROM "User"
    WHERE "bannedAt" IS NULL
    GROUP BY 1`;
  return Object.fromEntries(rows.map((row) => [row.id, row.n]));
});

/** Topics with at least one interested member, busiest first, optionally for one category. */
export async function offerDemand(category?: string | null) {
  const counts: Record<string, number> = await demandCounts().catch(() => ({}));
  return OFFER_INTERESTS.filter(
    (interest) => !category || interest.category === category,
  )
    .map((interest) => ({ interest, members: counts[interest.id] ?? 0 }))
    .filter((row) => row.members > 0)
    .sort((a, b) => b.members - a.members);
}
