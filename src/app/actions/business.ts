"use server";

import { revalidatePath } from "next/cache";
import { pingIndexNowInBackground } from "@/lib/indexNow";
import { invalidateDirectory } from "@/lib/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { isStaff, requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import {
  MAX_VIDEO_LIMIT,
  effectivePlan,
  extraCategoryLimit,
  mediaLimit,
  videoLimit,
} from "@/lib/plans";
import { contactDetailKind } from "@/lib/moderation";
import { autoApproveStatus } from "@/lib/autoApprove";
import {
  cleanCertifications,
  cleanCustomOptions,
  cleanSpecialties,
  cleanServiceOptions,
  missingChoiceGroups,
  specialtySet,
} from "@/lib/specialties";
import { uniqueSlug } from "@/lib/slug";
import { normalizeWhatsApp } from "@/lib/format";
import { awardPoints } from "@/lib/rewards";
import { isSupportedVideoUrl } from "@/lib/video";
import { isAlbumLink } from "@/lib/photoAlbum";
import { titleCase } from "@/lib/titlecase";
import {
  CONDITIONS,
  FUEL_TYPES,
  MILEAGE_UNITS,
  OWNERSHIPS,
  TRANSMISSIONS,
  VEHICLE_DOCUMENTS,
  VEHICLE_FEATURES,
  VEHICLE_MAKES,
  VEHICLE_TYPES,
  isVehicleCard,
  keepKnown,
} from "@/lib/vehicles";

const vehicleSchema = z.object({
  vehicleType: z.enum(VEHICLE_TYPES, { message: "Pick the vehicle type" }),
  make: z.string().trim().min(1, "Pick the make"),
  model: z.string().trim().min(1, "Pick the model"),
  year: z.coerce
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 1),
  mileage: z.coerce.number().int().min(0).max(2_000_000).optional(),
  mileageUnit: z.enum(MILEAGE_UNITS).default("mi"),
  fuelType: z.enum(FUEL_TYPES).optional(),
  transmission: z.enum(TRANSMISSIONS).optional(),
  ownership: z.enum(OWNERSHIPS).optional(),
  condition: z.enum(CONDITIONS).optional(),
  price: z.coerce.number().int().min(0).max(100_000_000).optional(),
  currency: z.enum(["USD", "INR"]).default("USD"),
});

/** Reads the Cars & Bikes block; returns null when the card is not a vehicle. */
function readVehicleForm(formData: FormData) {
  const value = (key: string) => {
    const raw = formData.get(key);
    return typeof raw === "string" && raw ? raw : undefined;
  };
  const parsed = vehicleSchema.safeParse({
    vehicleType: value("vehicleType"),
    make: value("make"),
    model: value("model"),
    year: value("year"),
    mileage: value("mileage"),
    mileageUnit: value("mileageUnit") ?? "mi",
    fuelType: value("fuelType"),
    transmission: value("transmission"),
    ownership: value("ownership"),
    condition: value("condition"),
    price: value("vehiclePrice"),
    currency: value("vehicleCurrency") ?? "USD",
  });
  if (!parsed.success)
    return { error: parsed.error.issues[0].message } as const;

  const models = VEHICLE_MAKES[parsed.data.make];
  if (!models?.includes(parsed.data.model)) {
    return { error: "Pick a model that belongs to the chosen make." } as const;
  }

  return {
    data: {
      ...parsed.data,
      mileage: parsed.data.mileage ?? null,
      fuelType: parsed.data.fuelType ?? null,
      transmission: parsed.data.transmission ?? null,
      ownership: parsed.data.ownership ?? null,
      condition: parsed.data.condition ?? null,
      price: parsed.data.price ?? null,
      negotiable: formData.get("negotiable") === "on",
      features: keepKnown(
        VEHICLE_FEATURES,
        formData.getAll("vehicleFeatures").map(String),
      ),
      documents: keepKnown(
        VEHICLE_DOCUMENTS,
        formData.getAll("vehicleDocuments").map(String),
      ),
    },
  } as const;
}

const optionalUrl = z
  .string()
  .trim()
  .url("Enter a valid URL")
  .optional()
  .or(z.literal("").transform(() => undefined));

const profileSchema = z.object({
  name: z.string().trim().min(2, "Business name is required"),
  profileType: z.enum(["BUSINESS", "PROFESSIONAL"]).default("BUSINESS"),
  categorySlug: z.string().trim().min(1, "Choose a category"),
  subcategorySlug: z.string().trim().optional(),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().optional(),
  country: z.string().trim().max(60).optional(),
  description: z.string().trim().max(2000).optional(),
  whatsappNumber: z
    .string()
    .trim()
    .refine(
      (v) => normalizeWhatsApp(v).length >= 10,
      "Enter a valid WhatsApp number",
    ),
  phone: z.string().trim().optional(),
  publicEmail: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  address: z.string().trim().optional(),
  logoUrl: optionalUrl,
  websiteUrl: optionalUrl,
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  videoUrl: optionalUrl.refine(
    (value) => !value || isSupportedVideoUrl(value),
    "Paste a YouTube or Vimeo video link",
  ),
  videoUrls: z.string().optional(),
  albumUrl: optionalUrl.refine(
    (value) => !value || isAlbumLink(value),
    "Paste a Google Photos album link (photos.app.goo.gl/…)",
  ),
  linkedinUrl: optionalUrl,
  xUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  threadsUrl: optionalUrl,
  telegramUrl: optionalUrl,
  whatsappChannelUrl: optionalUrl,
  pinterestUrl: optionalUrl,
  snapchatUrl: optionalUrl,
  yelpUrl: optionalUrl,
  zillowUrl: optionalUrl,
  realtorUrl: optionalUrl,
  mapsUrl: optionalUrl,
  startingPrice: z.coerce
    .number()
    .int()
    .min(0)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  priceCurrency: z.enum(["USD", "INR"]).optional(),
  customQuote: z.coerce.boolean().optional(),
});

/**
 * The video box takes one link per line. A free card keeps the first; the rest
 * are held until the member upgrades rather than thrown away, so nothing they
 * typed disappears.
 */
function readVideoLinks(raw: string | undefined) {
  const links: string[] = [];
  for (const line of (raw ?? "").split(/[\n,]/)) {
    const link = line.trim();
    if (!link || links.includes(link)) continue;
    if (!isSupportedVideoUrl(link)) {
      return { error: `"${link}" is not a YouTube or Vimeo link.` };
    }
    links.push(link);
  }
  return { links };
}

function readProfileForm(formData: FormData) {
  const value = (key: string) => {
    const raw = formData.get(key);
    return typeof raw === "string" ? raw : "";
  };
  return profileSchema.safeParse({
    name: value("name"),
    profileType: value("profileType") || "BUSINESS",
    categorySlug: value("categorySlug"),
    subcategorySlug: value("subcategorySlug"),
    city: value("city"),
    state: value("state"),
    country: value("country"),
    description: value("description"),
    whatsappNumber: value("whatsappNumber"),
    phone: value("phone"),
    publicEmail: value("publicEmail"),
    address: value("address"),
    logoUrl: value("logoUrl"),
    websiteUrl: value("websiteUrl"),
    instagramUrl: value("instagramUrl"),
    facebookUrl: value("facebookUrl"),
    youtubeUrl: value("youtubeUrl"),
    videoUrl: value("videoUrl"),
    videoUrls: value("videoUrls"),
    albumUrl: value("albumUrl"),
    linkedinUrl: value("linkedinUrl"),
    xUrl: value("xUrl"),
    tiktokUrl: value("tiktokUrl"),
    threadsUrl: value("threadsUrl"),
    telegramUrl: value("telegramUrl"),
    whatsappChannelUrl: value("whatsappChannelUrl"),
    pinterestUrl: value("pinterestUrl"),
    snapchatUrl: value("snapchatUrl"),
    yelpUrl: value("yelpUrl"),
    zillowUrl: value("zillowUrl"),
    realtorUrl: value("realtorUrl"),
    mapsUrl: value("mapsUrl"),
    startingPrice: value("startingPrice") || undefined,
    priceCurrency: value("priceCurrency") || undefined,
    customQuote: formData.get("customQuote") === "on",
  });
}

export async function saveBusinessProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let slug: string;
  let staffEdit = false;
  let isNew = false;
  try {
    const user = await requireUser();
    const parsed = readProfileForm(formData);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    // Staff may edit any card straight from its page by posting its id.
    const targetId = String(formData.get("businessId") ?? "").trim();
    staffEdit = Boolean(targetId) && isStaff(user);
    if (targetId && !staffEdit)
      return { error: "You cannot edit that listing." };
    const target = staffEdit
      ? await db.business.findUnique({ where: { id: targetId } })
      : null;
    if (staffEdit && !target) return { error: "Listing not found." };

    if (
      !staffEdit &&
      effectivePlan(user) === "FREE" &&
      parsed.data.description
    ) {
      const kind = contactDetailKind(parsed.data.description);
      if (kind) {
        return {
          error: `Free listings cannot show a ${kind} in the description — customers reach you on WhatsApp. Upgrade to Pro to display your phone, email and website.`,
        };
      }
    }

    const category = await db.category.findUnique({
      where: { slug: parsed.data.categorySlug },
      include: { children: { select: { slug: true, name: true } } },
    });
    if (!category || category.parentSlug)
      return { error: "Choose a valid category." };

    const subcategory = parsed.data.subcategorySlug
      ? category.children.find(
          (child) => child.slug === parsed.data.subcategorySlug,
        )
      : undefined;
    if (parsed.data.subcategorySlug && !subcategory) {
      return {
        error: "That subcategory does not belong to the chosen category.",
      };
    }

    const extraLimit = staffEdit ? 20 : extraCategoryLimit(user);
    const wantedExtras = Array.from(
      new Set(
        formData.getAll("extraCategorySlugs").map(String).filter(Boolean),
      ),
    ).filter((slug) => slug !== category.slug && slug !== subcategory?.slug);
    if (wantedExtras.length > extraLimit) {
      return {
        error: extraLimit
          ? `Your plan covers ${extraLimit} extra categor${extraLimit === 1 ? "y" : "ies"} — remove ${wantedExtras.length - extraLimit}.`
          : "Extra categories are a paid feature — upgrade to list under more than one category.",
      };
    }
    const extraCategorySlugs = wantedExtras.length
      ? (
          await db.category.findMany({
            where: { slug: { in: wantedExtras }, parentSlug: { not: null } },
            select: { slug: true },
          })
        ).map((row) => row.slug)
      : [];

    const set = specialtySet(subcategory?.slug);
    const specialties = [
      ...cleanSpecialties(
        subcategory?.slug,
        formData.getAll("specialties").map(String),
      ),
      ...cleanCustomOptions(
        subcategory?.slug,
        String(formData.get("specialtiesOther") ?? ""),
      ),
    ];
    if (set && specialties.length === 0) {
      return { error: `${set.title}: pick at least one.` };
    }
    const wantedBadge = String(formData.get("featuredSpecialty") ?? "");
    const featuredSpecialty =
      (staffEdit || effectivePlan(user) !== "FREE") &&
      specialties.includes(wantedBadge)
        ? wantedBadge
        : null;

    const certifications = cleanCertifications(
      subcategory?.slug,
      formData.getAll("certifications").map(String),
      String(formData.get("certificationsOther") ?? ""),
    );
    // Radio groups post under their own name so one answer wins per group.
    const choiceValues = [
      ...formData.getAll("serviceOptions").map(String),
      ...(set?.choices ?? [])
        .filter((group) => group.mode === "single")
        .map((group) => String(formData.get(`choice-${group.key}`) ?? "")),
    ].filter(Boolean);
    const serviceOptions = cleanServiceOptions(subcategory?.slug, choiceValues);
    const missing = missingChoiceGroups(subcategory?.slug, serviceOptions);
    if (missing.length) {
      return { error: `${missing[0]}: pick an option.` };
    }

    const detail = (field: string) =>
      String(formData.get(field) ?? "").trim() || null;

    const licenseNumber = set
      ? String(formData.get("licenseNumber") ?? "").trim()
      : "";
    if (set?.license?.required && !licenseNumber) {
      return { error: `${set.license.label} is required.` };
    }
    const experienceRaw = set?.experience
      ? String(formData.get("yearsExperience") ?? "").trim()
      : "";
    const yearsExperience = experienceRaw ? Number(experienceRaw) : null;
    if (
      yearsExperience !== null &&
      (!Number.isInteger(yearsExperience) ||
        yearsExperience < 0 ||
        yearsExperience > 70)
    ) {
      return { error: "Years of experience must be between 0 and 70." };
    }

    const pasted = readVideoLinks(parsed.data.videoUrls);
    if ("error" in pasted) return { error: pasted.error };
    const videos = (
      pasted.links.length
        ? pasted.links
        : parsed.data.videoUrl
          ? [parsed.data.videoUrl]
          : []
    ).slice(0, staffEdit ? MAX_VIDEO_LIMIT : videoLimit(user));

    const data = {
      ...parsed.data,
      name: titleCase(parsed.data.name),
      city: titleCase(parsed.data.city),
      specialties,
      featuredSpecialty,
      certifications,
      licenseNumber: licenseNumber || null,
      feeStructure: set?.fee
        ? String(formData.get("feeStructure") ?? "").trim() || null
        : null,
      carriers: set?.carriers
        ? String(formData.get("carriers") ?? "").trim() || null
        : null,
      serviceOptions,
      priceFrom: set?.pricing ? detail("priceFrom") : null,
      priceHourly: set?.pricing ? detail("priceHourly") : null,
      priceExtra: set?.pricing ? detail("priceExtra") : null,
      availability: set?.availability ? detail("availability") : null,
      licenseDocUrl: set?.licenseDoc ? detail("licenseDocUrl") : null,
      yearsExperience,
      categorySlug: category.slug,
      subcategorySlug: subcategory?.slug ?? null,
      extraCategorySlugs,
      // Kept in sync for search snippets and legacy listings.
      category: subcategory?.name ?? category.name,
      state: parsed.data.state || null,
      country: parsed.data.country || null,
      description: parsed.data.description || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      publicEmail: parsed.data.publicEmail ?? null,
      logoUrl: parsed.data.logoUrl ?? null,
      websiteUrl: parsed.data.websiteUrl ?? null,
      instagramUrl: parsed.data.instagramUrl ?? null,
      facebookUrl: parsed.data.facebookUrl ?? null,
      youtubeUrl: parsed.data.youtubeUrl ?? null,
      videoUrl: videos[0] ?? null,
      videoUrls: videos,
      albumUrl: parsed.data.albumUrl ?? null,
      linkedinUrl: parsed.data.linkedinUrl ?? null,
      xUrl: parsed.data.xUrl ?? null,
      tiktokUrl: parsed.data.tiktokUrl ?? null,
      threadsUrl: parsed.data.threadsUrl ?? null,
      telegramUrl: parsed.data.telegramUrl ?? null,
      whatsappChannelUrl: parsed.data.whatsappChannelUrl ?? null,
      pinterestUrl: parsed.data.pinterestUrl ?? null,
      snapchatUrl: parsed.data.snapchatUrl ?? null,
      yelpUrl: parsed.data.yelpUrl ?? null,
      zillowUrl: parsed.data.zillowUrl ?? null,
      realtorUrl: parsed.data.realtorUrl ?? null,
      mapsUrl: parsed.data.mapsUrl ?? null,
      startingPrice: parsed.data.startingPrice ?? null,
      priceCurrency: parsed.data.startingPrice
        ? (parsed.data.priceCurrency ?? "USD")
        : null,
      customQuote: parsed.data.customQuote ?? false,
      whatsappNumber: normalizeWhatsApp(parsed.data.whatsappNumber),
    };

    const isVehicle = isVehicleCard(subcategory?.slug);
    const vehicle = isVehicle ? readVehicleForm(formData) : null;
    if (vehicle && "error" in vehicle) return { error: vehicle.error };

    const existing =
      target ?? (await db.business.findUnique({ where: { ownerId: user.id } }));
    isNew = !existing;
    let businessId: string;
    if (existing) {
      const updated = await db.business.update({
        where: { id: existing.id },
        data,
      });
      slug = updated.slug;
      businessId = updated.id;
    } else {
      const created = await db.business.create({
        data: {
          ...data,
          ownerId: user.id,
          slug: await uniqueSlug(data.name, data.city),
          status: autoApproveStatus(
            user,
            [data.name, data.description, data.category].join(" "),
          ),
        },
      });
      slug = created.slug;
      businessId = created.id;
      await awardPoints({
        userId: user.id,
        reason: "PROFILE_CREATED",
        once: true,
      });
    }

    if (vehicle && "data" in vehicle) {
      await db.vehicleDetails.upsert({
        where: { businessId },
        create: { businessId, ...vehicle.data },
        update: vehicle.data,
      });
    } else if (!isVehicle) {
      await db.vehicleDetails.deleteMany({ where: { businessId } });
    }
  } catch (error) {
    return fieldError(error);
  }
  revalidatePath("/dashboard");
  revalidatePath(`/b/${slug}`);
  pingIndexNowInBackground(`/b/${slug}`);
  invalidateDirectory();
  if (staffEdit) redirect(`/b/${slug}?saved=1`);
  // A first listing lands on a free confirmation, not on the price list.
  redirect(isNew ? "/dashboard?business=new" : "/dashboard?saved=1");
}

export async function addMediaAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const business = await db.business.findUnique({
      where: { ownerId: user.id },
    });
    if (!business) return { error: "Create your business profile first." };

    const url = String(formData.get("url") ?? "").trim();
    const type =
      String(formData.get("type") ?? "IMAGE") === "VIDEO" ? "VIDEO" : "IMAGE";
    const caption = String(formData.get("caption") ?? "").trim();
    if (!z.string().url().safeParse(url).success) {
      return { error: "Enter a valid media URL." };
    }

    const count = await db.media.count({ where: { businessId: business.id } });
    const limit = mediaLimit(user);
    if (count >= limit) {
      return {
        error: `Your ${user.plan} plan allows ${limit} gallery items. Upgrade to add more.`,
      };
    }

    await db.media.create({
      data: {
        businessId: business.id,
        url,
        type,
        caption: caption || null,
        sortOrder: count,
      },
    });
    revalidatePath("/dashboard/media");
    revalidatePath(`/b/${business.slug}`);
    return { success: "Media added." };
  } catch (error) {
    return fieldError(error);
  }
}

export async function deleteMediaAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const media = await db.media.findUnique({
    where: { id },
    include: { business: true },
  });
  if (!media || media.business.ownerId !== user.id)
    throw new Error("FORBIDDEN");
  await db.media.delete({ where: { id } });
  revalidatePath("/dashboard/media");
  revalidatePath(`/b/${media.business.slug}`);
}
