"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

/** Records that we invited (or gave up on) the owner of an unclaimed listing. */
export async function markOutreachAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const channel = String(formData.get("channel") ?? "").slice(0, 20);
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  if (!id) return;

  await db.business.update({
    where: { id },
    data: {
      invitedAt: channel === "reset" ? null : new Date(),
      inviteChannel: channel === "reset" ? null : channel || "other",
      inviteNote: note || null,
    },
  });

  revalidatePath("/admin/outreach");
}
