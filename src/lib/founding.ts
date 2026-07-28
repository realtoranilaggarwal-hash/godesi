import { db } from "@/lib/db";
import { awardPoints } from "@/lib/rewards";

/** How many members get the 🏅 Founding member badge. */
export const FOUNDING_LIMIT = 1000;

/** Extra points a founding member gets simply for joining early. */
export const FOUNDING_WELCOME_POINTS = 50;

export const FOUNDING_PERKS = [
  "🏅 Permanent Founding member badge on your profile, card and listings",
  "Double reward points on everything you post and every friend you invite",
  `${FOUNDING_WELCOME_POINTS} welcome points the moment you join`,
  "Founding members are shown first when listings rank equally",
];

export function isFoundingMember(user: { foundingNumber: number | null }) {
  return user.foundingNumber !== null;
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
