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
  total: number;
};

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
    total: 0,
  };
  if (q.length < 2) return empty;

  const like = { contains: q, mode: "insensitive" as const };
  const cityFilter = city ? { city: { contains: city, mode: "insensitive" as const } } : {};

  const [businesses, events, listings, worship, leads, categories, resources] =
    await Promise.all([
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
        select: { id: true, title: true, url: true, tag: true },
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
      subtitle: row.tag ?? "Recommended link",
      badge: "Resource",
    })),
    total: 0,
  };

  results.total =
    results.businesses.length +
    results.events.length +
    results.listings.length +
    results.worship.length +
    results.leads.length +
    results.categories.length +
    results.resources.length;

  return results;
}
