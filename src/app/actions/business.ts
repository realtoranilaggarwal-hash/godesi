"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { effectivePlan, mediaLimit } from "@/lib/plans";
import { cleanSpecialties, specialtySet } from "@/lib/specialties";
import { uniqueSlug } from "@/lib/slug";
import { normalizeWhatsApp } from "@/lib/format";
import { awardPoints } from "@/lib/rewards";
import { isSupportedVideoUrl } from "@/lib/video";

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
  description: z.string().trim().max(2000).optional(),
  whatsappNumber: z
    .string()
    .trim()
    .refine((v) => normalizeWhatsApp(v).length >= 10, "Enter a valid WhatsApp number"),
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
  try {
    const user = await requireUser();
    const parsed = readProfileForm(formData);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const category = await db.category.findUnique({
      where: { slug: parsed.data.categorySlug },
      include: { children: { select: { slug: true, name: true } } },
    });
    if (!category || category.parentSlug) return { error: "Choose a valid category." };

    const subcategory = parsed.data.subcategorySlug
      ? category.children.find((child) => child.slug === parsed.data.subcategorySlug)
      : undefined;
    if (parsed.data.subcategorySlug && !subcategory) {
      return { error: "That subcategory does not belong to the chosen category." };
    }

    const set = specialtySet(subcategory?.slug);
    const specialties = cleanSpecialties(
      subcategory?.slug,
      formData.getAll("specialties").map(String),
    );
    if (set && specialties.length === 0) {
      return { error: `${set.title}: pick at least one.` };
    }
    const wantedBadge = String(formData.get("featuredSpecialty") ?? "");
    const featuredSpecialty =
      effectivePlan(user) !== "FREE" && specialties.includes(wantedBadge)
        ? wantedBadge
        : null;

    const data = {
      ...parsed.data,
      specialties,
      featuredSpecialty,
      categorySlug: category.slug,
      subcategorySlug: subcategory?.slug ?? null,
      // Kept in sync for search snippets and legacy listings.
      category: subcategory?.name ?? category.name,
      state: parsed.data.state || null,
      description: parsed.data.description || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      publicEmail: parsed.data.publicEmail ?? null,
      logoUrl: parsed.data.logoUrl ?? null,
      websiteUrl: parsed.data.websiteUrl ?? null,
      instagramUrl: parsed.data.instagramUrl ?? null,
      facebookUrl: parsed.data.facebookUrl ?? null,
      youtubeUrl: parsed.data.youtubeUrl ?? null,
      videoUrl: parsed.data.videoUrl ?? null,
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
      priceCurrency: parsed.data.startingPrice ? (parsed.data.priceCurrency ?? "USD") : null,
      customQuote: parsed.data.customQuote ?? false,
      whatsappNumber: normalizeWhatsApp(parsed.data.whatsappNumber),
    };

    const existing = await db.business.findUnique({ where: { ownerId: user.id } });
    if (existing) {
      const updated = await db.business.update({
        where: { id: existing.id },
        data,
      });
      slug = updated.slug;
    } else {
      const created = await db.business.create({
        data: { ...data, ownerId: user.id, slug: await uniqueSlug(data.name, data.city) },
      });
      slug = created.slug;
      await awardPoints({ userId: user.id, reason: "PROFILE_CREATED", once: true });
    }
  } catch (error) {
    return fieldError(error);
  }
  revalidatePath("/dashboard");
  revalidatePath(`/b/${slug}`);
  redirect("/dashboard?saved=1");
}

export async function addMediaAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const business = await db.business.findUnique({ where: { ownerId: user.id } });
    if (!business) return { error: "Create your business profile first." };

    const url = String(formData.get("url") ?? "").trim();
    const type = String(formData.get("type") ?? "IMAGE") === "VIDEO" ? "VIDEO" : "IMAGE";
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
  const media = await db.media.findUnique({ where: { id }, include: { business: true } });
  if (!media || media.business.ownerId !== user.id) throw new Error("FORBIDDEN");
  await db.media.delete({ where: { id } });
  revalidatePath("/dashboard/media");
  revalidatePath(`/b/${media.business.slug}`);
}
