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
    return {
      success: offerContactOk
        ? "Saved — your benefits are personalised, and a trusted professional may contact you about your topics."
        : "Saved — your benefits are personalised. Nobody will contact you about them.",
    };
  } catch (error) {
    return fieldError(error);
  }
}
