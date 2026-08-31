"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { rewardFor } from "@/lib/rewards";
import { wallet } from "@/lib/rewardsQueries";
import { notify } from "@/lib/notifications";
import { type ActionState, fieldError } from "@/lib/actions";

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Applies the reward straight away where we can (membership, featured listing);
 * anything needing artwork or scheduling is left for the team to fulfil.
 */
async function applyReward(key: string, userId: string) {
  if (key === "pro-month") {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { plan: true, planExpiresAt: true },
    });
    const from =
      user?.planExpiresAt && user.planExpiresAt > new Date()
        ? user.planExpiresAt.getTime()
        : Date.now();
    await db.user.update({
      where: { id: userId },
      data: {
        plan: user?.plan === "PREMIUM" ? "PREMIUM" : "PRO",
        planExpiresAt: new Date(from + MONTH_MS),
      },
    });
    return true;
  }

  if (key === "featured-listing") {
    const business = await db.business.findUnique({
      where: { ownerId: userId },
    });
    if (!business) return false;
    await db.business.update({
      where: { id: business.id },
      data: { featured: true },
    });
    return true;
  }

  return false;
}

export async function redeemPointsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const reward = rewardFor(String(formData.get("reward") ?? ""));
    if (!reward) return { error: "Pick a reward to redeem." };

    const balance = (await wallet(user.id)).balance;
    if (balance < reward.points) {
      return {
        error: `You need ${reward.points - balance} more points for this reward.`,
      };
    }

    if (reward.key === "featured-listing") {
      const business = await db.business.findUnique({
        where: { ownerId: user.id },
        select: { id: true },
      });
      if (!business) {
        return { error: "Create your business card first, then feature it." };
      }
    }

    const applied = await applyReward(reward.key, user.id);

    await db.$transaction([
      db.pointsEntry.create({
        data: {
          userId: user.id,
          points: -reward.points,
          reason: "REDEMPTION",
          note: reward.label,
        },
      }),
      db.redemption.create({
        data: {
          userId: user.id,
          reward: reward.label,
          points: reward.points,
          status: applied ? "FULFILLED" : "REQUESTED",
        },
      }),
    ]);

    await notify({
      userId: user.id,
      title: `${reward.points} points redeemed`,
      body: applied
        ? `${reward.label} is active now.`
        : `${reward.label} — our team will set this up within 24 hours.`,
      href: "/dashboard/rewards",
    });

    revalidatePath("/dashboard/rewards");
    revalidatePath("/dashboard");
    return {
      success: applied
        ? `Done — "${reward.label}" is active on your account.`
        : `Redeemed ${reward.points} points — our team will set up "${reward.label}" within 24 hours.`,
    };
  } catch (error) {
    return fieldError(error);
  }
}

export async function markNotificationsReadAction() {
  const user = await requireUser();
  await db.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
}

/** Weekly digest on or off, from the member's notifications page. */
export async function setDigestAction(formData: FormData) {
  const user = await requireUser();
  const on = formData.get("on") === "yes";
  await db.user.update({
    where: { id: user.id },
    data: { digestOptOutAt: on ? null : new Date() },
  });
  revalidatePath("/dashboard/notifications");
}
