import type { Prisma } from "@prisma/client";
import { siteUrl } from "@/lib/format";
import { maskContactDetails } from "@/lib/moderation";
import { effectivePlan } from "@/lib/plans";

/** Fields the public agent feeds expose, shared by every directory feed. */
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

export type AgentRow = Prisma.BusinessGetPayload<{
  select: typeof AGENT_SELECT;
}>;

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
