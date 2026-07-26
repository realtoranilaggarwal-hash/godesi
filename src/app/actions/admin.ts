"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ListingStatus, NewsStatus, Plan } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { HEADER_SLOTS, SIDEBAR_SLOTS } from "@/lib/banners";

export async function setListingStatusAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as ListingStatus;
  if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    throw new Error("Invalid status");
  }
  const business = await db.business.update({ where: { id }, data: { status } });
  revalidatePath("/admin");
  revalidatePath(`/b/${business.slug}`);
}

export async function setUserPlanAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  const plan = String(formData.get("plan") ?? "") as Plan;
  if (!["FREE", "PRO", "PREMIUM"].includes(plan)) throw new Error("Invalid plan");

  await db.user.update({
    where: { id },
    data: {
      plan,
      planExpiresAt:
        plan === "FREE" ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  await db.business.updateMany({
    where: { ownerId: id },
    data: { featured: plan !== "FREE" },
  });
  revalidatePath("/admin");
}

const bannerSchema = z.object({
  slot: z.enum(["SIDEBAR", "HEADER"]),
  position: z.coerce.number().int().min(1),
  title: z.string().trim().min(2, "Banner title is required"),
  imageUrl: z.string().trim().url("Enter a valid image URL"),
  linkUrl: z.string().trim().url("Enter a valid destination URL"),
});

export async function saveBannerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireRole("ADMIN");
    const parsed = bannerSchema.safeParse({
      slot: formData.get("slot"),
      position: formData.get("position"),
      title: formData.get("title"),
      imageUrl: formData.get("imageUrl"),
      linkUrl: formData.get("linkUrl"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const limit = parsed.data.slot === "SIDEBAR" ? SIDEBAR_SLOTS : HEADER_SLOTS;
    if (parsed.data.position > limit) {
      return { error: `${parsed.data.slot} has only ${limit} slot(s).` };
    }

    const { slot, position, ...rest } = parsed.data;
    await db.banner.upsert({
      where: { slot_position: { slot, position } },
      create: { slot, position, ...rest },
      update: { ...rest, active: true },
    });

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: `Banner saved in ${slot} slot ${position}.` };
  } catch (error) {
    return fieldError(error);
  }
}

export async function toggleBannerAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  const banner = await db.banner.findUnique({ where: { id } });
  if (!banner) throw new Error("Banner not found");
  await db.banner.update({ where: { id }, data: { active: !banner.active } });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteBannerAction(formData: FormData) {
  await requireRole("ADMIN");
  await db.banner.delete({ where: { id: String(formData.get("id") ?? "") } });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function setNewsStatusAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as NewsStatus;
  if (!["PENDING", "PUBLISHED", "REJECTED"].includes(status)) throw new Error("Invalid status");
  await db.newsItem.update({ where: { id }, data: { status } });
  revalidatePath("/admin");
  revalidatePath("/news");
}

export async function deleteNewsAction(formData: FormData) {
  await requireRole("ADMIN");
  await db.newsItem.delete({ where: { id: String(formData.get("id") ?? "") } });
  revalidatePath("/admin");
  revalidatePath("/news");
}

export async function saveNewsFeedAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireRole("ADMIN");
    const name = String(formData.get("name") ?? "").trim();
    const url = String(formData.get("url") ?? "").trim();
    if (name.length < 2) return { error: "Feed name is required." };
    if (!z.string().url().safeParse(url).success) return { error: "Enter a valid feed URL." };

    await db.newsFeed.upsert({
      where: { url },
      create: { name, url },
      update: { name, active: true },
    });
    revalidatePath("/admin");
    return { success: "Feed saved. It will be picked up on the next run." };
  } catch (error) {
    return fieldError(error);
  }
}

export async function deleteNewsFeedAction(formData: FormData) {
  await requireRole("ADMIN");
  await db.newsFeed.delete({ where: { id: String(formData.get("id") ?? "") } });
  revalidatePath("/admin");
}

export async function setEventStatusAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as ListingStatus;
  if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) throw new Error("Invalid status");
  const event = await db.event.update({ where: { id }, data: { status } });
  revalidatePath("/admin");
  revalidatePath("/events");
  revalidatePath(`/events/${event.slug}`);
}

export async function toggleFeaturedAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  const business = await db.business.findUnique({ where: { id } });
  if (!business) throw new Error("Business not found");
  await db.business.update({
    where: { id },
    data: { featured: !business.featured },
  });
  revalidatePath("/admin");
  revalidatePath(`/b/${business.slug}`);
}
