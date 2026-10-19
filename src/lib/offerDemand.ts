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

/** Distinct members who ticked any of these topics, so one member ticking four topics counts once. */
const demandMembers = cachedQuery(
  "offer-demand-members",
  900,
  async (ids: string[]) => {
    const [row] = await db.$queryRaw<{ n: number }[]>`
      SELECT count(*)::int AS n
      FROM "User"
      WHERE "bannedAt" IS NULL AND "offerInterests" && ${ids}::text[]`;
    return row?.n ?? 0;
  },
);

/** Topics with at least one interested member, busiest first, optionally for one category. */
export async function offerDemand(category?: string | null) {
  const counts: Record<string, number> = await demandCounts().catch(() => ({}));
  const topics = OFFER_INTERESTS.filter(
    (interest) => !category || interest.category === category,
  )
    .map((interest) => ({ interest, members: counts[interest.id] ?? 0 }))
    .filter((row) => row.members > 0)
    .sort((a, b) => b.members - a.members);
  const members = topics.length
    ? await demandMembers(topics.map((row) => row.interest.id)).catch(() =>
        Math.max(...topics.map((row) => row.members)),
      )
    : 0;
  return { topics, members };
}
