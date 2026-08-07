import { db } from "@/lib/db";
import { getCategory, categoryScopeSlugs } from "@/lib/directory";
import { listingWhere, KIND_LABELS, type ListingSection } from "@/lib/listings";
import { rssResponse, type RssItem } from "@/lib/rss";

export const dynamic = "force-dynamic";

/** Directory categories that also carry member-posted listings. */
const LISTING_SECTIONS: Record<string, ListingSection> = {
  "rooms-roommates": "rooms",
  "real-estate": "real-estate",
  "buy-sell": "marketplace",
};

/**
 * Per-category RSS for syndication: the newest businesses, the member listings
 * posted under the category and its upcoming events, so a quiet category still
 * has something to publish.
 */
export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const category = await getCategory(params.slug);
  if (!category) return new Response("Not found", { status: 404 });

  const scope = categoryScopeSlugs(category);
  const section =
    LISTING_SECTIONS[category.slug] ??
    (category.parent ? LISTING_SECTIONS[category.parent.slug] : undefined);

  const [businesses, events, listings] = await Promise.all([
    db.business.findMany({
      where: {
        status: "APPROVED",
        OR: [
          { categorySlug: { in: scope } },
          { subcategorySlug: { in: scope } },
          { extraCategorySlugs: { hasSome: scope } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        slug: true,
        name: true,
        description: true,
        city: true,
        state: true,
        logoUrl: true,
        createdAt: true,
      },
    }),
    db.event.findMany({
      where: {
        status: "APPROVED",
        startsAt: { gte: new Date() },
        OR: [{ categorySlug: { in: scope } }, { categorySlugs: { hasSome: scope } }],
      },
      orderBy: { startsAt: "asc" },
      take: 10,
      select: {
        slug: true,
        title: true,
        description: true,
        imageUrl: true,
        startsAt: true,
        createdAt: true,
        venue: true,
        city: true,
      },
    }),
    section
      ? db.listing.findMany({
          where: listingWhere(section, {
            // A Buy & sell subcategory feed carries only that subcategory.
            category:
              section === "marketplace" && category.parent
                ? category.slug
                : undefined,
          }),
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            slug: true,
            title: true,
            description: true,
            city: true,
            kind: true,
            createdAt: true,
            images: {
              orderBy: { sortOrder: "asc" },
              take: 1,
              select: { url: true },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  const items: RssItem[] = [
    ...businesses.map((business) => ({
      title: business.name,
      link: `/b/${business.slug}`,
      description: [
        [business.city, business.state].filter(Boolean).join(", "),
        business.description ?? "",
      ]
        .filter(Boolean)
        .join(" — "),
      publishedAt: business.createdAt,
      imageUrl: business.logoUrl,
      category: category.name,
    })),
    ...listings.map((listing) => ({
      title: `${listing.title} — ${listing.city}`,
      link: `/listings/${listing.slug}`,
      description: listing.description,
      publishedAt: listing.createdAt,
      imageUrl: listing.images[0]?.url,
      category: KIND_LABELS[listing.kind],
    })),
    ...events.map((event) => ({
      title: `${event.title} — ${event.startsAt.toDateString()}, ${event.city}`,
      link: `/events/${event.slug}`,
      description: `${event.venue}, ${event.city}. ${event.description}`,
      publishedAt: event.createdAt,
      imageUrl: event.imageUrl,
      category: "Events",
    })),
  ].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  return rssResponse({
    title: `${category.name} on Godesi`,
    description:
      category.blurb ??
      `Newest ${category.name} businesses, listings and events on Godesi.`,
    path: `/categories/${category.slug}`,
    items,
  });
}
