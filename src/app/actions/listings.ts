"use server";

import { revalidatePath } from "next/cache";
import { pingIndexNowInBackground } from "@/lib/indexNow";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { normalizeWhatsApp } from "@/lib/format";
import { requestCurrency } from "@/lib/currency";
import { isMonthly, uniqueListingSlug } from "@/lib/listings";
import { awardPoints } from "@/lib/rewards";
import { type ActionState, fieldError } from "@/lib/actions";
import { isSupportedVideoUrl } from "@/lib/video";
import { isAlbumLink } from "@/lib/photoAlbum";
import { effectivePlan } from "@/lib/plans";
import { foundingFeatureActive } from "@/lib/founding";
import { contactDetailKind } from "@/lib/moderation";
import { autoShareInBackground } from "@/lib/autoShare";
import { titleCase } from "@/lib/titlecase";

const schema = z.object({
  kind: z.enum(["PROPERTY_SALE", "PROPERTY_RENT", "ROOM_WANTED", "ROOM_OFFERED", "MARKETPLACE"]),
  title: z.string().min(6, "Give your listing a clear title"),
  description: z.string().min(20, "Add a few lines of detail"),
  city: z.string().min(2, "Which city?"),
  area: z.string().optional(),
  price: z.coerce.number().int().min(0).max(500_000_000),
  currency: z.enum(["INR", "USD"]).optional(),
  bedrooms: z.coerce.number().int().min(0).max(20).optional(),
  furnishing: z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]).optional(),
  genderPref: z.enum(["ANY", "MALE", "FEMALE"]).optional(),
  whatsapp: z.string().min(10, "Add a WhatsApp number so people can reach you"),
  videoUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || isSupportedVideoUrl(value),
      "Paste a YouTube or Vimeo video link",
    ),
  albumUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || isAlbumLink(value),
      "Paste a Google Photos album link (photos.app.goo.gl/…)",
    ),
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
      price: formData.get("price") || 0,
      currency: formData.get("currency") || undefined,
      bedrooms: formData.get("bedrooms") || undefined,
      furnishing: formData.get("furnishing") || undefined,
      genderPref: formData.get("genderPref") || undefined,
      whatsapp: formData.get("whatsapp"),
      videoUrl: formData.get("videoUrl") || undefined,
      albumUrl: formData.get("albumUrl") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    if (effectivePlan(user) === "FREE") {
      const kind = contactDetailKind(parsed.data.description);
      if (kind) {
        return {
          error: `Please remove the ${kind} from the description — free listings are contacted on WhatsApp. Upgrade to Pro to show your phone, email and website.`,
        };
      }
    }

    const images = formData
      .getAll("images")
      .map((value) => String(value).trim())
      .filter((value) => value.startsWith("https://"))
      .slice(0, 20);

    const listing = await db.listing.create({
      data: {
        slug: await uniqueListingSlug(parsed.data.title, parsed.data.city),
        kind: parsed.data.kind,
        title: titleCase(parsed.data.title),
        description: parsed.data.description,
        city: parsed.data.city,
        area: parsed.data.area ?? null,
        price: parsed.data.price,
        currency: parsed.data.currency ?? requestCurrency(),
        perMonth: isMonthly(parsed.data.kind),
        bedrooms: parsed.data.bedrooms ?? null,
        furnishing: parsed.data.furnishing ?? null,
        genderPref: parsed.data.genderPref ?? null,
        whatsapp: normalizeWhatsApp(parsed.data.whatsapp),
        videoUrl: parsed.data.videoUrl ?? null,
        albumUrl: parsed.data.albumUrl ?? null,
        featured: foundingFeatureActive(user),
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

    if (listing.status === "APPROVED") {
      autoShareInBackground({
        kind: "listing",
        id: listing.id,
        title: `🏠 ${listing.title}`,
        body: `${listing.city}${listing.area ? `, ${listing.area}` : ""} · ${listing.description.slice(0, 300)}`,
        path: `/listings/${listing.slug}`,
        imageUrl: images[0] ?? null,
        tags: [listing.city, "desihousing"],
      });
    }

    revalidatePath("/real-estate");
    revalidatePath("/rooms");
    if (listing.status === "APPROVED")
      pingIndexNowInBackground(`/listings/${listing.slug}`);
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
  if (listing.ownerId !== user.id && !can(user, "listings"))
    throw new Error("FORBIDDEN");

  await db.listing.delete({ where: { id } });
  revalidatePath("/real-estate");
  revalidatePath("/rooms");
  revalidatePath("/dashboard/listings");
}
