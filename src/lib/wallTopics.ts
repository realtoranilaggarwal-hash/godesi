import { db } from "@/lib/db";

/**
 * Every box costs two third-party requests, so the wall is capped — the admin
 * desk warns when live topics exceed it rather than dropping them silently.
 */
export const WALL_TOPIC_LIMIT = 36;

export type WallTopicView = {
  id: string;
  label: string;
  query: string;
  emoji: string | null;
};

/**
 * Used when the database is unreachable — the wall is a read-only page and a
 * blank one looks broken, so it falls back to the topics we shipped with.
 */
const FALLBACK_TOPICS: WallTopicView[] = [
  { id: "f1", label: "I love Modi", query: "i love modi", emoji: "🇮🇳" },
  { id: "f2", label: "H-1B visa", query: "h1b visa", emoji: "🛂" },
  {
    id: "f3",
    label: "Desi in New Jersey",
    query: "desi indian community new jersey",
    emoji: "🌉",
  },
  {
    id: "f4",
    label: "Desi events",
    query: "desi indian community events usa",
    emoji: "🎉",
  },
  {
    id: "f5",
    label: "Desi investments",
    query: "nri investment india",
    emoji: "📈",
  },
  { id: "f6", label: "Desi in USA", query: "indian community usa", emoji: "🇺🇸" },
];

export async function wallTopics(): Promise<WallTopicView[]> {
  try {
    const topics = await db.wallTopic.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      take: WALL_TOPIC_LIMIT,
      select: { id: true, label: true, query: true, emoji: true },
    });
    return topics.length ? topics : FALLBACK_TOPICS;
  } catch {
    return FALLBACK_TOPICS;
  }
}
