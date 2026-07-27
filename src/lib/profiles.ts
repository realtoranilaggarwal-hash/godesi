import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";

/**
 * Paths that already exist at the root of the site. Usernames resolve at
 * godesi.com/<username>, so they must never shadow a real page.
 */
export const RESERVED_USERNAMES = new Set([
  "admin",
  "advertise",
  "api",
  "b",
  "categories",
  "contact",
  "cookies",
  "dashboard",
  "events",
  "favicon.ico",
  "leads",
  "login",
  "logout",
  "me",
  "news",
  "pricing",
  "privacy",
  "ref",
  "refunds",
  "robots.txt",
  "search",
  "signup",
  "sitemap.xml",
  "terms",
  "tickets",
  "u",
  "verify-email",
  "wedding",
  "real-estate",
  "rooms",
  "godesi",
  "support",
  "help",
  "about",
]);

export const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9._-]{1,28})[a-z0-9]$/;

export function normalizeUsername(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, "-").replace(/^@/, "");
}

export function usernameError(username: string) {
  if (!USERNAME_PATTERN.test(username)) {
    return "Use 3–30 characters: lowercase letters, numbers, dot, dash or underscore.";
  }
  if (RESERVED_USERNAMES.has(username)) return "That username is reserved.";
  return null;
}

/** Suggests a free handle from the member's name, e.g. "anil-biz-2". */
export async function suggestUsername(name: string, email: string) {
  const base =
    slugify(name).slice(0, 24) || slugify(email.split("@")[0]).slice(0, 24) || "member";
  let candidate = base.length >= 3 ? base : `${base}-godesi`;
  let counter = 1;
  // eslint-disable-next-line no-await-in-loop
  while (
    RESERVED_USERNAMES.has(candidate) ||
    (await db.user.findUnique({ where: { username: candidate }, select: { id: true } }))
  ) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  return candidate;
}

/** Everything the public personal profile renders, in one query round. */
export async function publicProfile(username: string) {
  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
      bio: true,
      location: true,
      plan: true,
      planExpiresAt: true,
      createdAt: true,
      business: {
        select: {
          slug: true,
          name: true,
          city: true,
          category: true,
          logoUrl: true,
          status: true,
        },
      },
    },
  });
  if (!user) return null;

  const [events, leads, reviews] = await Promise.all([
    db.event.findMany({
      where: { organizerId: user.id, status: "APPROVED" },
      orderBy: { startsAt: "desc" },
      take: 6,
      select: { slug: true, title: true, startsAt: true, city: true, imageUrl: true },
    }),
    db.lead.findMany({
      where: { clientId: user.id, status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, title: true, city: true, category: true, createdAt: true },
    }),
    db.review.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        business: { select: { slug: true, name: true } },
      },
    }),
  ]);

  return { user, events, leads, reviews };
}

export type PostedBy = {
  name: string;
  username: string | null;
  avatarUrl: string | null;
};
