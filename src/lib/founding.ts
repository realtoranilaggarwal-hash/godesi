import { db } from "@/lib/db";
import { awardPoints, POINTS } from "@/lib/rewards";

/** How many members get the 🏅 Founding member badge. */
export const FOUNDING_LIMIT = 1000;

/** Extra points a founding member gets simply for joining early. */
export const FOUNDING_WELCOME_POINTS = POINTS.FOUNDING_MEMBER;

/** Free featured placement a founding member can switch on, in days. */
export const FOUNDING_FEATURE_DAYS = 90;

export const FOUNDING_PERKS = [
  "🏅 Permanent Founding member badge on your profile, card and listings",
  "Double reward points on everything you post and every friend you invite",
  `${FOUNDING_WELCOME_POINTS} welcome points the moment you join`,
  "Founding members are shown first when listings rank equally",
  "No weekly cap — post as many news reports and classifieds as you like",
  `${FOUNDING_FEATURE_DAYS} days of featured placement for your card, listings and ads — free`,
];

export function isFoundingMember(user: { foundingNumber: number | null }) {
  return user.foundingNumber !== null;
}

/** True while the member's free featured run is still going. */
export function foundingFeatureActive(user: {
  foundingFeatureUntil: Date | null;
}) {
  return (
    user.foundingFeatureUntil !== null &&
    user.foundingFeatureUntil.getTime() > Date.now()
  );
}

/**
 * Switches on the free featured run and lifts everything the member has already
 * posted into the featured slots. Claimable once.
 */
export async function claimFoundingFeature(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { foundingNumber: true, foundingFeatureUntil: true },
  });
  if (!user || user.foundingNumber === null) return null;
  if (user.foundingFeatureUntil !== null) return user.foundingFeatureUntil;

  const until = new Date(
    Date.now() + FOUNDING_FEATURE_DAYS * 24 * 60 * 60 * 1000,
  );

  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { foundingFeatureUntil: until },
    }),
    db.business.updateMany({ where: { ownerId: userId }, data: { featured: true } }),
    db.listing.updateMany({ where: { ownerId: userId }, data: { featured: true } }),
  ]);

  return until;
}

/** Daily sweep: takes the free featuring back off once the 90 days are up. */
export async function expireFoundingFeatures() {
  const expired = await db.user.findMany({
    where: { foundingFeatureUntil: { lt: new Date() } },
    select: { id: true, plan: true, planExpiresAt: true },
  });
  if (!expired.length) return 0;

  // Paid members keep the featuring they are paying for.
  const ids = expired
    .filter(
      (row) =>
        row.plan === "FREE" ||
        !row.planExpiresAt ||
        row.planExpiresAt.getTime() < Date.now(),
    )
    .map((row) => row.id);

  await db.$transaction([
    db.business.updateMany({
      where: { ownerId: { in: ids } },
      data: { featured: false },
    }),
    db.listing.updateMany({
      where: { ownerId: { in: ids } },
      data: { featured: false },
    }),
    db.user.updateMany({
      where: { id: { in: expired.map((row) => row.id) } },
      data: { foundingFeatureUntil: null },
    }),
  ]);

  return expired.length;
}

export async function foundingSpotsLeft() {
  const taken = await db.user.count({ where: { foundingNumber: { not: null } } });
  return Math.max(0, FOUNDING_LIMIT - taken);
}

/** Claims a seat for a brand new member and pays the welcome points. */
export async function welcomeFoundingMember(userId: string) {
  const seat = await claimFoundingSeat(userId);
  if (seat === null) return null;

  await awardPoints({
    userId,
    reason: "FOUNDING_MEMBER",
    note: `Founding member #${seat} of ${FOUNDING_LIMIT}`,
    once: true,
  });
  return seat;
}

/**
 * Gives a new member the next founding seat while spots remain. Seats are
 * numbered by join order; a unique index means a race can only lose the seat,
 * never duplicate it.
 */
export async function claimFoundingSeat(userId: string) {
  const highest = await db.user.findFirst({
    where: { foundingNumber: { not: null } },
    orderBy: { foundingNumber: "desc" },
    select: { foundingNumber: true },
  });

  const seat = (highest?.foundingNumber ?? 0) + 1;
  if (seat > FOUNDING_LIMIT) return null;

  try {
    const user = await db.user.update({
      where: { id: userId },
      data: { foundingNumber: seat },
      select: { foundingNumber: true },
    });
    return user.foundingNumber;
  } catch {
    return null;
  }
}
