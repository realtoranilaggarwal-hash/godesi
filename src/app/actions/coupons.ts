"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { randomBytes } from "node:crypto";
import { type CouponTierLimit, normalizeCouponCode } from "@/lib/coupons";
import { compTicketEmail, emailEnabled, sendEmail } from "@/lib/email";
import { formatMoney, siteUrl } from "@/lib/format";
import { tierOnSale } from "@/lib/ticketTiers";

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
      if (!Number.isInteger(maxQuantity) || maxQuantity < 1 || maxQuantity > 10) {
        return { error: `Enter 1–10 for ${tier.name}, or leave it blank.` };
      }
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

export type CompTicketState = ActionState & {
  code?: string;
  items?: string;
  buyerEmail?: string;
  emailed?: boolean;
};

const compSchema = z.object({
  eventId: z.string().trim().min(1, "Choose the event."),
  buyerName: z.string().trim().min(2, "Enter the buyer's name.").max(80),
  buyerEmail: z.string().trim().email("Enter a valid buyer email."),
});

/** "COMP-PATEL-7K3QX9MD": surname (last word of the name) plus a random suffix. */
function compCode(buyerName: string) {
  const surname =
    buyerName
      .trim()
      .split(/\s+/)
      .pop()
      ?.toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 10) || "GUEST";
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const suffix = Array.from(randomBytes(8), (byte) => alphabet[byte % alphabet.length]).join("");
  return `COMP-${surname}-${suffix}`;
}

/**
 * Comp tickets for cash/Zelle buyers or guests: a one-use code worth exactly
 * the chosen tickets, emailed to the buyer, who books them on the site at $0.
 */
export async function sendCompTicketsAction(
  _prev: CompTicketState,
  formData: FormData,
): Promise<CompTicketState> {
  try {
    const user = await requireUser();
    const parsed = compSchema.safeParse({
      eventId: formData.get("eventId") ?? undefined,
      buyerName: formData.get("buyerName") ?? undefined,
      buyerEmail: formData.get("buyerEmail") ?? undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const event = await db.event.findUnique({
      where: { id: parsed.data.eventId },
      include: {
        /** Sponsorships check out on their own form, so comps cover entry tickets only. */
        tiers: { where: { kind: { not: "SPONSOR" } }, orderBy: { sortOrder: "asc" } },
        organizer: { select: { name: true } },
      },
    });
    if (!event || (event.organizerId !== user.id && user.role !== "ADMIN")) {
      return { error: "You can only send tickets for your own events." };
    }
    if (event.startsAt.getTime() < Date.now())
      return { error: "This event has already ended." };

    const options = event.tiers.length
      ? event.tiers.map((tier) => ({
          tierId: tier.id as string | null,
          name: tier.name,
          price: tier.price,
          tier,
        }))
      : [{ tierId: null, name: "Ticket", price: event.price, tier: null }];
    const picked: { tierId: string | null; name: string; quantity: number; price: number }[] = [];
    for (const option of options) {
      const raw = formData.get(`qty_${option.tierId ?? "base"}`);
      const quantity = Number(raw || 0);
      if (!Number.isInteger(quantity) || quantity < 0 || quantity > 10)
        return { error: "Enter a whole number of tickets (0–10) for each type." };
      if (!quantity) continue;
      if (option.tier && !tierOnSale(option.tier))
        return {
          error: `${option.name} is not on sale right now, so the buyer could not select it. Pick a type that is on sale.`,
        };
      picked.push({ tierId: option.tierId, name: option.name, quantity, price: option.price });
    }
    const totalQuantity = picked.reduce((sum, tier) => sum + tier.quantity, 0);
    if (!totalQuantity) return { error: "Enter how many of each ticket to send." };
    if (totalQuantity > 10) return { error: "Maximum 10 tickets per booking." };

    const total = picked.reduce((sum, tier) => sum + tier.price * tier.quantity, 0);
    if (total <= 0)
      return { error: "Those tickets are free — the buyer can book them directly, no code needed." };

    /** Events without ticket types have nothing to lock; the fixed amount is the guard there. */
    const tierLimits: CouponTierLimit[] = picked.flatMap(({ tierId, name, quantity }) =>
      tierId ? [{ tierId, name, maxQuantity: quantity }] : [],
    );

    let code = "";
    for (let attempt = 0; attempt < 5 && !code; attempt += 1) {
      const candidate = compCode(parsed.data.buyerName);
      if (!(await db.coupon.findUnique({ where: { code: candidate } }))) code = candidate;
    }
    if (!code) return { error: "Could not make a unique code. Please try again." };

    await db.coupon.create({
      data: {
        code,
        scope: "TICKETS",
        discountKind: "FIXED",
        amount: total,
        currency: event.currency,
        eventId: event.id,
        createdById: user.id,
        maxRedemptions: 1,
        tierLimits: tierLimits.length ? tierLimits : undefined,
      },
    });

    const items = picked.map((tier) => `${tier.quantity} × ${tier.name}`);
    const mail = compTicketEmail({
      eventTitle: event.title,
      eventUrl: `${siteUrl()}/events/${event.slug}`,
      buyerName: parsed.data.buyerName,
      items,
      code,
      organizerName: event.organizer?.name,
      currency: event.currency,
    });
    const emailed =
      emailEnabled() &&
      (await sendEmail({
        to: parsed.data.buyerEmail,
        subject: mail.subject,
        html: mail.html,
        replyTo: user.email,
      }));

    revalidatePath("/dashboard/coupons");
    revalidatePath("/admin/coupons");
    const summary = items.join(", ");
    return {
      code,
      items: summary,
      buyerEmail: parsed.data.buyerEmail,
      emailed,
      success: emailed
        ? `Code ${code} (${formatMoney(total, event.currency)} off, ${summary}) was emailed to ${parsed.data.buyerEmail}.`
        : undefined,
      error: emailed
        ? undefined
        : `Code ${code} was created, but the email to ${parsed.data.buyerEmail} could not be sent — text or WhatsApp the code to the buyer yourself.`,
    };
  } catch (error) {
    return fieldError(error);
  }
}
