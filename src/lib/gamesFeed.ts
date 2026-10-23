import { cachedQuery } from "@/lib/cache";

export type FeedGame = {
  id: string;
  title: string;
  description: string;
  instructions: string;
  url: string;
  category: string;
  tags: string;
  thumb: string;
};

const FEED_URL =
  "https://gamemonetize.com/feed.php?format=0&num=50&page=1";

/** GameMonetize's free JSON catalog — embedded games earn ad rev share. */
export const gamesFeed = cachedQuery(
  "games-feed",
  3600,
  async (): Promise<FeedGame[]> => {
    try {
      const res = await fetch(FEED_URL, {
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      const data = (await res.json()) as FeedGame[];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
);

export async function feedGame(id: string) {
  const games = await gamesFeed();
  return games.find((game) => game.id === id) ?? null;
}
