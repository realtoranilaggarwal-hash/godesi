import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { awardPoints } from "@/lib/rewards";

export const REFERRAL_COOKIE = "godesi_ref";

/**
 * Links a brand-new account to whoever invited it and credits the referrer.
 * Self-referrals and already-linked accounts are ignored, and the cookie is
 * cleared so one invite can only ever pay out once.
 */
export async function creditReferral(newUserId: string) {
  const jar = cookies();
  const username = jar.get(REFERRAL_COOKIE)?.value;
  if (!username) return;

  jar.delete(REFERRAL_COOKIE);

  const referrer = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (!referrer || referrer.id === newUserId) return;

  const updated = await db.user.updateMany({
    where: { id: newUserId, referredById: null },
    data: { referredById: referrer.id },
  });
  if (updated.count === 0) return;

  await awardPoints({
    userId: referrer.id,
    reason: "REFERRAL_SIGNUP",
    note: `Referred a new member`,
  });
}
