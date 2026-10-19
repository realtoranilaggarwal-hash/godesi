import type { GiftClaim, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/** Points a scratch card costs; staff can override it with RewardSetting "SCRATCH_COST". */
export const SCRATCH_COST = 20;
/** Cards a member may scratch per GoDesi day. */
export const SCRATCH_DAILY_LIMIT = 5;

export const GIFT_CLAIM_LABELS: Record<GiftClaim, string> = {
  VISIT_STORE: "Visit the store and show your code",
  VISIT_WEBSITE: "Visit their website and quote your code",
  POST_REVIEW: "Post a review of the business on GoDesi",
};

/** Odds out of 100; a gift slot falls back to points when no vendor gift is left. */
export const SCRATCH_ODDS = [
  { prize: "gift", points: 0, weight: 15 },
  { prize: "points", points: 50, weight: 3 },
  { prize: "points", points: 30, weight: 10 },
  { prize: "points", points: 10, weight: 25 },
  { prize: "none", points: 0, weight: 47 },
] as const;

export const SCRATCH_TOTAL = SCRATCH_ODDS.reduce(
  (sum, row) => sum + row.weight,
  0,
);

export function oddsForRoll(roll: number) {
  let left = roll;
  for (const row of SCRATCH_ODDS) {
    if (left < row.weight) return row;
    left -= row.weight;
  }
  return SCRATCH_ODDS[SCRATCH_ODDS.length - 1];
}

export async function scratchCost() {
  const row = await db.rewardSetting.findUnique({
    where: { key: "SCRATCH_COST" },
  });
  return row?.points ?? SCRATCH_COST;
}

export function liveGiftWhere(now = new Date()): Prisma.ScratchGiftWhereInput {
  return {
    active: true,
    OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
  };
}

export const giftSelect = {
  id: true,
  title: true,
  details: true,
  claimHow: true,
  quantity: true,
  wonCount: true,
  expiresAt: true,
  business: {
    select: {
      slug: true,
      name: true,
      city: true,
      address: true,
      websiteUrl: true,
      logoUrl: true,
    },
  },
} satisfies Prisma.ScratchGiftSelect;
