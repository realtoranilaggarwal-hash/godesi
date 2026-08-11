"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { sendEmail } from "@/lib/email";
import {
  customMemberEmail,
  memberEmailTemplate,
  renderMemberEmail,
} from "@/lib/memberEmails";
import { invalidateDirectory } from "@/lib/cache";

const ASSIGNABLE_ROLES: Role[] = ["CLIENT", "BUSINESS", "MODERATOR", "ADMIN"];

function refresh(id?: string) {
  revalidatePath("/admin/members");
  if (id) revalidatePath(`/admin/members/${id}`);
}

export async function setMemberRoleAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "") as Role;
  if (!ASSIGNABLE_ROLES.includes(role)) throw new Error("Invalid role");

  await db.user.update({ where: { id }, data: { role } });
  refresh(id);
}

export async function setMemberVerifiedAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  const verified = String(formData.get("verified") ?? "") === "yes";

  await db.user.update({
    where: { id },
    data: { emailVerifiedAt: verified ? new Date() : null },
  });
  refresh(id);
}

/**
 * Suspending keeps the member's rows so nothing else breaks, but signs them
 * out everywhere and hides their listings from the directory.
 */
export async function setMemberBannedAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  const banned = String(formData.get("banned") ?? "") === "yes";
  const reason = String(formData.get("reason") ?? "").trim();

  await db.user.update({
    where: { id },
    data: {
      bannedAt: banned ? new Date() : null,
      bannedReason: banned ? reason || "Spam or abuse" : null,
    },
  });
  if (banned) {
    // Lifting a suspension leaves the cards unpublished until they are reviewed.
    await db.business.updateMany({
      where: { ownerId: id },
      data: { status: "REJECTED" },
    });
  }
  invalidateDirectory();
  refresh(id);
}

export async function saveMemberNoteAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  await db.user.update({
    where: { id },
    data: { adminNote: note || null },
  });
  refresh(id);
}

export async function deleteMemberAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  if (id === admin.id) throw new Error("You cannot delete your own account");

  await db.user.delete({ where: { id } });
  invalidateDirectory();
  refresh();
  redirect("/admin/members?deleted=1");
}

/** Tick the bot accounts on the spam view and clear them in one go. */
export async function deleteMembersAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const ids = formData
    .getAll("ids")
    .map((value) => String(value))
    .filter((value) => value && value !== admin.id);
  if (!ids.length) redirect("/admin/members?filter=spam");

  // Never bulk-delete anyone who paid or who runs a published card.
  const safe = await db.user.findMany({
    where: {
      id: { in: ids },
      role: { in: ["CLIENT", "BUSINESS"] },
      payments: { none: {} },
    },
    select: { id: true },
  });
  await db.user.deleteMany({ where: { id: { in: safe.map((row) => row.id) } } });
  invalidateDirectory();
  refresh();
  redirect(`/admin/members?filter=spam&removed=${safe.length}`);
}

export async function emailMemberAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireRole("ADMIN");
    const id = String(formData.get("id") ?? "");
    const templateKey = String(formData.get("template") ?? "");
    const member = await db.user.findUnique({
      where: { id },
      select: { email: true, name: true },
    });
    if (!member) return { error: "Member not found." };

    const message =
      templateKey === "custom"
        ? customMemberEmail(
            String(formData.get("subject") ?? "").trim(),
            String(formData.get("message") ?? "").trim(),
          )
        : (() => {
            const template = memberEmailTemplate(templateKey);
            return template
              ? renderMemberEmail(template, member.name.split(" ")[0])
              : null;
          })();

    if (!message) return { error: "Pick a message to send." };
    if (!message.subject) return { error: "Enter a subject." };

    const sent = await sendEmail({
      to: member.email,
      subject: message.subject,
      html: message.html,
    });
    if (!sent) {
      return {
        error:
          "Email could not be sent — check that the sending domain is still verified.",
      };
    }

    await db.user.update({
      where: { id },
      data: { lastContactedAt: new Date() },
    });
    refresh(id);
    return { success: `Sent to ${member.email}.` };
  } catch (error) {
    return fieldError(error);
  }
}
