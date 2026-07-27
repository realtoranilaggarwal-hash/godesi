"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { normalizeWhatsApp } from "@/lib/format";
import { isMonthly, uniqueListingSlug } from "@/lib/listings";
import { awardPoints } from "@/lib/rewards";
import { type ActionState, fieldError } from "@/lib/actions";

const schema = z.object({
  kind: z.enum(["PROPERTY_SALE", "PROPERTY_RENT", "ROOM_WANTED", "ROOM_OFFERED", "MARKETPLACE"]),
  title: z.string().min(6, "Give your listing a clear title"),
  description: z.string().min(20, "Add a few lines of detail"),
  city: z.string().min(2, "Which city?"),
  area: z.string().optional(),
  priceInr: z.coerce.number().int().min(0).max(500_000_000),
  bedrooms: z.coerce.number().int().min(0).max(20).optional(),
  furnishing: z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]).optional(),
  genderPref: z.enum(["ANY", "MALE", "FEMALE"]).optional(),
  whatsapp: z.string().min(10, "Add a WhatsApp number so people can reach you"),
});

export async function createListingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let destination = "/real-estate";
  try {
    const user = await requireUser();
    const parsed = schema.safeParse({
      kind: formData.get("kind"),
      title: formData.get("title"),
      description: formData.get("description"),
      city: formData.get("city"),
      area: formData.get("area") || undefined,
      priceInr: formData.get("priceInr") || 0,
      bedrooms: formData.get("bedrooms") || undefined,
      furnishing: formData.get("furnishing") || undefined,
      genderPref: formData.get("genderPref") || undefined,
      whatsapp: formData.get("whatsapp"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const images = formData
      .getAll("images")
      .map((value) => String(value).trim())
      .filter((value) => value.startsWith("https://"))
      .slice(0, 20);

    const listing = await db.listing.create({
      data: {
        slug: await uniqueListingSlug(parsed.data.title, parsed.data.city),
        kind: parsed.data.kind,
        title: parsed.data.title,
        description: parsed.data.description,
        city: parsed.data.city,
        area: parsed.data.area ?? null,
        priceInr: parsed.data.priceInr,
        perMonth: isMonthly(parsed.data.kind),
        bedrooms: parsed.data.bedrooms ?? null,
        furnishing: parsed.data.furnishing ?? null,
        genderPref: parsed.data.genderPref ?? null,
        whatsapp: normalizeWhatsApp(parsed.data.whatsapp),
        ownerId: user.id,
        images: {
          create: images.map((url, index) => ({ url, sortOrder: index })),
        },
      },
    });

    await awardPoints({
      userId: user.id,
      reason: "LISTING_POSTED",
      note: `Listing ${listing.slug}`,
    });

    revalidatePath("/real-estate");
    revalidatePath("/rooms");
    destination = `/listings/${listing.slug}`;
  } catch (error) {
    return fieldError(error);
  }
  redirect(destination);
}

export async function deleteListingAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) return;
  if (listing.ownerId !== user.id && user.role !== "ADMIN") throw new Error("FORBIDDEN");

  await db.listing.delete({ where: { id } });
  revalidatePath("/real-estate");
  revalidatePath("/rooms");
  revalidatePath("/dashboard/listings");
}
