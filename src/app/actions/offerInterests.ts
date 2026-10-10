"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { cleanOfferPhone, parseOfferInterests } from "@/lib/offerInterests";

export async function saveOfferInterestsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const offerInterests = parseOfferInterests(formData.getAll("offers"));
    const offerPhone = cleanOfferPhone(formData.get("offerPhone"));
    await db.user.update({
      where: { id: user.id },
      data: {
        offerInterests,
        offerPhone,
        offerInterestsAt: offerInterests.length ? new Date() : null,
      },
    });
    revalidatePath("/dashboard");
    return {
      success: offerInterests.length
        ? "Saved — we'll send you offers on what you picked."
        : "Saved — you won't get any offers.",
    };
  } catch (error) {
    return fieldError(error);
  }
}
