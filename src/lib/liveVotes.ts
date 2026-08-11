import { db } from "@/lib/db";

/**
 * Vote tallies for the station and channel cards. Keyed by the same code the
 * report button uses, so built-in and member-submitted streams share one table.
 */
export async function liveVoteCounts(): Promise<Record<string, number>> {
  const rows = await db.liveChannelVote.groupBy({
    by: ["channelKey"],
    _count: { channelKey: true },
  });
  return Object.fromEntries(
    rows.map((row) => [row.channelKey, row._count.channelKey]),
  );
}
