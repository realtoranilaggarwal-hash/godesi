import type { Prisma } from "@prisma/client";
import { siteUrl } from "@/lib/format";
import { maskContactDetails } from "@/lib/moderation";
import { effectivePlan } from "@/lib/plans";

/** Every real estate agent, broker or property dealer card on Godesi. */
export const REAL_ESTATE_AGENT_WHERE: Prisma.BusinessWhereInput = {
  status: "APPROVED",
  OR: [
    { subcategorySlug: "real-estate-property-dealers" },
    { category: "real-estate", subcategorySlug: null },
    { category: "Real Estate Agents" },
  ],
};

export const AGENT_SELECT = {
  slug: true,
  name: true,
  profileType: true,
  city: true,
  state: true,
  country: true,
  description: true,
  logoUrl: true,
  websiteUrl: true,
  whatsappNumber: true,
  phone: true,
  publicEmail: true,
  hideContact: true,
  zillowUrl: true,
  realtorUrl: true,
  homesUrl: true,
  specialties: true,
  certifications: true,
  licenseNumber: true,
  verifiedProvider: true,
  yearsExperience: true,
  featuredRank: true,
  featuredUntil: true,
  updatedAt: true,
  ownerId: true,
  owner: { select: { plan: true, planExpiresAt: true } },
} satisfies Prisma.BusinessSelect;

type AgentRow = Prisma.BusinessGetPayload<{ select: typeof AGENT_SELECT }>;

/**
 * The public face of an agent card, with the same contact rule as /b/[slug]:
 * phone and email only on paid cards whose owner left them on.
 */
export function agentJson(agent: AgentRow, ref?: string) {
  const paid = agent.owner !== null && effectivePlan(agent.owner) !== "FREE";
  const contact = paid && !agent.hideContact;
  const featured =
    agent.featuredRank > 0 &&
    (!agent.featuredUntil || agent.featuredUntil > new Date());
  const query = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  return {
    slug: agent.slug,
    name: agent.name,
    kind: agent.profileType === "PROFESSIONAL" ? "agent" : "brokerage",
    city: agent.city,
    state: agent.state,
    country: agent.country,
    description: agent.description
      ? contact
        ? agent.description
        : maskContactDetails(agent.description)
      : null,
    logoUrl: agent.logoUrl,
    websiteUrl: agent.websiteUrl,
    whatsappNumber: agent.whatsappNumber,
    phone: contact ? agent.phone : null,
    email: contact ? agent.publicEmail : null,
    zillowUrl: agent.zillowUrl,
    realtorUrl: agent.realtorUrl,
    homesUrl: agent.homesUrl,
    specialties: agent.specialties,
    certifications: agent.certifications,
    licenseNumber: agent.licenseNumber,
    yearsExperience: agent.yearsExperience,
    claimed: agent.ownerId !== null,
    verified: agent.verifiedProvider,
    featured,
    updatedAt: agent.updatedAt.toISOString(),
    godesiUrl: `${siteUrl()}/b/${agent.slug}${query}`,
  };
}

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
