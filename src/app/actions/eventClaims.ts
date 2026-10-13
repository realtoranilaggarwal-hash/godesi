"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff, requireUser } from "@/lib/auth";
import { normalizeWhatsApp } from "@/lib/format";
import { type ActionState, fieldError } from "@/lib/actions";

const claimSchema = z.object({
  eventId: z.string().min(1),
  message: z
    .string()
    .trim()
    .min(20, "Tell us how you run this event, in at least 20 characters")
    .max(1000),
  phone: z.string().trim().max(32).optional(),
  email: z.string().trim().email("Check the email address").max(160).optional(),
});

/**
 * An event we listed from a public calendar belongs to whoever runs it. They ask
 * for it here; staff verify before the page — and its ticketing — changes hands.
 */
export async function claimEventAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = claimSchema.safeParse({
      eventId: formData.get("eventId"),
      message: formData.get("message"),
      phone: formData.get("phone") || undefined,
      email: formData.get("email") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const event = await db.event.findUnique({
      where: { id: parsed.data.eventId },
      select: { id: true, slug: true, sourceId: true },
    });
    if (!event) return { error: "That event no longer exists." };
    if (!event.sourceId) {
      return { error: "This event is already run by its organiser on Godesi." };
    }

    await db.eventClaim.upsert({
      where: { eventId_userId: { eventId: event.id, userId: user.id } },
      create: {
        eventId: event.id,
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

    revalidatePath(`/events/${event.slug}`);
    return {
      success:
        "Claim sent. We check it with you first, then the event is yours to edit and sell tickets on.",
    };
  } catch (error) {
    return fieldError(error);
  }
}

/**
 * Approving hands the event to the organiser and takes it off the imported
 * feed, so they can price seats and sell them here. The site we found it on
 * stays credited on the page.
 */
export async function reviewEventClaimAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const approve = formData.get("decision") === "approve";

  const claim = await db.eventClaim.findUnique({
    where: { id },
    include: {
      event: {
        select: {
          id: true,
          slug: true,
          sourceId: true,
          importedFrom: true,
          source: { select: { name: true } },
        },
      },
    },
  });
  if (!claim) return;

  if (!approve || !claim.event.sourceId) {
    await db.eventClaim.update({ where: { id }, data: { status: "REJECTED" } });
  } else {
    await db.$transaction([
      db.event.update({
        where: { id: claim.event.id },
        data: {
          organizerId: claim.userId,
          importedFrom:
            claim.event.importedFrom ?? claim.event.source?.name ?? null,
          claimedAt: new Date(),
          sourceId: null,
          sourceUid: null,
        },
      }),
      db.eventClaim.update({ where: { id }, data: { status: "APPROVED" } }),
      db.eventClaim.updateMany({
        where: { eventId: claim.event.id, id: { not: id }, status: "PENDING" },
        data: { status: "REJECTED" },
      }),
    ]);
  }

  revalidatePath("/admin/claims");
  revalidatePath(`/events/${claim.event.slug}`);
}
