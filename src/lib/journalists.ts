import { db } from "@/lib/db";

/** Star levels earned by having stories approved on the community news desk. */
export const JOURNALIST_LEVELS = [
  { level: 1, stars: "⭐", title: "Contributor", stories: 1 },
  { level: 2, stars: "⭐⭐", title: "Reporter", stories: 5 },
  { level: 3, stars: "⭐⭐⭐", title: "Senior reporter", stories: 15 },
  { level: 4, stars: "⭐⭐⭐⭐", title: "Editor's circle", stories: 40 },
] as const;

export type JournalistLevel = (typeof JOURNALIST_LEVELS)[number];

export function levelFor(approved: number): JournalistLevel | null {
  let current: JournalistLevel | null = null;
  for (const level of JOURNALIST_LEVELS) {
    if (approved >= level.stories) current = level;
  }
  return current;
}

export function nextLevel(approved: number): JournalistLevel | null {
  return JOURNALIST_LEVELS.find((level) => approved < level.stories) ?? null;
}

export type JournalistStats = {
  approved: number;
  pending: number;
  featured: number;
  upvotes: number;
  level: JournalistLevel | null;
  next: JournalistLevel | null;
  joined: Date | null;
  beat: string | null;
};

export async function journalistStats(userId: string): Promise<JournalistStats> {
  const [user, approved, pending, featured, scores] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { journalistSince: true, journalistBeat: true },
    }),
    db.newsItem.count({ where: { submittedById: userId, status: "PUBLISHED" } }),
    db.newsItem.count({ where: { submittedById: userId, status: "PENDING" } }),
    db.newsItem.count({ where: { submittedById: userId, featured: true } }),
    db.newsItem.findMany({
      where: { submittedById: userId },
      select: { score: true },
    }),
  ]);

  return {
    approved,
    pending,
    featured,
    upvotes: scores.reduce((sum, item) => sum + Math.max(item.score, 0), 0),
    level: levelFor(approved),
    next: nextLevel(approved),
    joined: user?.journalistSince ?? null,
    beat: user?.journalistBeat ?? null,
  };
}

export type LeaderRow = {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  beat: string | null;
  approved: number;
  level: JournalistLevel | null;
};

/** Top contributors by approved stories, for the /news leaderboard. */
export async function topJournalists(limit = 8): Promise<LeaderRow[]> {
  const grouped = await db.newsItem.groupBy({
    by: ["submittedById"],
    where: { status: "PUBLISHED", submittedById: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });

  const ids = grouped
    .map((row) => row.submittedById)
    .filter((id): id is string => Boolean(id));
  if (!ids.length) return [];

  const users = await db.user.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
      journalistBeat: true,
    },
  });
  const byId = new Map(users.map((user) => [user.id, user]));

  return grouped.flatMap((row) => {
    const user = row.submittedById ? byId.get(row.submittedById) : undefined;
    if (!user) return [];
    const approved = row._count._all;
    return [
      {
        id: user.id,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        beat: user.journalistBeat,
        approved,
        level: levelFor(approved),
      },
    ];
  });
}

export const JOURNALIST_RULES = [
  "Report what you saw or can verify — no rumours, and no copying another site's article word for word.",
  "Credit your source and link to it. Photos must be yours or free to use.",
  "No paid promotion disguised as news, no hate speech, and nothing that puts anyone at risk.",
  "The Godesi team reviews every submission and may edit, unpublish or delete any story, and remove journalist status for repeat problems.",
] as const;
