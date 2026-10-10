import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { GIG_SELECT } from "@/lib/gigs";
import { uniqueViolation } from "@/lib/actions";

/**
 * Paths that already exist at the root of the site. Usernames resolve at
 * godesi.com/<username>, so they must never shadow a real page.
 */
export const RESERVED_USERNAMES = new Set([
  "admin",
  "advertise",
  "api",
  "b",
  "gigs",
  "categories",
  "contact",
  "cookies",
  "dashboard",
  "events",
  "favicon.ico",
  "leaderboard",
  "leads",
  "listings",
  "login",
  "logout",
  "me",
  "news",
  "people",
  "professionals",
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
  "add-business",
  "alumni",
  "badge",
  "blog",
  "buzz",
  "city",
  "claim",
  "connect",
  "deals",
  "shop",
  "desi-elite",
  "faq",
  "feed.xml",
  "feeds",
  "festivals",
  "find",
  "fonts",
  "journalists",
  "live",
  "live-radio",
  "live-tv",
  "marketing",
  "marketplace",
  "news-sitemap.xml",
  "post",
  "religious",
  "report",
  "resources",
  "rewards",
  "safety",
  "sitemap",
  "trending",
  "usd-to-inr",
  "unsubscribe",
  "upgrade",
  "venues",
  "visa-bulletin",
  "website",
  "why-godesi",
  "why-list",
  "clubs",
  "complaints",
  "forgot-password",
  "guide",
  "media",
  "traffic",
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

/**
 * Gives a confirmed member a page at godesi.com/<handle> if they never picked
 * one, so every byline and member tile can link somewhere.
 */
export async function ensureUsername(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { username: true, name: true, email: true },
  });
  if (!user || user.username) return;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    const username = await suggestUsername(user.name, user.email);
    try {
      // eslint-disable-next-line no-await-in-loop
      await db.user.updateMany({
        where: { id: userId, username: null },
        data: { username },
      });
      return;
    } catch (error) {
      if (!uniqueViolation(error)) throw error;
    }
  }
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
      headline: true,
      lookingFor: true,
      education: true,
      experience: true,
      skills: true,
      languages: true,
      videoUrls: true,
      playlistUrl: true,
      albumUrl: true,
      openToWork: true,
      whatsappNumber: true,
      websiteUrl: true,
      instagramUrl: true,
      facebookUrl: true,
      youtubeUrl: true,
      linkedinUrl: true,
      xUrl: true,
      tiktokUrl: true,
      threadsUrl: true,
      telegramUrl: true,
      pinterestUrl: true,
      snapchatUrl: true,
      githubUrl: true,
      plan: true,
      planExpiresAt: true,
      createdAt: true,
      foundingNumber: true,
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

  const [events, leads, reviews, listings, gigs, clubs] = await Promise.all([
    db.event.findMany({
      where: { organizerId: user.id, status: "APPROVED" },
      orderBy: { startsAt: "desc" },
      take: 6,
      select: {
        slug: true,
        title: true,
        startsAt: true,
        timeZone: true,
        city: true,
        imageUrl: true,
      },
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
    db.listing.findMany({
      where: { ownerId: user.id, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { slug: true, title: true, city: true, kind: true, price: true },
    }),
    db.gig.findMany({
      where: { sellerId: user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: GIG_SELECT,
    }),
    db.clubMember.findMany({
      where: {
        userId: user.id,
        status: "ACTIVE",
        club: { visibility: "PUBLIC" },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        role: true,
        club: {
          select: {
            slug: true,
            name: true,
            imageUrl: true,
            category: true,
            city: true,
            state: true,
            createdById: true,
          },
        },
      },
    }),
  ]);

  return { user, events, leads, reviews, listings, gigs, clubs };
}

export type PostedBy = {
  name: string;
  username: string | null;
  avatarUrl: string | null;
};
