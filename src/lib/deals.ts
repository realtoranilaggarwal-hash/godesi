import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { effectivePlan } from "@/lib/plans";
import { maskContactDetails } from "@/lib/moderation";

export const MAX_ACTIVE_DEALS = 5;

/** Switched on and not past its last day. */
export function liveDealWhere(now = new Date()): Prisma.DealWhereInput {
  return {
    active: true,
    OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
  };
}

/** Expiry is the last valid day, so the offer runs to the end of it. */
export function endOfDay(date: string) {
  return new Date(`${date}T23:59:59.999Z`);
}

export function expiryLabel(expiresAt: Date | null) {
  if (!expiresAt) return null;
  return `Ends ${expiresAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })}`;
}

const dealSelect = {
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
