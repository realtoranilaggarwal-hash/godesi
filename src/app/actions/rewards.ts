"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { rewardFor, wallet } from "@/lib/rewards";
import { type ActionState, fieldError } from "@/lib/actions";

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
        data: { userId: user.id, reward: reward.label, points: reward.points },
      }),
    ]);

    revalidatePath("/dashboard/rewards");
    return {
      success: `Redeemed ${reward.points} points — our team will set up "${reward.label}" within 24 hours.`,
    };
  } catch (error) {
    return fieldError(error);
  }
}
