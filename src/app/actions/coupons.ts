"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { normalizeCouponCode } from "@/lib/coupons";

const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Code must be at least 3 characters")
    .max(24, "Keep the code under 24 characters")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers and dashes only"),
  scope: z.enum(["PLAN", "ADS", "TICKETS", "BUNDLE"]),
  discountKind: z.enum(["PERCENT", "FIXED"]),
  amount: z.coerce.number().int().min(0).default(0),
  bonusMonths: z.coerce.number().int().min(0).max(120).default(0),
  currency: z.enum(["INR", "USD"]).optional(),
  eventId: z.string().trim().optional(),
  maxRedemptions: z.coerce.number().int().min(1).optional(),
  expiresAt: z.string().trim().optional(),
});

function parseCoupon(formData: FormData) {
  return couponSchema.safeParse({
    code: formData.get("code"),
    scope: formData.get("scope") || "PLAN",
    discountKind: formData.get("discountKind") || "PERCENT",
    amount: formData.get("amount") || 0,
    bonusMonths: formData.get("bonusMonths") || 0,
    currency: formData.get("currency") || undefined,
    eventId: formData.get("eventId") || undefined,
    maxRedemptions: formData.get("maxRedemptions") || undefined,
    expiresAt: formData.get("expiresAt") || undefined,
  });
}

/** Platform-wide code an admin can hand to clients. */
export async function createCouponAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireRole("ADMIN");
    const parsed = parseCoupon(formData);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    if (parsed.data.discountKind === "PERCENT" && parsed.data.amount > 100) {
      return { error: "A percentage discount cannot be more than 100." };
    }
    if (parsed.data.discountKind === "FIXED" && !parsed.data.currency) {
      return { error: "Pick the currency for a fixed-amount coupon." };
    }
    if (!parsed.data.amount && !parsed.data.bonusMonths) {
      return { error: "Give the code a discount, extra months, or both." };
    }

    const code = normalizeCouponCode(parsed.data.code);
    const clash = await db.coupon.findUnique({ where: { code } });
    if (clash) return { error: "That code already exists." };

    await db.coupon.create({
      data: {
        code,
        scope: parsed.data.scope,
        discountKind: parsed.data.discountKind,
        amount: parsed.data.amount,
        bonusMonths: parsed.data.bonusMonths,
        currency:
          parsed.data.discountKind === "FIXED" ? parsed.data.currency : null,
        maxRedemptions: parsed.data.maxRedemptions ?? null,
        expiresAt: parsed.data.expiresAt
          ? new Date(parsed.data.expiresAt)
          : null,
      },
    });

    revalidatePath("/admin/coupons");
    return { success: `Coupon ${code} created.` };
  } catch (error) {
    return fieldError(error);
  }
}

/** Organisers create codes for their own event, to pass on to their customers. */
export async function createEventCouponAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = parseCoupon(formData);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    if (!parsed.data.eventId)
      return { error: "Choose which event the coupon is for." };
    if (!parsed.data.amount)
      return { error: "Discount must be more than zero." };
    if (parsed.data.discountKind === "PERCENT" && parsed.data.amount > 100) {
      return { error: "A percentage discount cannot be more than 100." };
    }

    const event = await db.event.findUnique({
      where: { id: parsed.data.eventId },
    });
    if (!event || (event.organizerId !== user.id && user.role !== "ADMIN")) {
      return { error: "You can only create coupons for your own events." };
    }

    const code = normalizeCouponCode(parsed.data.code);
    const clash = await db.coupon.findUnique({ where: { code } });
    if (clash) return { error: "That code is taken — try another." };

    await db.coupon.create({
      data: {
        code,
        scope: "TICKETS",
        discountKind: parsed.data.discountKind,
        amount: parsed.data.amount,
        currency: parsed.data.discountKind === "FIXED" ? event.currency : null,
        eventId: event.id,
        createdById: user.id,
        maxRedemptions: parsed.data.maxRedemptions ?? null,
        expiresAt: parsed.data.expiresAt
          ? new Date(parsed.data.expiresAt)
          : null,
      },
    });

    revalidatePath("/dashboard/coupons");
    return { success: `Coupon ${code} is live for ${event.title}.` };
  } catch (error) {
    return fieldError(error);
  }
}

/** Switching a code off keeps its history but stops new redemptions. */
export async function toggleCouponAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const coupon = await db.coupon.findUnique({ where: { id } });
  if (!coupon) throw new Error("NOT_FOUND");
  if (user.role !== "ADMIN" && coupon.createdById !== user.id)
    throw new Error("FORBIDDEN");

  await db.coupon.update({ where: { id }, data: { active: !coupon.active } });
  revalidatePath("/admin/coupons");
  revalidatePath("/dashboard/coupons");
}
