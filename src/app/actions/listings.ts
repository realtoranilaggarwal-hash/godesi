"use server";

import { revalidatePath } from "next/cache";
import { pingIndexNowInBackground } from "@/lib/indexNow";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { can, getCurrentUser, requireUser } from "@/lib/auth";
import { normalizeWhatsApp } from "@/lib/format";
import { requestCurrency } from "@/lib/currency";
import { isMonthly, marketplaceCategories, uniqueListingSlug } from "@/lib/listings";
import { awardPoints } from "@/lib/rewards";
import { type ActionState, fieldError } from "@/lib/actions";
import { isSupportedVideoUrl } from "@/lib/video";
import { isAlbumLink } from "@/lib/photoAlbum";
import { effectivePlan } from "@/lib/plans";
import { foundingFeatureActive } from "@/lib/founding";
import { contactDetailKind } from "@/lib/moderation";
import { autoShareInBackground } from "@/lib/autoShare";
import { titleCase } from "@/lib/titlecase";
import {
  AMENITIES,
  AREA_UNITS,
  FACINGS,
  OWNERSHIPS,
  PROPERTY_AGES,
  TENANT_PREFS,
  UTILITIES,
  groupForType,
  keepOptions,
} from "@/lib/property";

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
  categorySlug: z.string().trim().optional(),
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
  // Property block below; ignored for rooms and buy & sell.
  propertyType: z.string().trim().optional(),
  postedByRole: z.enum(["OWNER", "AGENT", "BUILDER"]).optional(),
  bathrooms: z.coerce.number().int().min(0).max(20).optional(),
  balconies: z.coerce.number().int().min(0).max(20).optional(),
  builtUpArea: z.coerce.number().int().min(0).max(10_000_000).optional(),
  carpetArea: z.coerce.number().int().min(0).max(10_000_000).optional(),
  areaUnit: z.string().trim().optional(),
  propertyAge: z.string().trim().optional(),
  floor: z.coerce.number().int().min(-5).max(200).optional(),
  totalFloors: z.coerce.number().int().min(0).max(200).optional(),
  facing: z.string().trim().optional(),
  ownership: z.string().trim().optional(),
  negotiable: z.coerce.boolean().optional(),
  underLoan: z.coerce.boolean().optional(),
  deposit: z.coerce.number().int().min(0).max(500_000_000).optional(),
  maintenance: z.coerce.number().int().min(0).max(10_000_000).optional(),
  parkingCar: z.coerce.number().int().min(0).max(20).optional(),
  parkingBike: z.coerce.number().int().min(0).max(20).optional(),
  tourUrl: z
    .string()
    .trim()
    .url("Paste a full link for the virtual tour")
    .optional(),
  mapUrl: z.string().trim().url("Paste a Google Maps link").optional(),
  state: z.string().trim().max(80).optional(),
  country: z.string().trim().max(80).optional(),
  availableFrom: z.coerce.date().optional(),
  tenantPref: z.string().trim().optional(),
  nriFriendly: z.coerce.boolean().optional(),
  investmentDeal: z.coerce.boolean().optional(),
  contactName: z.string().trim().max(80).optional(),
  contactPhone: z.string().trim().max(30).optional(),
  contactEmail: z.string().trim().email("Check the contact email").optional(),
});

function oneOf(value: string | undefined, allowed: { slug: string }[]) {
  return allowed.some((option) => option.slug === value) ? (value as string) : null;
}

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
      categorySlug: formData.get("categorySlug") || undefined,
      whatsapp: formData.get("whatsapp"),
      videoUrl: formData.get("videoUrl") || undefined,
      albumUrl: formData.get("albumUrl") || undefined,
      propertyType: formData.get("propertyType") || undefined,
      postedByRole: formData.get("postedByRole") || undefined,
      bathrooms: formData.get("bathrooms") || undefined,
      balconies: formData.get("balconies") || undefined,
      builtUpArea: formData.get("builtUpArea") || undefined,
      carpetArea: formData.get("carpetArea") || undefined,
      areaUnit: formData.get("areaUnit") || undefined,
      propertyAge: formData.get("propertyAge") || undefined,
      floor: formData.get("floor") || undefined,
      totalFloors: formData.get("totalFloors") || undefined,
      facing: formData.get("facing") || undefined,
      ownership: formData.get("ownership") || undefined,
      negotiable: formData.get("negotiable") ? true : undefined,
      underLoan: formData.get("underLoan") ? true : undefined,
      deposit: formData.get("deposit") || undefined,
      maintenance: formData.get("maintenance") || undefined,
      parkingCar: formData.get("parkingCar") || undefined,
      parkingBike: formData.get("parkingBike") || undefined,
      tourUrl: formData.get("tourUrl") || undefined,
      mapUrl: formData.get("mapUrl") || undefined,
      state: formData.get("state") || undefined,
      country: formData.get("country") || undefined,
      availableFrom: formData.get("availableFrom") || undefined,
      tenantPref: formData.get("tenantPref") || undefined,
      nriFriendly: formData.get("nriFriendly") ? true : undefined,
      investmentDeal: formData.get("investmentDeal") ? true : undefined,
      contactName: formData.get("contactName") || undefined,
      contactPhone: formData.get("contactPhone") || undefined,
      contactEmail: formData.get("contactEmail") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    // Items live in the Buy & sell tree; anything else has no category to pick.
    let categorySlug: string | null = null;
    if (parsed.data.kind === "MARKETPLACE") {
      const allowed = await marketplaceCategories();
      categorySlug =
        allowed.find((category) => category.slug === parsed.data.categorySlug)?.slug ??
        null;
      if (!categorySlug) {
        return { error: "Pick the category your item belongs to" };
      }
    }

    if (effectivePlan(user) === "FREE") {
      const kind = contactDetailKind(parsed.data.description);
      if (kind) {
        return {
          error: `Please remove the ${kind} from the description — free listings are contacted on WhatsApp. Upgrade to Pro to show your phone, email and website.`,
        };
      }
    }

    const isProperty =
      parsed.data.kind === "PROPERTY_SALE" || parsed.data.kind === "PROPERTY_RENT";
    const propertyType = isProperty
      ? (groupForType(parsed.data.propertyType ?? "") ? parsed.data.propertyType! : null)
      : null;
    const propertyGroup = propertyType ? groupForType(propertyType) : null;
    const property = isProperty
      ? {
          propertyGroup,
          propertyType,
          postedByRole: parsed.data.postedByRole ?? "OWNER",
          bathrooms: parsed.data.bathrooms ?? null,
          balconies: parsed.data.balconies ?? null,
          builtUpArea: parsed.data.builtUpArea ?? null,
          carpetArea: parsed.data.carpetArea ?? null,
          areaUnit: oneOf(parsed.data.areaUnit, AREA_UNITS) ?? "sqft",
          propertyAge: oneOf(parsed.data.propertyAge, PROPERTY_AGES),
          floor: parsed.data.floor ?? null,
          totalFloors: parsed.data.totalFloors ?? null,
          facing: oneOf(parsed.data.facing, FACINGS),
          ownership: oneOf(parsed.data.ownership, OWNERSHIPS),
          negotiable: parsed.data.negotiable ?? false,
          underLoan: parsed.data.underLoan ?? false,
          deposit: parsed.data.deposit ?? null,
          maintenance: parsed.data.maintenance ?? null,
          parkingCar: parsed.data.parkingCar ?? null,
          parkingBike: parsed.data.parkingBike ?? null,
          amenities: keepOptions(
            formData.getAll("amenities").map(String),
            AMENITIES,
          ),
          utilities: keepOptions(
            formData.getAll("utilities").map(String),
            UTILITIES,
          ),
          tourUrl: parsed.data.tourUrl ?? null,
          mapUrl: parsed.data.mapUrl ?? null,
          state: parsed.data.state || null,
          country: parsed.data.country || null,
          availableFrom: parsed.data.availableFrom ?? null,
          tenantPref: oneOf(parsed.data.tenantPref, TENANT_PREFS),
          nriFriendly: parsed.data.nriFriendly ?? false,
          investmentDeal: parsed.data.investmentDeal ?? false,
          contactName: parsed.data.contactName || null,
          contactPhone: parsed.data.contactPhone || null,
          contactEmail: parsed.data.contactEmail || null,
        }
      : {};

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
        categorySlug,
        whatsapp: normalizeWhatsApp(parsed.data.whatsapp),
        videoUrl: parsed.data.videoUrl ?? null,
        albumUrl: parsed.data.albumUrl ?? null,
        ...property,
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
    revalidatePath("/marketplace");
    revalidatePath("/categories/real-estate");
    if (listing.status === "APPROVED")
      pingIndexNowInBackground(`/listings/${listing.slug}`);
    destination = `/listings/${listing.slug}`;
  } catch (error) {
    return fieldError(error);
  }
  redirect(destination);
}

/**
 * Records that someone took a seller's contact detail. Called from the listing
 * page as the visitor leaves for WhatsApp, so the owner and the admin lead desk
 * can see demand. Never throws at the caller — a failed count must not block
 * the enquiry.
 */
export async function recordListingLeadAction(listingId: string, channel: string) {
  if (!["whatsapp", "phone", "email"].includes(channel)) return;
  try {
    const user = await getCurrentUser();
    await db.listingLead.create({
      data: { listingId, channel, userId: user?.id ?? null },
    });
  } catch {
    // Counting leads is best-effort.
  }
}

/**
 * Contact details for a property, handed over only after a signed-in member
 * asks for them. They deliberately never travel to the browser with the page:
 * client component props are serialised into the HTML, so passing them up front
 * would publish every seller's number to anyone who reads the source.
 */
export async function revealListingContactAction(listingId: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  const listing = await db.listing.findFirst({
    where: { id: listingId, status: "APPROVED" },
    select: { contactName: true, contactPhone: true, contactEmail: true },
  });
  if (!listing) return null;

  await recordListingLeadAction(listingId, listing.contactPhone ? "phone" : "email");
  return listing;
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
  revalidatePath("/marketplace");
  revalidatePath("/dashboard/listings");
}
