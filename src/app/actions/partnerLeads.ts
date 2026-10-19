"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function togglePartnerLeadHandled(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "ADMIN") return;
  const id = String(formData.get("id") ?? "");
  const lead = await db.partnerLead.findUnique({ where: { id } });
  if (!lead) return;
  await db.partnerLead.update({
    where: { id },
    data: { handledAt: lead.handledAt ? null : new Date() },
  });
  revalidatePath("/admin/partner-leads");
}
