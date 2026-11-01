import { db } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { WEDDING_SLUG } from "@/lib/wedding";

/** The first wedding vendors to join get Premium free for a launch period. */
export const WEDDING_LAUNCH_LIMIT = 50;
export const WEDDING_LAUNCH_MONTHS = 6;

/** Every 3 wedding vendors a member brings in earns them a month of Premium. */
export const WEDDING_REFERRALS_PER_REWARD = 3;
export const WEDDING_REFERRAL_MONTHS = 1;

export async function weddingLaunchSpotsLeft() {
  const taken = await db.user.count({
    where: { weddingLaunchAt: { not: null } },
  });
  return Math.max(0, WEDDING_LAUNCH_LIMIT - taken);
}

/**
 * Adds free Premium months on top of whatever the member already has, and lifts
 * their card into the Premium slots for the same period. A paid plan with no end
 * date is left alone — it can only get shorter.
 */
export async function grantFreePremium(userId: string, months: number) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { plan: true, planExpiresAt: true },
  });
  if (!user) return null;
  if (user.plan !== "FREE" && !user.planExpiresAt) return null;

  const now = new Date();
  const paidUntil =
    user.plan !== "FREE" && user.planExpiresAt && user.planExpiresAt > now
      ? user.planExpiresAt
      : now;
  const until = new Date(paidUntil);
  until.setMonth(until.getMonth() + months);

  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { plan: "PREMIUM", planExpiresAt: until },
    }),
    db.business.updateMany({
      where: { ownerId: userId },
      data: { featured: true, featuredRank: 2, featuredUntil: until },
    }),
  ]);
  return until;
}

export type LaunchOutcome =
  | { ok: true; until: Date }
  | { ok: false; reason: "no-wedding-card" | "taken" | "full" };

/** Gives a wedding vendor one of the launch seats while any remain. */
export async function claimWeddingLaunch(userId: string): Promise<LaunchOutcome> {
  const business = await db.business.findUnique({
    where: { ownerId: userId },
    select: { categorySlug: true },
  });
  if (business?.categorySlug !== WEDDING_SLUG)
    return { ok: false, reason: "no-wedding-card" };
  if ((await weddingLaunchSpotsLeft()) <= 0) return { ok: false, reason: "full" };

  const marked = await db.user.updateMany({
    where: { id: userId, weddingLaunchAt: null },
    data: { weddingLaunchAt: new Date() },
  });
  if (marked.count === 0) return { ok: false, reason: "taken" };

  const until = await grantFreePremium(userId, WEDDING_LAUNCH_MONTHS);
  if (!until) return { ok: false, reason: "taken" };

  await notify({
    userId,
    title: `💍 Premium free for ${WEDDING_LAUNCH_MONTHS} months`,
    body: `You're one of GoDesi's first ${WEDDING_LAUNCH_LIMIT} wedding vendors. Your card is featured and you can unlock wedding requests until ${until.toDateString()}.`,
    href: "/wedding/requirements",
  });
  return { ok: true, until };
}

/**
 * Called when a member lists a wedding business: if someone referred them, count
 * the inviter's approved referrals who now run wedding cards and pay a free
 * Premium month for every full set of three.
 */
export async function rewardWeddingReferrer(newVendorId: string) {
  const vendor = await db.user.findUnique({
    where: { id: newVendorId },
    select: { referredById: true },
  });
  const referrerId = vendor?.referredById;
  if (!referrerId) return null;

  const [referrer, vendorsReferred] = await Promise.all([
    db.user.findUnique({
      where: { id: referrerId },
      select: { weddingReferralRewards: true },
    }),
    db.referral.count({
      where: {
        referrerId,
        status: "APPROVED",
        user: { business: { categorySlug: WEDDING_SLUG } },
      },
    }),
  ]);
  if (!referrer) return null;

  const earned = Math.floor(vendorsReferred / WEDDING_REFERRALS_PER_REWARD);
  const owed = earned - referrer.weddingReferralRewards;
  if (owed <= 0) return null;

  // Only the request that moves the counter pays, so a double submit can't pay twice.
  const moved = await db.user.updateMany({
    where: { id: referrerId, weddingReferralRewards: referrer.weddingReferralRewards },
    data: { weddingReferralRewards: earned },
  });
  if (moved.count === 0) return null;

  const until = await grantFreePremium(
    referrerId,
    owed * WEDDING_REFERRAL_MONTHS,
  );
  await notify({
    userId: referrerId,
    title: "🎁 Free Premium for referring wedding vendors",
    body: until
      ? `${vendorsReferred} wedding vendors joined through you. Premium is on until ${until.toDateString()}.`
      : `${vendorsReferred} wedding vendors joined through you — thank you!`,
    href: "/dashboard",
  });
  return until;
}

/** Runs both wedding perks for a member who now owns a wedding card. Never throws. */
export async function weddingVendorJoined(userId: string) {
  try {
    await claimWeddingLaunch(userId);
    await rewardWeddingReferrer(userId);
  } catch (error) {
    console.error("wedding vendor perks failed", error);
  }
}
