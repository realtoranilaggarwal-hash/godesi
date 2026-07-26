"use server";

import { revalidatePath } from "next/cache";
import type { ListingStatus, Plan } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

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
