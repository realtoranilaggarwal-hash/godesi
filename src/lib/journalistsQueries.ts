/**
 * The database half of journalists.ts — the levels, categories and score helpers next door are safe for client components, but a module that touches Prisma cannot be bundled for the browser.
 */

import { randomInt } from "crypto";
import { db } from "@/lib/db";
import {
  JournalistStats,
  LeaderRow,
  levelFor,
  nextLevel,
  trustScore,
} from "@/lib/journalists";

/** Counts of reader verdicts across everything a member has filed. */
async function verdictCounts(userId: string) {
  const grouped = await db.newsVerification.groupBy({
    by: ["verdict"],
    where: { news: { submittedById: userId } },
    _count: { _all: true },
  });
  const count = (verdict: "CONFIRMED" | "DOUBTED" | "FAKE") =>
    grouped.find((row) => row.verdict === verdict)?._count._all ?? 0;

  return {
    confirmed: count("CONFIRMED"),
    doubted: count("DOUBTED"),
    fake: count("FAKE"),
  };
}

export async function journalistStats(
  userId: string,
): Promise<JournalistStats> {
  const [user, approved, pending, featured, rejected, scores, verdicts] =
    await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          username: true,
          avatarUrl: true,
          journalistSince: true,
          journalistBeat: true,
          emailVerifiedAt: true,
          phoneVerifiedAt: true,
          kycVerifiedAt: true,
          pressCardId: true,
          pressCardIssuedAt: true,
          pressCardExpiresAt: true,
        },
      }),
      db.newsItem.count({
        where: { submittedById: userId, status: "PUBLISHED" },
      }),
      db.newsItem.count({
        where: { submittedById: userId, status: "PENDING" },
      }),
      db.newsItem.count({ where: { submittedById: userId, featured: true } }),
      db.newsItem.count({
        where: { submittedById: userId, status: "REJECTED" },
      }),
      db.newsItem.findMany({
        where: { submittedById: userId },
        select: { score: true },
      }),
      verdictCounts(userId),
    ]);

  const level = levelFor(approved);

  return {
    approved,
    pending,
    featured,
    upvotes: scores.reduce((sum, item) => sum + Math.max(item.score, 0), 0),
    level,
    next: nextLevel(approved),
    joined: user?.journalistSince ?? null,
    beat: user?.journalistBeat ?? null,
    trust: {
      ...verdicts,
      score: trustScore({ approved, featured, ...verdicts }),
    },
    checks: {
      email: Boolean(user?.emailVerifiedAt),
      phone: Boolean(user?.phoneVerifiedAt),
      kyc: Boolean(user?.kycVerifiedAt),
      cleanRecord: rejected === 0 && verdicts.fake < 3,
    },
    pressCard:
      user?.pressCardId && user.pressCardIssuedAt && user.pressCardExpiresAt
        ? {
            id: user.pressCardId,
            name: user.name,
            avatarUrl: user.avatarUrl,
            username: user.username,
            beat: user.journalistBeat,
            level: level?.title ?? "Contributor",
            issuedAt: user.pressCardIssuedAt,
            expiresAt: user.pressCardExpiresAt,
            expired: user.pressCardExpiresAt < new Date(),
          }
        : null,
  };
}

/** GD-XXXXX press card numbers, unique across members. */
export async function nextPressCardId() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = `GD-${String(randomInt(0, 100000)).padStart(5, "0")}`;
    const taken = await db.user.findUnique({
      where: { pressCardId: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
  }
  throw new Error("Could not allocate a press card number — please try again.");
}

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
      pressCardId: true,
      pressCardExpiresAt: true,
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
        pressCard: Boolean(
          user.pressCardId &&
          user.pressCardExpiresAt &&
          user.pressCardExpiresAt > new Date(),
        ),
      },
    ];
  });
}
