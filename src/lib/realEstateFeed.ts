import type { Prisma } from "@prisma/client";
import { siteUrl } from "@/lib/format";
import { maskContactDetails } from "@/lib/moderation";

export { AGENT_SELECT, agentJson } from "@/lib/agentFeed";

/** Every real estate agent, broker or property dealer card on Godesi. */
export const REAL_ESTATE_AGENT_WHERE: Prisma.BusinessWhereInput = {
  status: "APPROVED",
  OR: [
    { subcategorySlug: "real-estate-property-dealers" },
    { category: "real-estate", subcategorySlug: null },
    { category: "Real Estate Agents" },
  ],
};

export const PROPERTY_WHERE: Prisma.ListingWhereInput = {
  status: "APPROVED",
  kind: { in: ["PROPERTY_SALE", "PROPERTY_RENT"] },
};

export const PROPERTY_INCLUDE = {
  images: { orderBy: { sortOrder: "asc" }, select: { url: true } },
} satisfies Prisma.ListingInclude;

type PropertyRow = Prisma.ListingGetPayload<{
  include: typeof PROPERTY_INCLUDE;
}>;

export function propertyJson(listing: PropertyRow, ref?: string) {
  const query = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  return {
    slug: listing.slug,
    kind: listing.kind === "PROPERTY_RENT" ? "rent" : "sale",
    title: listing.title,
    description: maskContactDetails(listing.description),
    city: listing.city,
    area: listing.area,
    state: listing.state,
    country: listing.country,
    price: listing.price,
    currency: listing.currency,
    perMonth: listing.perMonth,
    propertyType: listing.propertyType,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    builtUpArea: listing.builtUpArea,
    images: listing.images.map((image) => image.url),
    createdAt: listing.createdAt.toISOString(),
    godesiUrl: `${siteUrl()}/listings/${listing.slug}${query}`,
  };
}
