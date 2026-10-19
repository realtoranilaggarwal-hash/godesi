"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import {
  cleanOfferPhone,
  parseOfferContact,
  parseOfferInterests,
} from "@/lib/offerInterests";
import { offerSpinDay } from "@/lib/spin";
import { awardOfferPickPoints } from "@/lib/rewardsQueries";

export async function saveOfferInterestsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const offerInterests = parseOfferInterests(formData.getAll("offers"));
    const offerPhone = cleanOfferPhone(formData.get("offerPhone"));
    const offerContactOk =
      offerInterests.length > 0 &&
      parseOfferContact(formData.get("offerContact"));
    await db.user.update({
      where: { id: user.id },
      data: {
        offerInterests,
        offerPhone,
        offerInterestsAt: offerInterests.length ? new Date() : null,
        offerContactOk,
        offerContactAt: offerContactOk ? new Date() : null,
      },
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/offers");
    if (!offerInterests.length)
      return {
        success: "Saved — no topics picked, so no personalised offers.",
      };
    const points = await awardOfferPickPoints(user.id, offerInterests);
    const usedSpins = await db.dailySpin.count({
      where: { userId: user.id, day: { in: offerInterests.map(offerSpinDay) } },
    });
    const bonus = offerInterests.length - usedSpins;
    const spins = bonus
      ? ` 🎡 You have ${bonus} bonus ${bonus === 1 ? "spin" : "spins"} waiting — tap Spin.`
      : "";
    return {
      success:
        (offerContactOk
          ? "Saved — your benefits are personalised, and a trusted professional may contact you about your topics."
          : "Saved — your benefits are personalised. Nobody will contact you about them.") +
        (points ? ` ⭐ +${points} points added to your wallet.` : "") +
        spins,
    };
  } catch (error) {
    return fieldError(error);
  }
}
