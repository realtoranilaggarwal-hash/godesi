"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { mediaLimit } from "@/lib/plans";
import { uniqueSlug } from "@/lib/slug";
import { normalizeWhatsApp } from "@/lib/format";

const optionalUrl = z
  .string()
  .trim()
  .url("Enter a valid URL")
  .optional()
  .or(z.literal("").transform(() => undefined));

const profileSchema = z.object({
  name: z.string().trim().min(2, "Business name is required"),
  category: z.string().trim().min(2, "Category is required"),
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
  mapsUrl: optionalUrl,
});

function readProfileForm(formData: FormData) {
  const value = (key: string) => {
    const raw = formData.get(key);
    return typeof raw === "string" ? raw : "";
  };
  return profileSchema.safeParse({
    name: value("name"),
    category: value("category"),
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
    mapsUrl: value("mapsUrl"),
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

    const data = {
      ...parsed.data,
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
      mapsUrl: parsed.data.mapsUrl ?? null,
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
