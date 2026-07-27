import type { PointsReason } from "@prisma/client";
import { db } from "@/lib/db";

/** Published reward table — kept here so the UI and the ledger cannot drift. */
export const POINTS: Record<Exclude<PointsReason, "REDEMPTION" | "ADJUSTMENT">, number> = {
  REFERRAL_SIGNUP: 10,
  PROFILE_CREATED: 20,
  PAID_UPGRADE: 100,
  LISTING_POSTED: 15,
};

export const REWARDS = [
  { key: "banner", label: "300 × 250 sidebar banner for a month", points: 500 },
  { key: "featured-listing", label: "Featured listing for 30 days", points: 300 },
  { key: "promote-event", label: "Promote an event on the homepage", points: 250 },
  { key: "pro-month", label: "One month of Pro membership", points: 400 },
] as const;

export function rewardFor(key: string) {
  return REWARDS.find((reward) => reward.key === key) ?? null;
}

/**
 * Credits points. `once` makes the award idempotent per user and reason, which
 * is what stops a repeated profile save from farming points.
 */
export async function awardPoints({
  userId,
  reason,
  note,
  once = false,
  points,
}: {
  userId: string;
  reason: PointsReason;
  note?: string;
  once?: boolean;
  points?: number;
}) {
  const value =
    points ?? (reason in POINTS ? POINTS[reason as keyof typeof POINTS] : 0);
  if (!value) return null;

  const uniqueKey = once ? `${userId}:${reason}` : null;
  if (uniqueKey) {
    const existing = await db.pointsEntry.findUnique({ where: { uniqueKey } });
    if (existing) return existing;
  }

  return db.pointsEntry.create({
    data: { userId, points: value, reason, note: note ?? null, uniqueKey },
  });
}

export type Wallet = { earned: number; used: number; balance: number };

export async function wallet(userId: string): Promise<Wallet> {
  const entries = await db.pointsEntry.findMany({
    where: { userId },
    select: { points: true },
  });
  const earned = entries.reduce((sum, entry) => sum + Math.max(entry.points, 0), 0);
  const used = entries.reduce((sum, entry) => sum + Math.min(entry.points, 0), 0);
  return { earned, used: Math.abs(used), balance: earned + used };
}

/** Referral funnel numbers for the rewards dashboard. */
export async function referralStats(userId: string) {
  const [referrals, converted] = await Promise.all([
    db.user.count({ where: { referredById: userId } }),
    db.user.count({ where: { referredById: userId, plan: { not: "FREE" } } }),
  ]);
  return {
    referrals,
    converted,
    conversionRate: referrals ? Math.round((converted / referrals) * 100) : 0,
  };
}
