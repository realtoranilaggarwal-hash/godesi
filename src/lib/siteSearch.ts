import { db } from "@/lib/db";

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
    href: "/live",
    title: "💬 Live visitors & global chat",
    subtitle: "Who is online now, and the chit-chat room",
    keywords: ["chat", "chit chat", "live visitors", "map", "online"],
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
    pages: [],
    total: 0,
  };
  if (q.length < 2) return empty;

  const like = { contains: q, mode: "insensitive" as const };
  const cityFilter = city ? { city: { contains: city, mode: "insensitive" as const } } : {};

  const [
    businesses,
    events,
    listings,
    worship,
    leads,
    categories,
    resources,
    venues,
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
          ],
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
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
          OR: [{ title: like }, { description: like }, { venue: like }],
        },
        orderBy: { startsAt: "asc" },
        take: 6,
        select: { slug: true, title: true, city: true, startsAt: true },
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
    ]);

  const results: SiteSearchResults = {
    businesses: businesses.map((row) => ({
      href: `/b/${row.slug}`,
      title: row.name,
      subtitle: [row.category, row.city, row.specialties.slice(0, 3).join(", ")]
        .filter(Boolean)
        .join(" · "),
      badge: "Business",
    })),
    events: events.map((row) => ({
      href: `/events/${row.slug}`,
      title: row.title,
      subtitle: `${row.city} · ${row.startsAt.toLocaleDateString()}`,
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
    results.pages.length;

  return results;
}
