"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { notify } from "@/lib/notifications";
import { POINTS, type EarnReason } from "@/lib/rewards";
import {
  awardPoints,
  payPendingReferralMilestones,
} from "@/lib/rewardsQueries";

const EARN_REASONS = Object.keys(POINTS) as EarnReason[];

/** Admin override of any published point value. */
export async function setRewardPointsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireRole("ADMIN");
    let saved = 0;
    for (const reason of EARN_REASONS) {
      const raw = formData.get(reason);
      if (typeof raw !== "string" || raw.trim() === "") continue;
      const points = Number(raw);
      if (!Number.isInteger(points) || points < 0 || points > 100_000) {
        return { error: `Enter a whole number of points for ${reason}.` };
      }
      await db.rewardSetting.upsert({
        where: { key: reason },
        create: { key: reason, points },
        update: { points },
      });
      saved += 1;
    }
    revalidatePath("/admin");
    revalidatePath("/dashboard/rewards");
    return {
      success: `Updated ${saved} point value${saved === 1 ? "" : "s"}.`,
    };
  } catch (error) {
    return fieldError(error);
  }
}

const adjustSchema = z.object({
  email: z.string().trim().email("Enter the member's email"),
  points: z.coerce
    .number()
    .int("Points must be a whole number")
    .refine((value) => value !== 0, "Enter a positive or negative amount"),
  note: z.string().trim().min(3, "Add a short reason"),
});

/** Manual credit or debit, always logged in the member's ledger. */
export async function adjustUserPointsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireRole("ADMIN");
    const parsed = adjustSchema.safeParse({
      email: formData.get("email"),
      points: formData.get("points"),
      note: formData.get("note"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const user = await db.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
      select: { id: true, name: true },
    });
    if (!user) return { error: "No member with that email." };

    await db.pointsEntry.create({
      data: {
        userId: user.id,
        points: parsed.data.points,
        reason: "ADJUSTMENT",
        note: parsed.data.note,
      },
    });
    await notify({
      userId: user.id,
      title: `${parsed.data.points > 0 ? "+" : ""}${parsed.data.points} points`,
      body: parsed.data.note,
      href: "/dashboard/rewards",
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard/rewards");
    return {
      success: `${parsed.data.points > 0 ? "Credited" : "Debited"} ${user.name}.`,
    };
  } catch (error) {
    return fieldError(error);
  }
}

/** Clears or blocks a flagged referral, releasing or reversing its points. */
export async function reviewReferralAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!["APPROVED", "REJECTED"].includes(decision))
    throw new Error("Invalid decision");

  const referral = await db.referral.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  });
  if (!referral) throw new Error("Referral not found");

  if (decision === "APPROVED") {
    if (referral.status !== "APPROVED") {
      await db.referral.update({ where: { id }, data: { status: "APPROVED" } });
      await awardPoints({
        userId: referral.referrerId,
        reason: "REFERRAL_SIGNUP",
        note: `Referred ${referral.user.name} (reviewed)`,
        skipReferralBonus: true,
        referralId: referral.id,
      });
      await payPendingReferralMilestones(
        referral.userId,
        referral.referrerId,
        referral.id,
      );
    }
  } else if (referral.status !== "REJECTED") {
    const credited = await db.pointsEntry.aggregate({
      where: { referralId: referral.id },
      _sum: { points: true },
    });
    const reversal = credited._sum.points ?? 0;

    await db.$transaction([
      db.referral.update({ where: { id }, data: { status: "REJECTED" } }),
      db.user.update({
        where: { id: referral.userId },
        data: { referredById: null },
      }),
      ...(reversal > 0
        ? [
            db.pointsEntry.create({
              data: {
                userId: referral.referrerId,
                points: -reversal,
                reason: "ADJUSTMENT",
                note: "Referral rejected after review",
              },
            }),
          ]
        : []),
    ]);
    await notify({
      userId: referral.referrerId,
      title: "A referral was rejected",
      body: "It looked like a duplicate or self-referral, so the points were reversed.",
      href: "/dashboard/rewards",
    });
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard/rewards");
}

/** Marks a manual reward (banner, event promo) as done or refunds it. */
export async function reviewRedemptionAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!["FULFILLED", "REJECTED"].includes(decision))
    throw new Error("Invalid decision");

  const redemption = await db.redemption.findUnique({ where: { id } });
  if (!redemption || redemption.status !== "REQUESTED")
    throw new Error("Nothing to review");

  if (decision === "FULFILLED") {
    await db.redemption.update({
      where: { id },
      data: { status: "FULFILLED" },
    });
    await notify({
      userId: redemption.userId,
      title: "Your reward is live",
      body: redemption.reward,
      href: "/dashboard/rewards",
    });
  } else {
    await db.$transaction([
      db.redemption.update({ where: { id }, data: { status: "REJECTED" } }),
      db.pointsEntry.create({
        data: {
          userId: redemption.userId,
          points: redemption.points,
          reason: "ADJUSTMENT",
          note: `Refund: ${redemption.reward}`,
        },
      }),
    ]);
    await notify({
      userId: redemption.userId,
      title: "Reward refunded",
      body: `${redemption.points} points are back in your wallet.`,
      href: "/dashboard/rewards",
    });
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard/rewards");
}
