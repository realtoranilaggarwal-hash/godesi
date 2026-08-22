"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { isStaffPermission } from "@/lib/permissions";

function pickPermissions(formData: FormData) {
  return formData
    .getAll("permissions")
    .map((value) => String(value))
    .filter(isStaffPermission);
}

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

    const permissions = pickPermissions(formData);
    if (!permissions.length) {
      return { error: "Tick at least one thing they are allowed to manage." };
    }

    await db.user.update({
      where: { id: member.id },
      data: { role: "MODERATOR", staffPermissions: permissions },
    });
    revalidatePath("/admin");
    return {
      success: `${member.name ?? email} can now manage ${permissions.length} area(s) from the content desk.`,
    };
  } catch (error) {
    return fieldError(error);
  }
}
