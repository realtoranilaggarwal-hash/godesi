/**
 * The database half of rewards.ts — the points table and labels next door are safe for client components, but a module that touches Prisma cannot be bundled for the browser.
 */

import type { PointsReason } from "@prisma/client";
import { db } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { convert, getRates } from "@/lib/rates";
import { effectivePlan } from "@/lib/plans";
import {
  Contributor,
  EarnReason,
  POINTS,
  REASON_LABELS,
  Wallet,
} from "@/lib/rewards";

/** What the inviter earns when their referral does something. */
const REFERRAL_BONUS: Partial<Record<PointsReason, EarnReason>> = {
  PROFILE_CREATED: "REFERRAL_PROFILE",
  PAID_UPGRADE: "REFERRAL_UPGRADE",
  LISTING_POSTED: "REFERRAL_LISTING",
};

export async function awardSpendPoints({
  userId,
  amountMinor,
  currency,
  note,
  reference,
}: {
  userId: string;
  amountMinor: number;
  currency: string;
  note: string;
  /** Provider payment id, so the same payment can never be credited twice. */
  reference: string;
}) {
  if (amountMinor <= 0) return null;
  const rates = await getRates();
  const usd = convert(amountMinor / 100, currency, "USD", rates);
  const points = Math.floor(usd ?? 0);
  if (points < 1) return null;

  return awardPoints({
    userId,
    reason: "PAYMENT_SPEND",
    points,
    note,
    key: reference,
    skipReferralBonus: true,
  });
}

export async function spendPoints({
  userId,
  points,
  note,
  uniqueKey,
}: {
  userId: string;
  points: number;
  note: string;
  uniqueKey?: string;
}) {
  if (uniqueKey) {
    const existing = await db.pointsEntry.findUnique({ where: { uniqueKey } });
    if (existing) return existing;
  }
  const balance = (await wallet(userId)).balance;
  if (balance < points) return null;

  const entry = await db.pointsEntry.create({
    data: {
      userId,
      points: -points,
      reason: "REDEMPTION",
      note,
      uniqueKey: uniqueKey ?? null,
    },
  });
  await notify({
    userId,
    title: `${points} points spent`,
    body: note,
    href: "/dashboard/rewards",
  });
  return entry;
}

/** Top contributors by lifetime points earned, ignoring anything they spent. */
export async function topContributors(take = 25): Promise<Contributor[]> {
  const rows = await db.pointsEntry.groupBy({
    by: ["userId"],
    where: { points: { gt: 0 } },
    _sum: { points: true },
    orderBy: { _sum: { points: "desc" } },
    take,
  });
  if (!rows.length) return [];

  const users = await db.user.findMany({
    where: { id: { in: rows.map((row) => row.userId) } },
    select: {
      id: true,
      name: true,
      username: true,
      location: true,
      avatarUrl: true,
      plan: true,
      planExpiresAt: true,
    },
  });

  return rows
    .map((row) => {
      const user = users.find((item) => item.id === row.userId);
      if (!user) return null;
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        location: user.location,
        avatarUrl: user.avatarUrl,
        plan: effectivePlan(user),
        points: row._sum.points ?? 0,
      };
    })
    .filter((row): row is Contributor => row !== null);
}

/** Live point values: admin overrides on top of the published defaults. */
export async function pointValues(): Promise<Record<EarnReason, number>> {
  const overrides = await db.rewardSetting.findMany();
  const values = { ...POINTS };
  for (const row of overrides) {
    if (row.key in values) values[row.key as EarnReason] = row.points;
  }
  return values;
}

export async function pointsFor(reason: EarnReason) {
  const row = await db.rewardSetting.findUnique({ where: { key: reason } });
  return row?.points ?? POINTS[reason];
}

export async function awardPoints({
  userId,
  reason,
  note,
  once = false,
  key,
  points,
  skipReferralBonus = false,
  referralId,
}: {
  userId: string;
  reason: PointsReason;
  note?: string;
  once?: boolean;
  /** Pays at most once for this exact thing, e.g. one story reaching 5 upvotes. */
  key?: string;
  points?: number;
  skipReferralBonus?: boolean;
  /** Links inviter bonuses to the referral that produced them. */
  referralId?: string;
}) {
  const value =
    points ?? (reason in POINTS ? await pointsFor(reason as EarnReason) : 0);
  if (!value) return null;

  const uniqueKey = key
    ? `${userId}:${reason}:${key}`
    : once
      ? `${userId}:${reason}`
      : null;
  if (uniqueKey) {
    const existing = await db.pointsEntry.findUnique({ where: { uniqueKey } });
    if (existing) return existing;
  }

  const entry = await db.pointsEntry.create({
    data: {
      userId,
      points: value,
      reason,
      note: note ?? null,
      uniqueKey,
      referralId: referralId ?? null,
    },
  });

  await notify({
    userId,
    title: `+${value} points`,
    body: note ?? REASON_LABELS[reason],
    href: "/dashboard/rewards",
  });

  if (!skipReferralBonus) await creditInviter(userId, reason);
  await creditFoundingBonus({ userId, reason, points: value, uniqueKey });
  return entry;
}

/** Founding members earn double, paid as a matching bonus entry. */
async function creditFoundingBonus({
  userId,
  reason,
  points,
  uniqueKey,
}: {
  userId: string;
  reason: PointsReason;
  points: number;
  uniqueKey: string | null;
}) {
  if (reason === "FOUNDING_BONUS" || reason === "FOUNDING_MEMBER") return;
  if (reason === "REDEMPTION" || reason === "ADJUSTMENT") return;

  const member = await db.user.findUnique({
    where: { id: userId },
    select: { foundingNumber: true },
  });
  if (member?.foundingNumber == null) return;

  await db.pointsEntry.create({
    data: {
      userId,
      points,
      reason: "FOUNDING_BONUS",
      note: `Founding member bonus: ${REASON_LABELS[reason].toLowerCase()}`,
      uniqueKey: uniqueKey ? `${uniqueKey}:founding` : null,
    },
  });
}

/** Pays the inviter when an approved referral hits a rewarded milestone. */
async function creditInviter(userId: string, reason: PointsReason) {
  const bonus = REFERRAL_BONUS[reason];
  if (!bonus) return;

  const referral = await db.referral.findUnique({
    where: { userId },
    include: { user: { select: { name: true } } },
  });
  if (!referral || referral.status !== "APPROVED") return;

  await awardPoints({
    userId: referral.referrerId,
    reason: bonus,
    note: `${referral.user.name}: ${REASON_LABELS[bonus].toLowerCase()}`,
    skipReferralBonus: true,
    referralId: referral.id,
  });
}

/** Pays out everything an approved referral already earned before approval. */
export async function payPendingReferralMilestones(
  userId: string,
  referrerId: string,
  referralId: string,
) {
  const done = await db.pointsEntry.findMany({
    where: {
      userId,
      reason: { in: ["PROFILE_CREATED", "PAID_UPGRADE", "LISTING_POSTED"] },
    },
    select: { reason: true },
  });
  const reasons = Array.from(new Set(done.map((entry) => entry.reason)));
  for (const reason of reasons) {
    const bonus = REFERRAL_BONUS[reason];
    if (!bonus) continue;
    await awardPoints({
      userId: referrerId,
      reason: bonus,
      note: REASON_LABELS[bonus],
      skipReferralBonus: true,
      referralId,
    });
  }
}

export async function wallet(userId: string): Promise<Wallet> {
  const entries = await db.pointsEntry.findMany({
    where: { userId },
    select: { points: true },
  });
  const earned = entries.reduce(
    (sum, entry) => sum + Math.max(entry.points, 0),
    0,
  );
  const used = entries.reduce(
    (sum, entry) => sum + Math.min(entry.points, 0),
    0,
  );
  return { earned, used: Math.abs(used), balance: earned + used };
}

/** Referral funnel numbers for the rewards dashboard. */
export async function referralStats(userId: string) {
  const [referrals, converted, pending] = await Promise.all([
    db.user.count({ where: { referredById: userId } }),
    db.user.count({ where: { referredById: userId, plan: { not: "FREE" } } }),
    db.referral.count({ where: { referrerId: userId, status: "PENDING" } }),
  ]);
  return {
    referrals,
    converted,
    pending,
    conversionRate: referrals ? Math.round((converted / referrals) * 100) : 0,
  };
}
