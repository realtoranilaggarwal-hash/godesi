"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, requireUser } from "@/lib/auth";
import { normalizeWhatsApp } from "@/lib/format";
import { type ActionState, fieldError } from "@/lib/actions";

const claimSchema = z.object({
  businessId: z.string().min(1),
  message: z
    .string()
    .trim()
    .min(20, "Tell us how you are connected to this business (at least 20 characters)")
    .max(1000),
  phone: z.string().trim().optional(),
});

/** A user asks to take over a seeded listing; an admin decides. */
export async function claimBusinessAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = claimSchema.safeParse({
      businessId: formData.get("businessId"),
      message: formData.get("message"),
      phone: formData.get("phone"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const business = await db.business.findUnique({
      where: { id: parsed.data.businessId },
      select: { id: true, slug: true, ownerId: true },
    });
    if (!business) return { error: "That listing no longer exists." };
    if (business.ownerId) return { error: "This listing has already been claimed." };

    const owned = await db.business.findUnique({ where: { ownerId: user.id } });
    if (owned) {
      return {
        error: "You already have a business on Godesi — one listing per account.",
      };
    }

    await db.businessClaim.upsert({
      where: { businessId_userId: { businessId: business.id, userId: user.id } },
      create: {
        businessId: business.id,
        userId: user.id,
        message: parsed.data.message,
        phone: parsed.data.phone ? normalizeWhatsApp(parsed.data.phone) : null,
      },
      update: { message: parsed.data.message, status: "PENDING" },
    });

    revalidatePath(`/b/${business.slug}`);
    return { success: "Claim submitted — we'll review it and email you." };
  } catch (error) {
    return fieldError(error);
  }
}

/** Approving a claim hands the listing (and its future edits) to the claimant. */
export async function reviewClaimAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  const approve = formData.get("decision") === "approve";

  const claim = await db.businessClaim.findUnique({
    where: { id },
    include: { business: { select: { id: true, slug: true, ownerId: true } } },
  });
  if (!claim) return;

  if (!approve) {
    await db.businessClaim.update({ where: { id }, data: { status: "REJECTED" } });
  } else if (claim.business.ownerId) {
    // Someone else got there first; nothing to hand over.
    await db.businessClaim.update({ where: { id }, data: { status: "REJECTED" } });
  } else {
    await db.$transaction([
      db.business.update({
        where: { id: claim.businessId },
        data: { ownerId: claim.userId, status: "APPROVED" },
      }),
      db.businessClaim.update({ where: { id }, data: { status: "APPROVED" } }),
      // Any competing claim on the same listing is closed out.
      db.businessClaim.updateMany({
        where: { businessId: claim.businessId, id: { not: id }, status: "PENDING" },
        data: { status: "REJECTED" },
      }),
    ]);
  }

  revalidatePath("/admin");
  revalidatePath(`/b/${claim.business.slug}`);
}
