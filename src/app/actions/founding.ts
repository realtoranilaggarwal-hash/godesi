"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { claimFoundingFeature, FOUNDING_FEATURE_DAYS } from "@/lib/founding";
import { notify } from "@/lib/notifications";
import { type ActionState, fieldError } from "@/lib/actions";

/** Founding member switches on their free 90-day featured run. */
export async function claimFoundingFeatureAction(): Promise<ActionState> {
  try {
    const user = await requireUser();
    const until = await claimFoundingFeature(user.id);
    if (!until) {
      return { error: "Free featuring is for founding members only." };
    }

    await notify({
      userId: user.id,
      title: `Featured placement is on for ${FOUNDING_FEATURE_DAYS} days`,
      body: `Your card, listings and ads sit in the featured slots until ${until.toDateString()} — free, as a founding member.`,
      href: "/dashboard",
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/rewards");
    return {
      success: `Done — you are featured free until ${until.toDateString()}.`,
    };
  } catch (error) {
    return fieldError(error);
  }
}
