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

/** "Jason Miller", "jasonmiller" and "jason-miller" all reduce to "jasonmiller". */
export function nameKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\u00c0-\uffff]/g, "");
}

/** Users whose name or handle, with spaces and punctuation removed, matches. */
async function idsBySquashedName(keys: string[], partial: boolean) {
  if (!keys.length) return [];
  const patterns = partial ? keys.map((key) => `%${key}%`) : keys;
  const rows = await db.$queryRaw<{ id: string }[]>`
    SELECT id FROM "User"
    WHERE regexp_replace(lower(name), '[^[:alnum:]]', '', 'g') LIKE ANY(${patterns})
       OR regexp_replace(lower(coalesce(username, '')), '[^[:alnum:]]', '', 'g') LIKE ANY(${patterns})
    LIMIT 50`;
  return rows.map((row) => row.id);
}

/**
 * Members whose name contains every word typed, for the speaker picker —
 * plus members whose name or handle matches with the spaces left out.
 */
export async function findProfilesByName(
  query: string,
  take = 5,
): Promise<ProfileMatch[]> {
  const words = query.trim().split(/\s+/).filter(Boolean).slice(0, 4);
  if (!words.length || words.join("").length < 3) return [];
  const key = nameKey(query);
  const squashed = key.length >= 4 ? await idsBySquashedName([key], true) : [];
  return db.user.findMany({
    where: {
      ...PUBLIC_PROFILE,
      OR: [
        {
          AND: words.map((word) => ({
            name: { contains: word, mode: "insensitive" as const },
          })),
        },
        { id: { in: squashed } },
      ],
    },
    select: MATCH_FIELDS,
    orderBy: [{ avatarUrl: "desc" }, { createdAt: "asc" }],
    take,
  });
}

/**
 * Same-name match (ignoring case, spaces and punctuation, or the member's
 * handle) for speakers typed in without picking a profile. Keyed by `nameKey`.
 */
export async function matchProfilesByExactName(
  names: string[],
): Promise<Map<string, ProfileMatch>> {
  const wanted = Array.from(
    new Set(names.map(nameKey).filter((key) => key.length >= 4)),
  );
  if (!wanted.length) return new Map();
  const ids = await idsBySquashedName(wanted, false);
  if (!ids.length) return new Map();
  const users = await db.user.findMany({
    where: { ...PUBLIC_PROFILE, id: { in: ids } },
    select: MATCH_FIELDS,
    orderBy: { createdAt: "asc" },
  });
  const byName = new Map<string, ProfileMatch>();
  for (const user of users) {
    for (const key of [nameKey(user.name), nameKey(user.username ?? "")]) {
      if (key && !byName.has(key)) byName.set(key, user);
    }
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
