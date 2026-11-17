"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { randomBytes } from "node:crypto";
import { type CouponTierLimit, normalizeCouponCode } from "@/lib/coupons";
import { compTicketEmail, emailEnabled, sendEmail } from "@/lib/email";
import { formatMoney } from "@/lib/format";

const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Code must be at least 3 characters")
    .max(24, "Keep the code under 24 characters")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers and dashes only"),
  scope: z.enum(["PLAN", "ADS", "TICKETS", "BUNDLE", "WEBSITE"]),
  discountKind: z.enum(["PERCENT", "FIXED"]),
  amount: z.coerce.number().int().min(0).default(0),
  bonusMonths: z.coerce.number().int().min(0).max(120).default(0),
  publicOffer: z.coerce.boolean().default(false),
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
    publicOffer: formData.get("publicOffer") === "on",
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

    /** Ticket codes can be locked to one event and, optionally, to some of its ticket types. */
    const event =
      parsed.data.scope === "TICKETS" && parsed.data.eventId
        ? await db.event.findUnique({
            where: { id: parsed.data.eventId },
            select: {
              id: true,
              title: true,
              currency: true,
              tiers: {
                orderBy: { sortOrder: "asc" },
                select: { id: true, name: true },
              },
            },
          })
        : null;
    if (parsed.data.scope === "TICKETS" && parsed.data.eventId && !event) {
      return { error: "That event no longer exists." };
    }
    const tierLimits: CouponTierLimit[] = [];
    for (const tier of event?.tiers ?? []) {
      const raw = String(formData.get(`tierMax_${tier.id}`) ?? "").trim();
      if (!raw) continue;
      const maxQuantity = Number(raw);
      if (!Number.isInteger(maxQuantity) || maxQuantity < 0 || maxQuantity > 10) {
        return { error: `Enter 1–10 for ${tier.name}, or leave it blank.` };
      }
      if (maxQuantity > 0)
        tierLimits.push({ tierId: tier.id, name: tier.name, maxQuantity });
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
        publicOffer: parsed.data.publicOffer,
        currency:
          parsed.data.discountKind === "FIXED"
            ? event?.currency ?? parsed.data.currency
            : null,
        eventId: event?.id ?? null,
        tierLimits: tierLimits.length ? tierLimits : undefined,
        maxRedemptions: parsed.data.maxRedemptions ?? null,
        expiresAt: parsed.data.expiresAt
          ? new Date(parsed.data.expiresAt)
          : null,
      },
    });

    revalidatePath("/admin/coupons");
    return {
      success: event
        ? `Coupon ${code} created for ${event.title}.`
        : `Coupon ${code} created.`,
    };
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

export type CompTicketsState = ActionState & {
  code?: string;
  emailed?: boolean;
};

const compSchema = z.object({
  eventId: z.string().min(1, "Choose the event."),
  email: z.string().trim().toLowerCase().email("Enter the buyer's email."),
  name: z.string().trim().min(1, "Enter the buyer's name.").max(80),
  discountKind: z.enum(["PERCENT", "FIXED"]),
  amount: z.coerce.number().int().min(1).optional(),
});

/** COMP-SHARMA-7K3Q: the buyer's surname plus a random suffix, retried on a clash. */
async function uniqueCompCode(name: string) {
  const surname =
    (name.trim().split(/\s+/).pop() ?? "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 12) || "GUEST";
  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = randomBytes(3).toString("hex").toUpperCase().slice(0, 4);
    const code = `COMP-${surname}-${suffix}`;
    if (!(await db.coupon.findUnique({ where: { code } }))) return code;
  }
  throw new Error("Could not make a unique code — please try again.");
}

/**
 * Organisers (and admins) send a buyer complimentary tickets: a one-use code
 * covering exactly the chosen tickets, emailed to the buyer.
 */
export async function sendCompTicketsAction(
  _prev: CompTicketsState,
  formData: FormData,
): Promise<CompTicketsState> {
  try {
    const user = await requireUser();
    const parsed = compSchema.safeParse({
      eventId: formData.get("eventId") ?? undefined,
      email: formData.get("email") ?? undefined,
      name: formData.get("name") ?? undefined,
      discountKind: formData.get("discountKind") ?? undefined,
      amount: String(formData.get("amount") ?? "").trim() || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const event = await db.event.findUnique({
      where: { id: parsed.data.eventId },
      select: {
        id: true,
        slug: true,
        title: true,
        currency: true,
        organizerId: true,
        tiers: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, price: true },
        },
      },
    });
    if (!event || (event.organizerId !== user.id && user.role !== "ADMIN")) {
      return { error: "You can only send tickets for your own events." };
    }

    const tierLimits: CouponTierLimit[] = [];
    let totalMajor = 0;
    for (const tier of event.tiers) {
      const raw = String(formData.get(`compQty_${tier.id}`) ?? "").trim();
      if (!raw) continue;
      const quantity = Number(raw);
      if (!Number.isInteger(quantity) || quantity < 0 || quantity > 10) {
        return { error: `Enter 0–10 for ${tier.name}.` };
      }
      if (!quantity) continue;
      tierLimits.push({ tierId: tier.id, name: tier.name, maxQuantity: quantity });
      totalMajor += tier.price * quantity;
    }
    if (!tierLimits.length) {
      return { error: "Enter how many of at least one ticket type." };
    }

    const fixed = parsed.data.discountKind === "FIXED";
    const amount = fixed ? parsed.data.amount ?? totalMajor : 100;
    if (fixed && amount <= 0) {
      return { error: "These tickets are already free — use 100% off." };
    }

    const code = await uniqueCompCode(parsed.data.name);
    await db.coupon.create({
      data: {
        code,
        scope: "TICKETS",
        discountKind: fixed ? "FIXED" : "PERCENT",
        amount,
        currency: fixed ? event.currency : null,
        eventId: event.id,
        createdById: user.id,
        maxRedemptions: 1,
        tierLimits,
      },
    });
    revalidatePath("/dashboard/coupons");
    revalidatePath("/admin/coupons");

    const items = tierLimits.map(
      (limit) => `${limit.maxQuantity} × ${limit.name}`,
    );
    const message = compTicketEmail({
      name: parsed.data.name,
      eventTitle: event.title,
      eventSlug: event.slug,
      items,
      code,
      fixedAmount: fixed ? formatMoney(amount, event.currency) : undefined,
    });
    const emailed = emailEnabled()
      ? await sendEmail({
          to: parsed.data.email,
          subject: message.subject,
          html: message.html,
          replyTo: user.email,
        })
      : false;

    return emailed
      ? {
          code,
          emailed,
          success: `Code ${code} (${items.join(" + ")}) emailed to ${parsed.data.email}.`,
        }
      : {
          code,
          emailed,
          error: `Code ${code} was created, but the email to ${parsed.data.email} could not be sent — text them the code instead.`,
        };
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
