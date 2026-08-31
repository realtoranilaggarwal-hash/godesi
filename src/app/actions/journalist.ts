"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { pressCardEligibility } from "@/lib/journalists";
import { journalistStats, nextPressCardId } from "@/lib/journalistsQueries";

/** Opts a member into the local journalist programme. */
export async function joinJournalistAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const beat = String(formData.get("beat") ?? "")
      .trim()
      .slice(0, 120);
    if (beat.length < 2) {
      return { error: "Tell us the city or area you want to cover." };
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        journalistBeat: beat,
        journalistSince: user.journalistSince ?? new Date(),
      },
    });

    revalidatePath("/news");
    revalidatePath("/journalists");
    return {
      success: `You are in — you now cover ${beat}. Post your first story below.`,
    };
  } catch (error) {
    return fieldError(error);
  }
}

/** Saves the mobile number the news desk uses to verify a reporter. */
export async function saveJournalistPhoneAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const phone = String(formData.get("phone") ?? "")
      .replace(/[^\d+]/g, "")
      .slice(0, 20);
    if (phone.replace(/\D/g, "").length < 8) {
      return { error: "Enter your mobile number with the country code." };
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        phone,
        // A changed number has to be checked again.
        phoneVerifiedAt: user.phone === phone ? user.phoneVerifiedAt : null,
      },
    });

    revalidatePath("/journalists");
    return {
      success:
        "Saved. The news desk will confirm this number on WhatsApp before your press card is issued.",
    };
  } catch (error) {
    return fieldError(error);
  }
}

/**
 * Issues the press card once every requirement is met. Members claim it
 * themselves so nobody gets a card they did not ask for.
 */
export async function claimPressCardAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    void formData;

    const stats = await journalistStats(user.id);
    if (stats.pressCard && !stats.pressCard.expired) {
      return { error: "Your press card is already active." };
    }

    const { eligible, missing } = pressCardEligibility(stats);
    if (!eligible) return { error: `Not yet — ${missing.join(", ")}.` };

    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    await db.user.update({
      where: { id: user.id },
      data: {
        pressCardId: user.pressCardId ?? (await nextPressCardId()),
        pressCardIssuedAt: issuedAt,
        pressCardExpiresAt: expiresAt,
      },
    });

    revalidatePath("/journalists");
    return { success: "Your Godesi press card is issued — valid for a year." };
  } catch (error) {
    return fieldError(error);
  }
}

export async function leaveJournalistAction(formData: FormData) {
  const user = await requireUser();
  // Kept as a plain action so the button works without JavaScript.
  void formData;
  await db.user.update({
    where: { id: user.id },
    data: { journalistSince: null, journalistBeat: null },
  });
  revalidatePath("/news");
  revalidatePath("/journalists");
}
