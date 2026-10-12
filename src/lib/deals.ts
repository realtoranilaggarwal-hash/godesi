import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { effectivePlan } from "@/lib/plans";
import { maskContactDetails } from "@/lib/moderation";

export { endOfDay, expiryLabel, MAX_ACTIVE_DEALS } from "@/lib/dealFormat";

/** Switched on and not past its last day. */
export function liveDealWhere(now = new Date()): Prisma.DealWhereInput {
  return {
    active: true,
    OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
  };
}

export const dealSelect = {
  id: true,
  title: true,
  details: true,
  code: true,
  linkUrl: true,
  expiresAt: true,
  createdAt: true,
  business: {
    select: {
      slug: true,
      name: true,
      city: true,
      logoUrl: true,
      categorySlug: true,
      categoryRef: { select: { name: true, icon: true } },
      subcategoryRef: { select: { name: true } },
      owner: { select: { plan: true, planExpiresAt: true } },
    },
  },
} satisfies Prisma.DealSelect;

export type PublicDeal = Prisma.DealGetPayload<{ select: typeof dealSelect }>;

/** Free cards agreed to WhatsApp-only contact, so numbers in the text are masked. */
export function dealDetails(deal: PublicDeal) {
  if (!deal.details) return null;
  const owner = deal.business.owner;
  return owner && effectivePlan(owner) !== "FREE"
    ? deal.details
    : maskContactDetails(deal.details);
}

export async function liveDeals({
  categorySlug,
  take = 60,
}: { categorySlug?: string; take?: number } = {}) {
  return db.deal.findMany({
    where: {
      ...liveDealWhere(),
      business: {
        status: "APPROVED",
        ...(categorySlug ? { categorySlug } : {}),
      },
    },
    orderBy: { createdAt: "desc" },
    take,
    select: dealSelect,
  });
}
