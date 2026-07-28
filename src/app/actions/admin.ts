"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ListingStatus, NewsStatus, Plan } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole, requireStaff } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { slotCapacity } from "@/lib/banners";
import { isSupportedVideoUrl } from "@/lib/video";

export async function setListingStatusAction(formData: FormData) {
  await requireStaff();
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
  slot: z.enum(["HERO", "SIDEBAR", "HEADER", "SKYSCRAPER"]),
  position: z.coerce.number().int().min(1),
  title: z.string().trim().min(2, "Banner title is required"),
  imageUrl: z.string().trim().url("Enter a valid image URL"),
  linkUrl: z.string().trim().url("Enter a valid destination URL"),
  impressionCap: z.coerce.number().int().min(1).optional(),
  endsAt: z.coerce.date().optional(),
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
      impressionCap: formData.get("impressionCap") || undefined,
      endsAt: formData.get("endsAt") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const limit = slotCapacity(parsed.data.slot);
    if (parsed.data.position > limit) {
      return { error: `${parsed.data.slot} has only ${limit} slot(s).` };
    }

    const { slot, position, impressionCap, endsAt, ...rest } = parsed.data;
    const schedule = {
      impressionCap: impressionCap ?? null,
      endsAt: endsAt ?? null,
      startsAt: new Date(),
    };
    await db.banner.upsert({
      where: { slot_position: { slot, position } },
      create: { slot, position, ...rest, ...schedule, status: "ACTIVE" },
      update: { ...rest, ...schedule, active: true, status: "ACTIVE" },
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

/** Approves a paid ad: assigns it a free slot number and switches it live. */
export async function approveBannerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireRole("ADMIN");
    const id = String(formData.get("id") ?? "");
    const requested = Number(formData.get("position") ?? 0);

    const banner = await db.banner.findUnique({ where: { id } });
    if (!banner) return { error: "Banner not found." };

    const capacity = slotCapacity(banner.slot);
    let position = Number.isInteger(requested) && requested > 0 ? requested : null;

    if (position && position > capacity) {
      return { error: `${banner.slot} has only ${capacity} slot(s).` };
    }

    if (!position) {
      const used = await db.banner.findMany({
        where: { slot: banner.slot, NOT: { id: banner.id }, position: { not: null } },
        select: { position: true },
      });
      const taken = new Set(used.map((row) => row.position));
      for (let candidate = 1; candidate <= capacity; candidate += 1) {
        if (!taken.has(candidate)) {
          position = candidate;
          break;
        }
      }
      if (!position) return { error: `All ${banner.slot} slots are occupied.` };
    }

    const occupant = await db.banner.findUnique({
      where: { slot_position: { slot: banner.slot, position } },
    });
    if (occupant && occupant.id !== banner.id) {
      return { error: `${banner.slot} slot ${position} is already taken.` };
    }

    await db.banner.update({
      where: { id: banner.id },
      data: { position, status: "ACTIVE", active: true },
    });

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: `Ad approved in ${banner.slot} slot ${position}.` };
  } catch (error) {
    return fieldError(error);
  }
}

export async function rejectBannerAction(formData: FormData) {
  await requireRole("ADMIN");
  await db.banner.update({
    where: { id: String(formData.get("id") ?? "") },
    data: { status: "REJECTED", active: false, position: null },
  });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function setNewsStatusAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as NewsStatus;
  if (!["PENDING", "PUBLISHED", "REJECTED"].includes(status)) throw new Error("Invalid status");
  await db.newsItem.update({ where: { id }, data: { status } });
  revalidatePath("/admin");
  revalidatePath("/news");
}

export async function deleteNewsAction(formData: FormData) {
  await requireStaff();
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
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as ListingStatus;
  if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) throw new Error("Invalid status");
  const event = await db.event.update({ where: { id }, data: { status } });
  revalidatePath("/admin");
  revalidatePath("/events");
  revalidatePath(`/events/${event.slug}`);
}

const adminEventSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(5, "Give the event a clear title"),
  description: z.string().trim().min(20, "Describe the event (20+ characters)"),
  date: z.string().trim().min(1, "Event date is required"),
  time: z.string().trim().min(1, "Event time is required"),
  venue: z.string().trim().min(3, "Venue is required"),
  city: z.string().trim().min(2, "City is required"),
  categorySlug: z.string().trim().optional(),
  subcategorySlug: z.string().trim().optional(),
  price: z.coerce.number().int().min(0, "Price cannot be negative"),
  currency: z.enum(["INR", "USD"]),
  seatsTotal: z.coerce.number().int().min(1, "At least 1 seat is required"),
  imageUrl: z
    .string()
    .trim()
    .url("Enter a valid image URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  videoUrl: z
    .string()
    .trim()
    .url("Enter a valid video URL")
    .optional()
    .or(z.literal("").transform(() => undefined))
    .refine(
      (value) => !value || isSupportedVideoUrl(value),
      "Paste a YouTube or Vimeo video link",
    ),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

/** Full admin edit of any event — dates, pricing, seats, artwork and status. */
export async function adminUpdateEventAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireStaff();
    const parsed = adminEventSchema.safeParse({
      id: formData.get("id"),
      title: formData.get("title"),
      description: formData.get("description"),
      date: formData.get("date"),
      time: formData.get("time"),
      venue: formData.get("venue"),
      city: formData.get("city"),
      categorySlug: formData.get("categorySlug"),
      subcategorySlug: formData.get("subcategorySlug"),
      price: formData.get("price") || 0,
      currency: formData.get("currency") || "INR",
      seatsTotal: formData.get("seatsTotal") || 1,
      imageUrl: formData.get("imageUrl"),
      videoUrl: formData.get("videoUrl"),
      status: formData.get("status"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const startsAt = new Date(`${parsed.data.date}T${parsed.data.time}:00+05:30`);
    if (Number.isNaN(startsAt.getTime())) return { error: "Enter a valid date and time." };

    const existing = await db.event.findUnique({
      where: { id: parsed.data.id },
      select: { seatsBooked: true },
    });
    if (!existing) return { error: "Event not found." };
    if (parsed.data.seatsTotal < existing.seatsBooked) {
      return {
        error: `${existing.seatsBooked} seats are already booked — seats cannot go below that.`,
      };
    }

    const event = await db.event.update({
      where: { id: parsed.data.id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        startsAt,
        venue: parsed.data.venue,
        city: parsed.data.city,
        imageUrl: parsed.data.imageUrl ?? null,
        videoUrl: parsed.data.videoUrl ?? null,
        price: parsed.data.price,
        currency: parsed.data.currency,
        seatsTotal: parsed.data.seatsTotal,
        status: parsed.data.status,
        categorySlug: parsed.data.subcategorySlug || parsed.data.categorySlug || null,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/events");
    revalidatePath(`/events/${event.slug}`);
    return { success: "Event updated." };
  } catch (error) {
    return fieldError(error);
  }
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
