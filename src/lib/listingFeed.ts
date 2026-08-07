import { db } from "@/lib/db";
import { KIND_LABELS, listingWhere, type ListingSection } from "@/lib/listings";
import { rssResponse } from "@/lib/rss";

const FEEDS: Record<
  ListingSection,
  { path: string; title: string; description: string }
> = {
  "real-estate": {
    path: "/real-estate",
    title: "Godesi property — homes for sale and rent",
    description:
      "Homes, flats and plots posted by desi families and agents on Godesi — for sale and for rent, with WhatsApp contact.",
  },
  rooms: {
    path: "/rooms",
    title: "Godesi rooms and roommates",
    description:
      "Rooms to share and roommate wanted posts from the desi community on Godesi.",
  },
  marketplace: {
    path: "/marketplace",
    title: "Godesi buy & sell",
    description:
      "Jewellery, ethnic wear, furniture, electronics, homemade food and more, sold by desi families on Godesi.",
  },
};

/** One RSS route body for /real-estate, /rooms and /marketplace. */
export async function listingFeed(section: ListingSection, request: Request) {
  const params = new URL(request.url).searchParams;
  const feed = FEEDS[section];

  const listings = await db.listing.findMany({
    where: listingWhere(section, {
      city: params.get("city") ?? undefined,
      category: params.get("category") ?? undefined,
    }),
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      slug: true,
      title: true,
      description: true,
      city: true,
      area: true,
      kind: true,
      createdAt: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
    },
  });

  return rssResponse({
    title: feed.title,
    description: feed.description,
    path: feed.path,
    items: listings.map((listing) => ({
      title: `${listing.title} — ${[listing.area, listing.city]
        .filter(Boolean)
        .join(", ")}`,
      link: `/listings/${listing.slug}`,
      description: listing.description,
      publishedAt: listing.createdAt,
      imageUrl: listing.images[0]?.url,
      category: KIND_LABELS[listing.kind],
    })),
  });
}
