import { db } from "@/lib/db";

/** The station/channel keys this member has starred, for the radio and TV lists. */
export async function liveFavoriteKeys(userId: string | null) {
  if (!userId) return new Set<string>();
  const rows = await db.liveChannelFavorite.findMany({
    where: { userId },
    select: { channelKey: true },
  });
  return new Set(rows.map((row) => row.channelKey));
}
