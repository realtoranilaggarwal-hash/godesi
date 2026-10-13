"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff, requireUser } from "@/lib/auth";
import { normalizeWhatsApp } from "@/lib/format";
import { type ActionState, fieldError } from "@/lib/actions";

const claimSchema = z.object({
  entryId: z.string().min(1),
  message: z
    .string()
    .trim()
    .min(20, "Tell us who you are, in at least 20 characters")
    .max(1000),
  phone: z.string().trim().max(32).optional(),
  email: z.string().trim().email("Check the email address").max(160).optional(),
});

/**
 * A person (or someone they authorise) asks for the profile our team compiled
 * from public sources. Staff verify it before the account takes the page over.
 */
export async function claimEliteEntryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = claimSchema.safeParse({
      entryId: formData.get("entryId"),
      message: formData.get("message"),
      phone: formData.get("phone") || undefined,
      email: formData.get("email") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const entry = await db.eliteEntry.findUnique({
      where: { id: parsed.data.entryId },
      select: { id: true, slug: true, userId: true },
    });
    if (!entry) return { error: "That profile no longer exists." };
    if (entry.userId) {
      return { error: "This profile has already been claimed." };
    }

    await db.eliteClaim.upsert({
      where: { entryId_userId: { entryId: entry.id, userId: user.id } },
      create: {
        entryId: entry.id,
        userId: user.id,
        message: parsed.data.message,
        phone: parsed.data.phone ? normalizeWhatsApp(parsed.data.phone) : null,
        email: parsed.data.email ?? null,
      },
      update: {
        message: parsed.data.message,
        phone: parsed.data.phone ? normalizeWhatsApp(parsed.data.phone) : null,
        email: parsed.data.email ?? null,
        status: "PENDING",
      },
    });

    revalidatePath(`/desi-elite/${entry.slug}`);
    return {
      success:
        "Claim sent — our team will verify it and get in touch before handing the page over.",
    };
  } catch (error) {
    return fieldError(error);
  }
}

/** Approving a claim gives the member the profile and closes rival claims. */
export async function reviewEliteClaimAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const approve = formData.get("decision") === "approve";

  const claim = await db.eliteClaim.findUnique({
    where: { id },
    include: { entry: { select: { id: true, slug: true, userId: true } } },
  });
  if (!claim) return;

  if (!approve) {
    await db.eliteClaim.update({ where: { id }, data: { status: "REJECTED" } });
  } else if (claim.entry.userId) {
    await db.eliteClaim.update({ where: { id }, data: { status: "REJECTED" } });
  } else {
    await db.$transaction([
      db.eliteEntry.update({
        where: { id: claim.entry.id },
        data: { userId: claim.userId },
      }),
      db.eliteClaim.update({ where: { id }, data: { status: "APPROVED" } }),
      db.eliteClaim.updateMany({
        where: { entryId: claim.entry.id, id: { not: id }, status: "PENDING" },
        data: { status: "REJECTED" },
      }),
    ]);
  }

  revalidatePath("/admin/desi-elite");
  revalidatePath(`/desi-elite/${claim.entry.slug}`);
}
