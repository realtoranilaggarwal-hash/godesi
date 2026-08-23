import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { awardPoints } from "@/lib/rewardsQueries";
import { notify } from "@/lib/notifications";

export const REFERRAL_COOKIE = "godesi_ref";

function signupFingerprint() {
  const store = headers();
  const forwarded = store.get("x-forwarded-for") ?? "";
  return {
    ip: forwarded.split(",")[0].trim() || store.get("x-real-ip") || null,
    userAgent: store.get("user-agent")?.slice(0, 255) ?? null,
  };
}

/**
 * Flags signups that look like the inviter farming their own link: same device
 * fingerprint as an earlier referral, or an inviter who signed up from that IP.
 */
async function suspicionReason(referrerId: string, ip: string | null) {
  if (!ip) return null;

  const [sameIpFromInviter, sameIpReferral] = await Promise.all([
    db.referral.findFirst({ where: { userId: referrerId, ip } }),
    db.referral.findFirst({ where: { referrerId, ip } }),
  ]);

  if (sameIpFromInviter) return "Signed up from the same IP as the inviter";
  if (sameIpReferral) return "Another referral already came from this IP";
  return null;
}

/**
 * Links a brand-new account to whoever invited it and credits the referrer.
 * Self-referrals and already-linked accounts are ignored, and the cookie is
 * cleared so one invite can only ever pay out once. Suspicious signups are
 * recorded as PENDING and pay nothing until an admin approves them.
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

  const { ip, userAgent } = signupFingerprint();
  const flagReason = await suspicionReason(referrer.id, ip);

  const referral = await db.referral.create({
    data: {
      referrerId: referrer.id,
      userId: newUserId,
      ip,
      userAgent,
      status: flagReason ? "PENDING" : "APPROVED",
      flagReason,
    },
  });

  if (flagReason) {
    await notify({
      userId: referrer.id,
      title: "A referral is under review",
      body: "We check unusual signups before releasing points. This usually takes a day.",
      href: "/dashboard/rewards",
    });
    return;
  }

  await notify({
    userId: referrer.id,
    title: "Your referral joined Godesi 🎉",
    href: "/dashboard/rewards",
  });
  await awardPoints({
    userId: referrer.id,
    reason: "REFERRAL_SIGNUP",
    note: "Referred a new member",
    skipReferralBonus: true,
    referralId: referral.id,
  });
}
