"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";

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
