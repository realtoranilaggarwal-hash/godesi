import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { PUBLIC_PROFILE, findProfilesByName } from "@/lib/peopleLookup";
import { searchWords } from "@/lib/keywordSearch";
import { LEGACY_EVENT_ZONE } from "@/lib/time";

export type SiteSearchHit = {
  href: string;
  title: string;
  subtitle: string;
  badge: string;
};

export type SiteSearchResults = {
  businesses: SiteSearchHit[];
  events: SiteSearchHit[];
  listings: SiteSearchHit[];
  worship: SiteSearchHit[];
  leads: SiteSearchHit[];
  categories: SiteSearchHit[];
  resources: SiteSearchHit[];
  venues: SiteSearchHit[];
  members: SiteSearchHit[];
  pages: SiteSearchHit[];
  total: number;
};

/**
 * Godesi's own pages, matched on keywords, so someone typing "top contributors",
 * "points" or "radio" lands on the feature instead of an empty result page.
 */
const SITE_PAGES: {
  href: string;
  title: string;
  subtitle: string;
  keywords: string[];
}[] = [
  {
    href: "/leaderboard",
    title: "🏅 Top contributors",
    subtitle: "The members earning the most Godesi points",
    keywords: [
      "leaderboard",
      "leader board",
      "ledger board",
      "top contributors",
      "contributors",
      "contribution",
      "ranking",
      "top 100",
      "points",
    ],
  },
  {
    href: "/dashboard/rewards",
    title: "🪙 Your points wallet",
    subtitle: "Earned, spent and what points unlock",
    keywords: ["points", "rewards", "wallet", "refer", "referral", "coupons"],
  },
  {
    href: "/desi-elite",
    title: "🏆 GoDesi Elite",
    subtitle: "Recognised desi leaders, interviews and awards",
    keywords: ["elite", "whos who", "who's who", "awards", "recognition"],
  },
  {
    href: "/live-radio",
    title: "🎧 Live desi radio",
    subtitle: "Bollywood, Hindi, Punjabi and news stations",
    keywords: ["radio", "fm", "music", "listen", "station", "gurbani"],
  },
  {
    href: "/live-tv",
    title: "📺 Live desi TV",
    subtitle: "News channels live from India and abroad",
    keywords: ["tv", "television", "channel", "news live", "watch"],
  },
  {
    href: "/journalists",
    title: "🎙 Become a local journalist",
    subtitle: "Report news from your city",
    keywords: ["journalist", "reporter", "news", "press"],
  },
  {
    href: "/advertise",
    title: "📢 Advertise on Godesi",
    subtitle: "Banners, featured placement and sponsored links",
    keywords: ["advertise", "ads", "banner", "sponsor", "promotion"],
  },
  {
    href: "/badge",
    title: "🏅 “Listed on Godesi” badge",
    subtitle: "Free badge and link for your own website",
    keywords: ["badge", "widget", "embed", "logo", "link", "backlink"],
  },
  {
    href: "/website",
    title: "🌐 Get a website",
    subtitle: "Five-page site with domain and hosting",
    keywords: ["website", "domain", "hosting", "web design"],
  },
  {
    href: "/website/examples",
    title: "🎨 Website before & after examples",
    subtitle: "Old sites next to our redesigns — vote which you like",
    keywords: ["website examples", "redesign", "portfolio", "before and after", "web design"],
  },
  {
    href: "/live/submit",
    title: "➕ Add your radio or TV channel",
    subtitle: "Carriage, non-profit exceptions and featuring",
    keywords: ["submit radio", "submit tv", "add channel", "carriage"],
  },
  {
    href: "/pricing",
    title: "💎 Membership plans",
    subtitle: "What free, Pro and Premium include",
    keywords: ["pricing", "plans", "membership", "premium", "upgrade", "cost"],
  },
  {
    href: "/venues",
    title: "📍 Event venues",
    subtitle: "Banquet halls, temples and grounds hosting desi events",
    keywords: ["venue", "venues", "hall", "banquet", "ground", "location"],
  },
  {
    href: "/bazaar",
    title: "🛍️ Oak Tree Road Bazaar, Iselin NJ",
    subtitle: "Indian shops, restaurants, jewellers and groceries on Oak Tree Road",
    keywords: [
      "oak tree",
      "oaktree",
      "oak tree road",
      "oak tree bazaar",
      "oak tree road bazaar",
      "iselin",
      "desi market",
      "indian market",
      "india market",
      "indian bazaar",
      "desi bazaar",
      "little india",
      "indian grocery",
      "indian shops",
    ],
  },
  {
    href: "/faq",
    title: "❓ FAQ",
    subtitle: "How everything on Godesi works",
    keywords: ["faq", "help", "how to", "guide", "support"],
  },
];

function pageHits(q: string): SiteSearchHit[] {
  const needle = q.toLowerCase();
  return SITE_PAGES.filter(
    (page) =>
      page.title.toLowerCase().includes(needle) ||
      page.keywords.some(
        (keyword) => keyword.includes(needle) || needle.includes(keyword),
      ),
  )
    .slice(0, 5)
    .map((page) => ({
      href: page.href,
      title: page.title,
      subtitle: page.subtitle,
      badge: "Page",
    }));
}

const LISTING_LABELS: Record<string, string> = {
  PROPERTY_SALE: "Property for sale",
  PROPERTY_RENT: "Property for rent",
  ROOM: "Room / roommate",
  ITEM: "Item for sale",
};

/** Short forms people type for event names ("nye" → New Year's Eve). */
const EVENT_ALIASES: Record<string, string> = {
  nye: "new year eve",
};

/**
 * Every word of the query must appear somewhere in the event, so "new years
 * eve" or "nye" find "New Year's Eve Party" even though the exact phrase differs.
 */
function eventWordsMatch(q: string) {
  const words = searchWords(
    q
      .toLowerCase()
      .replace(/'/g, "")
      .split(/\s+/)
      .map((word) => EVENT_ALIASES[word] ?? word)
      .join(" "),
  );
  if (!words.length) return [];
  return [
    {
      AND: words.map((word) => {
        const has = { contains: word, mode: "insensitive" as const };
        return { OR: [{ title: has }, { description: has }, { venue: has }] };
      }),
    },
  ];
}

/** Words people type for a trade that listings name differently. */
const WORD_ALIASES = new Map<string, string[]>([
  ["realtor", ["real estate", "realty"]],
  ["realty", ["real estate", "realtor"]],
]);

type FieldMatch = (has: Prisma.StringFilter) => object;

/**
 * Every word of a multi-word query must appear in one of `fields`, so
 * "anil aggarwal realtor" finds a real estate agent owned by Anil Aggarwal
 * even though no single field holds that exact phrase.
 */
function everyWordIn(words: string[], fields: FieldMatch[]) {
  if (words.length < 2) return [];
  return [
    {
      AND: words.map((word) => ({
        OR: [word, ...(WORD_ALIASES.get(word) ?? [])].flatMap((variant) =>
          fields.map((field) =>
            field({ contains: variant, mode: "insensitive" }),
          ),
        ),
      })),
    },
  ];
}

/**
 * One query across every surface — businesses, wedding vendors, events, property
 * and item listings, temples, requirements, categories and resource links — so
 * people looking for "photographer" find them wherever they are listed.
 */
export async function siteSearch(
  query: string,
  city?: string,
): Promise<SiteSearchResults> {
  const q = query.trim();
  const empty: SiteSearchResults = {
    businesses: [],
    events: [],
    listings: [],
    worship: [],
    leads: [],
    categories: [],
    resources: [],
    venues: [],
    members: [],
    pages: [],
    total: 0,
  };
  if (q.length < 2) return empty;

  const like = { contains: q, mode: "insensitive" as const };
  const cityFilter = city ? { city: { contains: city, mode: "insensitive" as const } } : {};
  const words = searchWords(q);

  const [
    businesses,
    events,
    listings,
    worship,
    leads,
    categories,
    resources,
    venues,
    members,
  ] = await Promise.all([
      db.business.findMany({
        where: {
          status: "APPROVED",
          ...cityFilter,
          OR: [
            { name: like },
            { description: like },
            { category: like },
            { specialties: { has: q } },
            { categoryRef: { name: like } },
            { subcategoryRef: { name: like } },
            // People search for the owner's name as often as the shop name.
            { owner: { name: like } },
            ...everyWordIn(words, [
              (has) => ({ name: has }),
              (has) => ({ description: has }),
              (has) => ({ category: has }),
              (has) => ({ city: has }),
              (has) => ({ categoryRef: { name: has } }),
              (has) => ({ subcategoryRef: { name: has } }),
              (has) => ({ owner: { name: has } }),
            ]),
          ],
        },
        orderBy: [
          { featuredRank: "desc" },
          { featured: "desc" },
          { createdAt: "desc" },
        ],
        take: 12,
        select: {
          slug: true,
          name: true,
          category: true,
          city: true,
          specialties: true,
        },
      }),
      db.event.findMany({
        where: {
          status: "APPROVED",
          startsAt: { gte: new Date() },
          ...cityFilter,
          OR: [
            { title: like },
            { description: like },
            { venue: like },
            ...eventWordsMatch(q),
          ],
        },
        orderBy: { startsAt: "asc" },
        take: 6,
        select: {
          slug: true,
          title: true,
          city: true,
          startsAt: true,
          timeZone: true,
        },
      }),
      db.listing.findMany({
        where: {
          status: "APPROVED",
          ...cityFilter,
          OR: [{ title: like }, { description: like }, { area: like }],
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: 8,
        select: { slug: true, title: true, city: true, kind: true },
      }),
      db.worshipPlace.findMany({
        where: {
          status: "APPROVED",
          ...cityFilter,
          OR: [{ name: like }, { description: like }, { address: like }],
        },
        take: 5,
        select: { slug: true, name: true, city: true, faith: true },
      }),
      db.lead.findMany({
        where: {
          status: "OPEN",
          ...cityFilter,
          OR: [{ title: like }, { description: like }, { category: like }],
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, city: true, category: true },
      }),
      db.category.findMany({
        where: { OR: [{ name: like }, { blurb: like }] },
        take: 8,
        select: { slug: true, name: true, icon: true, parent: { select: { name: true } } },
      }),
      db.resourceLink.findMany({
        where: { status: "APPROVED", active: true, title: like },
        take: 5,
        select: { id: true, title: true, url: true, tags: true, description: true },
      }),
      db.venue.findMany({
        where: {
          ...cityFilter,
          OR: [{ name: like }, { address: like }],
        },
        orderBy: { name: "asc" },
        take: 5,
        select: {
          id: true,
          name: true,
          city: true,
          halls: true,
          _count: { select: { events: { where: { status: "APPROVED" } } } },
        },
      }),
      Promise.all([
        findProfilesByName(q, city ? 25 : 5),
        words.length > 1
          ? db.user.findMany({
              where: {
                ...PUBLIC_PROFILE,
                ...everyWordIn(words, [
                  (has) => ({ name: has }),
                  (has) => ({ headline: has }),
                  (has) => ({ location: has }),
                ])[0],
              },
              select: {
                id: true,
                name: true,
                username: true,
                avatarUrl: true,
                headline: true,
                location: true,
              },
              orderBy: [{ avatarUrl: "desc" }, { createdAt: "asc" }],
              take: city ? 25 : 5,
            })
          : [],
      ]).then(([byName, byWords]) => {
        const seen = new Set(byName.map((row) => row.id));
        const rows = [...byName, ...byWords.filter((row) => !seen.has(row.id))];
        return (
          city
            ? rows.filter((row) =>
                row.location?.toLowerCase().includes(city.toLowerCase()),
              )
            : rows
        ).slice(0, 5);
      }),
    ]);

  const results: SiteSearchResults = {
    businesses: businesses.map((row) => ({
      href: `/business/${row.slug}`,
      title: row.name,
      subtitle: [row.category, row.city, row.specialties.slice(0, 3).join(", ")]
        .filter(Boolean)
        .join(" · "),
      badge: "Business",
    })),
    events: events.map((row) => ({
      href: `/events/${row.slug}`,
      title: row.title,
      subtitle: `${row.city} · ${row.startsAt.toLocaleDateString("en-US", {
        timeZone: row.timeZone || LEGACY_EVENT_ZONE,
      })}`,
      badge: "Event",
    })),
    listings: listings.map((row) => ({
      href: `/listings/${row.slug}`,
      title: row.title,
      subtitle: `${LISTING_LABELS[row.kind] ?? "Listing"} · ${row.city}`,
      badge: "Listing",
    })),
    worship: worship.map((row) => ({
      href: `/religious/${row.slug}`,
      title: row.name,
      subtitle: `${row.faith} · ${row.city}`,
      badge: "Temple",
    })),
    leads: leads.map((row) => ({
      href: `/leads/${row.id}`,
      title: row.title,
      subtitle: `${row.category} · ${row.city}`,
      badge: "Requirement",
    })),
    categories: categories.map((row) => ({
      href: `/categories/${row.slug}`,
      title: `${row.icon} ${row.name}`,
      subtitle: row.parent ? `in ${row.parent.name}` : "Browse this category",
      badge: "Category",
    })),
    resources: resources.map((row) => ({
      href: row.url,
      title: row.title,
      subtitle: row.description || row.tags.join(", ") || "Recommended link",
      badge: "Resource",
    })),
    venues: venues.map((row) => ({
      href: `/events?venue=${encodeURIComponent(row.name)}`,
      title: row.name,
      subtitle: [
        row.city,
        row.halls.length ? `${row.halls.length} halls` : null,
        `${row._count.events} events`,
      ]
        .filter(Boolean)
        .join(" · "),
      badge: "Venue",
    })),
    members: members.map((row) => ({
      href: `/${row.username}`,
      title: row.name,
      subtitle:
        [row.headline, row.location].filter(Boolean).join(" · ") ||
        "GoDesi member",
      badge: "Member",
    })),
    pages: pageHits(q),
    total: 0,
  };

  results.total =
    results.businesses.length +
    results.events.length +
    results.listings.length +
    results.worship.length +
    results.leads.length +
    results.categories.length +
    results.resources.length +
    results.venues.length +
    results.members.length +
    results.pages.length;

  return results;
}
