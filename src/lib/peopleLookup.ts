import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/** Only profiles that resolve to a public godesi.com/<username> page. */
export const PUBLIC_PROFILE = {
  emailVerifiedAt: { not: null },
  bannedAt: null,
  username: { not: null },
} satisfies Prisma.UserWhereInput;

const MATCH_FIELDS = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  headline: true,
  location: true,
} as const;

export type ProfileMatch = Prisma.UserGetPayload<{
  select: typeof MATCH_FIELDS;
}>;

/** Members whose name contains every word typed, for the speaker picker. */
export async function findProfilesByName(
  query: string,
  take = 5,
): Promise<ProfileMatch[]> {
  const words = query.trim().split(/\s+/).filter(Boolean).slice(0, 4);
  if (!words.length || words.join("").length < 3) return [];
  return db.user.findMany({
    where: {
      ...PUBLIC_PROFILE,
      AND: words.map((word) => ({
        name: { contains: word, mode: "insensitive" as const },
      })),
    },
    select: MATCH_FIELDS,
    orderBy: [{ avatarUrl: "desc" }, { createdAt: "asc" }],
    take,
  });
}

/** Exact-name match for speakers saved before organisers could pick a profile. */
export async function matchProfilesByExactName(
  names: string[],
): Promise<Map<string, ProfileMatch>> {
  const wanted = Array.from(
    new Set(names.map((name) => name.trim()).filter(Boolean)),
  );
  if (!wanted.length) return new Map();
  const users = await db.user.findMany({
    where: {
      ...PUBLIC_PROFILE,
      OR: wanted.map((name) => ({
        name: { equals: name, mode: "insensitive" as const },
      })),
    },
    select: MATCH_FIELDS,
    orderBy: { createdAt: "asc" },
  });
  const byName = new Map<string, ProfileMatch>();
  for (const user of users) {
    const key = user.name.trim().toLowerCase();
    if (!byName.has(key)) byName.set(key, user);
  }
  return byName;
}

/** Confirms a picked profile id still points at a public profile. */
export async function publicProfileIds(ids: string[]): Promise<Set<string>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (!unique.length) return new Set();
  const users = await db.user.findMany({
    where: { ...PUBLIC_PROFILE, id: { in: unique } },
    select: { id: true },
  });
  return new Set(users.map((user) => user.id));
}
