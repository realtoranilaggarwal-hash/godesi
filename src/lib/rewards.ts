import type { Plan, PointsReason } from "@prisma/client";
import { db } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { convert, getRates } from "@/lib/rates";
import { effectivePlan } from "@/lib/plans";

export type EarnReason = Exclude<PointsReason, "REDEMPTION" | "ADJUSTMENT">;

/** Published reward table — admins can override any value in `RewardSetting`. */
export const POINTS: Record<EarnReason, number> = {
  REFERRAL_SIGNUP: 5,
  PROFILE_CREATED: 20,
  PAID_UPGRADE: 100,
  LISTING_POSTED: 2,
  REVIEW_POSTED: 1,
  /// One point per US dollar, so the value comes from the payment itself.
  PAYMENT_SPEND: 0,
  REFERRAL_PROFILE: 20,
  REFERRAL_UPGRADE: 100,
  REFERRAL_LISTING: 15,
  NEWS_PUBLISHED: 10,
  NEWS_UPVOTED: 5,
  NEWS_FEATURED: 25,
  JOURNALIST_LEVEL: 50,
  FOUNDING_MEMBER: 50,
  /// Paid as a copy of whatever the member just earned, so it has no fixed value.
  FOUNDING_BONUS: 0,
};

export const REASON_LABELS: Record<PointsReason, string> = {
  REFERRAL_SIGNUP: "A friend signed up with your link",
  PROFILE_CREATED: "You completed your business profile",
  PAID_UPGRADE: "You upgraded to a paid plan",
  LISTING_POSTED: "You posted a listing or event",
  REFERRAL_PROFILE: "Your referral completed their profile",
  REFERRAL_UPGRADE: "Your referral upgraded to a paid plan",
  REFERRAL_LISTING: "Your referral posted a listing or event",
  NEWS_PUBLISHED: "Your news story was approved",
  NEWS_UPVOTED: "Your news story is popular with members",
  NEWS_FEATURED: "Your story was picked as important news",
  JOURNALIST_LEVEL: "You reached a new local journalist level",
  FOUNDING_MEMBER: "Welcome, founding member 🏅",
  FOUNDING_BONUS: "Founding member bonus — double points 🏅",
  REVIEW_POSTED: "You reviewed a business",
  PAYMENT_SPEND: "Points for money spent with Godesi",
  REDEMPTION: "Points redeemed",
  ADJUSTMENT: "Adjusted by the Godesi team",
};

/** What the inviter earns when their referral does something. */
const REFERRAL_BONUS: Partial<Record<PointsReason, EarnReason>> = {
  PROFILE_CREATED: "REFERRAL_PROFILE",
  PAID_UPGRADE: "REFERRAL_UPGRADE",
  LISTING_POSTED: "REFERRAL_LISTING",
};

export const REWARDS = [
  {
    key: "banner",
    label: "300 × 250 sidebar banner for a month",
    points: 500,
    auto: false,
  },
  {
    key: "featured-listing",
    label: "Featured listing for 30 days",
    points: 300,
    auto: true,
  },
  {
    key: "promote-event",
    label: "Promote an event on the homepage",
    points: 250,
    auto: false,
  },
  { key: "pro-month", label: "One month of Pro membership", points: 400, auto: true },
] as const;

/** Points it costs to unlock one requirement's contact details. */
export const UNLOCK_LEAD_POINTS = 60;

/**
 * One point per US dollar spent. Amounts arrive in the payment currency's minor
 * unit, so they are converted through the live rate table first.
 */
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

/**
 * Debits points for something bought with them. Returns null when the member
 * cannot afford it, or when this exact purchase was already paid for.
 */
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

/**
 * How much a member has given the community, as a 0–100 bar. 1000 lifetime
 * points is a full bar, which keeps early contributors visibly moving.
 */
export function contributionBar(earned: number) {
  return Math.max(2, Math.min(100, Math.round((earned / 1000) * 100)));
}

export type Contributor = {
  id: string;
  name: string;
  username: string | null;
  location: string | null;
  avatarUrl: string | null;
  plan: Plan;
  points: number;
};

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

export function rewardFor(key: string) {
  return REWARDS.find((reward) => reward.key === key) ?? null;
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

/**
 * Credits points, notifies the member, and pays the inviter their referral
 * bonus. `once` makes the award idempotent per user and reason, which is what
 * stops a repeated profile save from farming points.
 */
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

  const uniqueKey = key ? `${userId}:${reason}:${key}` : once ? `${userId}:${reason}` : null;
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
    where: { userId, reason: { in: ["PROFILE_CREATED", "PAID_UPGRADE", "LISTING_POSTED"] } },
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
