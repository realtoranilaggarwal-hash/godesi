"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff, requireUser } from "@/lib/auth";
import { normalizeWhatsApp } from "@/lib/format";
import { type ActionState, fieldError } from "@/lib/actions";
import { canEditVenue, venuePath } from "@/lib/venues";

const claimSchema = z.object({
  venueId: z.string().min(1),
  message: z
    .string()
    .trim()
    .min(20, "Tell us how you run this venue, in at least 20 characters")
    .max(1000),
  phone: z.string().trim().max(32).optional(),
  email: z.string().trim().email("Check the email address").max(160).optional(),
});

/** A venue owner asks to manage its page; staff verify before it changes hands. */
export async function claimVenueAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = claimSchema.safeParse({
      venueId: formData.get("venueId"),
      message: formData.get("message"),
      phone: formData.get("phone") || undefined,
      email: formData.get("email") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const venue = await db.venue.findUnique({
      where: { id: parsed.data.venueId },
      select: { id: true, slug: true, ownerId: true },
    });
    if (!venue) return { error: "That venue no longer exists." };
    if (venue.ownerId === user.id)
      return { error: "You already manage this venue." };
    if (venue.ownerId)
      return { error: "This venue is already managed by its owner." };

    const phone = parsed.data.phone
      ? normalizeWhatsApp(parsed.data.phone)
      : null;
    await db.venueClaim.upsert({
      where: { venueId_userId: { venueId: venue.id, userId: user.id } },
      create: {
        venueId: venue.id,
        userId: user.id,
        message: parsed.data.message,
        phone,
        email: parsed.data.email ?? null,
      },
      update: {
        message: parsed.data.message,
        phone,
        email: parsed.data.email ?? null,
        status: "PENDING",
      },
    });

    revalidatePath(venuePath(venue));
    return {
      success:
        "Claim sent. We check it with you first, then you can edit this venue's page and halls.",
    };
  } catch (error) {
    return fieldError(error);
  }
}

/** Approving makes the claimant the venue's owner on Godesi. */
export async function reviewVenueClaimAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const approve = formData.get("decision") === "approve";

  const claim = await db.venueClaim.findUnique({
    where: { id },
    include: { venue: { select: { id: true, slug: true, ownerId: true } } },
  });
  if (!claim) return;

  if (!approve || claim.venue.ownerId) {
    await db.venueClaim.update({ where: { id }, data: { status: "REJECTED" } });
  } else {
    await db.$transaction([
      db.venue.update({
        where: { id: claim.venue.id },
        data: { ownerId: claim.userId, claimedAt: new Date() },
      }),
      db.venueClaim.update({ where: { id }, data: { status: "APPROVED" } }),
      db.venueClaim.updateMany({
        where: { venueId: claim.venue.id, id: { not: id }, status: "PENDING" },
        data: { status: "REJECTED" },
      }),
    ]);
  }

  revalidatePath("/admin/claims");
  revalidatePath(venuePath(claim.venue));
}

const optionalUrl = z
  .string()
  .trim()
  .url("Enter a valid URL, starting with https://")
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

const editSchema = z.object({
  venueId: z.string().min(1),
  state: optionalText(60),
  country: optionalText(60),
  address: optionalText(300),
  website: optionalUrl,
  mapsUrl: optionalUrl,
  halls: z.string().max(2000).optional(),
});

/** The venue's owner (or staff) edits its details and list of halls. */
export async function updateVenueAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let path: string;
  try {
    const user = await requireUser();
    const parsed = editSchema.safeParse({
      venueId: formData.get("venueId"),
      state: formData.get("state") ?? undefined,
      country: formData.get("country") ?? undefined,
      address: formData.get("address") ?? undefined,
      website: formData.get("website") ?? undefined,
      mapsUrl: formData.get("mapsUrl") ?? undefined,
      halls: formData.get("halls") ?? undefined,
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Check the form." };
    }
    const venue = await db.venue.findUnique({
      where: { id: parsed.data.venueId },
      select: { id: true, slug: true, ownerId: true },
    });
    if (!venue) return { error: "That venue no longer exists." };
    if (!canEditVenue(user, venue)) {
      return { error: "Only the venue's owner can edit this page." };
    }

    const seen = new Set<string>();
    const halls = (parsed.data.halls ?? "")
      .split("\n")
      .map((hall) => hall.trim().slice(0, 80))
      .filter((hall) => {
        const key = hall.toLowerCase();
        if (!hall || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 30);

    await db.venue.update({
      where: { id: venue.id },
      data: {
        state: parsed.data.state ?? null,
        country: parsed.data.country ?? null,
        address: parsed.data.address ?? null,
        website: parsed.data.website ?? null,
        mapsUrl: parsed.data.mapsUrl ?? null,
        halls,
      },
    });
    path = venuePath(venue);
    revalidatePath(path);
  } catch (error) {
    return fieldError(error);
  }
  redirect(path);
}
