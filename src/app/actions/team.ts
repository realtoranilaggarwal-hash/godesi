"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";

/** Grants content-desk access to an existing member by email. */
export async function grantModeratorAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireRole("ADMIN");
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    if (!email) return { error: "Enter the member's email." };

    const member = await db.user.findUnique({ where: { email } });
    if (!member) {
      return { error: "No account with that email — ask them to sign up first." };
    }
    if (member.role === "ADMIN") return { error: "That account is already an admin." };

    await db.user.update({ where: { id: member.id }, data: { role: "MODERATOR" } });
    revalidatePath("/admin");
    return { success: `${member.name ?? email} can now use the content desk.` };
  } catch (error) {
    return fieldError(error);
  }
}

export async function revokeModeratorAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  const member = await db.user.findUnique({ where: { id } });
  if (!member || member.role !== "MODERATOR") return;
  await db.user.update({ where: { id }, data: { role: "BUSINESS" } });
  revalidatePath("/admin");
}
