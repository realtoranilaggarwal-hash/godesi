import type { GigOrder, GigOrderStatus, GigTier } from "@prisma/client";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { notify } from "@/lib/notifications";
import { getStripe, stripeEnabled } from "@/lib/stripe";

/** Whole dollars. Small enough that a dispute stays small. */
export const GIG_MIN_USD = 5;
export const GIG_MAX_USD = 100;

/** Godesi keeps this much of every paid gig; the seller gets the rest. */
export const GIG_FEE_USD = 2;

/**
 * Stripe's published US card rate, quoted on the site so the seller sees where
 * the $2 goes. Update here if the processor changes it.
 */
export const CARD_RATE_PERCENT = 2.9;
export const CARD_RATE_FIXED_USD = 0.3;

/** Days the buyer has to object after a delivery before the money moves. */
export const AUTO_RELEASE_DAYS = 7;

export const MAX_DELIVERY_DAYS = 30;
export const MAX_GIGS_PER_SELLER = 10;
export const MAX_REVISIONS = 10;
export const MAX_GIG_IMAGES = 5;
export const MAX_GIG_TAGS = 5;
export const MAX_GIG_FAQ = 5;

export const TIERS: GigTier[] = ["BASIC", "STANDARD", "PREMIUM"];
export const TIER_LABEL: Record<GigTier, string> = {
  BASIC: "Basic",
  STANDARD: "Standard",
  PREMIUM: "Premium",
};

export type GigFaq = { q: string; a: string };

/** The seller's FAQ is stored as JSON; anything malformed is dropped. */
export function faqList(value: unknown): GigFaq[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const q = "q" in item ? item.q : null;
    const a = "a" in item ? item.a : null;
    return typeof q === "string" && typeof a === "string" && q && a
      ? [{ q, a }]
      : [];
  });
}

export function averageRating(sum: number, count: number) {
  return count ? Math.round((sum / count) * 10) / 10 : 0;
}

export function gigFeeMinor() {
  return GIG_FEE_USD * 100;
}

export function sellerShareMinor(priceMinor: number) {
  return Math.max(0, priceMinor - gigFeeMinor());
}

/** What the card processor takes from a price, so the fee note can show the sum. */
export function cardCostUsd(priceUsd: number) {
  return (priceUsd * CARD_RATE_PERCENT) / 100 + CARD_RATE_FIXED_USD;
}

export function usd(minor: number) {
  return `$${(minor / 100).toFixed(minor % 100 === 0 ? 0 : 2)}`;
}

export const ORDER_LABEL: Record<GigOrderStatus, string> = {
  PENDING: "Awaiting payment",
  PAID: "In progress",
  DELIVERED: "Delivered — awaiting buyer",
  RELEASED: "Complete",
  DISPUTED: "In dispute",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
};

export const ORDER_TONE: Record<
  GigOrderStatus,
  "slate" | "green" | "amber" | "indigo" | "red"
> = {
  PENDING: "slate",
  PAID: "indigo",
  DELIVERED: "amber",
  RELEASED: "green",
  DISPUTED: "red",
  REFUNDED: "slate",
  CANCELLED: "slate",
};

export async function uniqueGigSlug(title: string, sellerName: string) {
  const base = slugify(`${title} ${sellerName}`) || "gig";
  let candidate = base;
  let counter = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await db.gig.findUnique({ where: { slug: candidate } })) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  return candidate;
}

export function includesList(includes: string | null) {
  return (includes ?? "")
    .split(/\n+/)
    .map((line) => line.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);
}

function addDays(from: Date, days: number) {
  return new Date(from.getTime() + days * 86_400_000);
}

/**
 * Marks an order paid once Stripe says so. Idempotent: the webhook and the
 * success page both call it, and only the first flips PENDING → PAID.
 */
export async function confirmGigOrder({
  orderId,
  sessionId,
  paymentIntentId,
}: {
  orderId: string;
  sessionId: string;
  paymentIntentId: string | null;
}) {
  const order = await db.gigOrder.findUnique({
    where: { id: orderId },
    include: { gig: { select: { title: true } } },
  });
  if (!order) return null;
  if (order.status !== "PENDING") return order;

  const now = new Date();
  const claimed = await db.gigOrder.updateMany({
    where: { id: order.id, status: "PENDING" },
    data: {
      status: "PAID",
      stripeSessionId: sessionId,
      stripePaymentIntentId: paymentIntentId,
      paidAt: now,
      dueAt: addDays(now, order.deliveryDays),
    },
  });
  if (claimed.count === 0) {
    return db.gigOrder.findUnique({ where: { id: order.id } });
  }

  const seller = await db.user.findUnique({
    where: { id: order.sellerId },
    select: { stripePayoutsEnabled: true },
  });
  await notify({
    userId: order.sellerId,
    title: `New order: ${order.gig.title}`,
    body: `${usd(order.priceMinor)} paid${order.packageName ? ` (${order.packageName})` : ""}. Deliver within ${order.deliveryDays} day(s) and you receive ${usd(order.sellerMinor)}.${
      seller?.stripePayoutsEnabled
        ? ""
        : " Connect your Stripe account under Payouts so it is paid to you automatically."
    }`,
    href: `/gigs/orders/${order.id}`,
  });
  await notify({
    userId: order.buyerId,
    title: `Order placed: ${order.gig.title}`,
    body: "Your payment is held by Godesi until you confirm the work is done.",
    href: `/gigs/orders/${order.id}`,
  });

  return db.gigOrder.findUnique({ where: { id: order.id } });
}

/**
 * Moves the seller's share to their connected Stripe account. When the seller
 * has no connected account the order is still marked released and the share is
 * owed — settled by hand from the admin desk, as event payouts are.
 */
export async function releaseGigOrder(
  order: GigOrder,
  { resolution }: { resolution?: string } = {},
) {
  const claimed = await db.gigOrder.updateMany({
    where: { id: order.id, status: { in: ["PAID", "DELIVERED", "DISPUTED"] } },
    data: {
      status: "RELEASED",
      releasedAt: new Date(),
      ...(resolution ? { resolution } : {}),
    },
  });
  if (claimed.count === 0) return null;

  const seller = await db.user.findUnique({
    where: { id: order.sellerId },
    select: { stripeAccountId: true, stripePayoutsEnabled: true },
  });

  let transferId: string | null = null;
  if (
    stripeEnabled() &&
    seller?.stripeAccountId &&
    seller.stripePayoutsEnabled &&
    order.sellerMinor > 0
  ) {
    try {
      const transfer = await getStripe().transfers.create(
        {
          amount: order.sellerMinor,
          currency: order.currency.toLowerCase(),
          destination: seller.stripeAccountId,
          ...(order.stripePaymentIntentId
            ? { transfer_group: order.stripePaymentIntentId }
            : {}),
          metadata: { kind: "gig", orderId: order.id },
        },
        { idempotencyKey: `gig-release-${order.id}` },
      );
      transferId = transfer.id;
    } catch {
      // Left without a transfer id: the admin desk lists it as owed.
    }
  }

  if (transferId) {
    await db.gigOrder.update({
      where: { id: order.id },
      data: { stripeTransferId: transferId },
    });
  }

  await notify({
    userId: order.sellerId,
    title: `Paid: ${usd(order.sellerMinor)}`,
    body: transferId
      ? "Sent to your Stripe account. Stripe pays it out on your normal schedule."
      : "Connect a Stripe account under Payouts to receive this; until then it is owed to you.",
    href: transferId ? `/gigs/orders/${order.id}` : "/dashboard/payouts",
  });

  return db.gigOrder.findUnique({ where: { id: order.id } });
}

/** Refunds the buyer in full and closes the order. */
export async function refundGigOrder(order: GigOrder, resolution: string) {
  const claimed = await db.gigOrder.updateMany({
    where: { id: order.id, status: { in: ["PAID", "DELIVERED", "DISPUTED"] } },
    data: { status: "REFUNDED", resolution },
  });
  if (claimed.count === 0) return null;

  let refundId: string | null = null;
  if (stripeEnabled() && order.stripePaymentIntentId) {
    const refund = await getStripe().refunds.create(
      { payment_intent: order.stripePaymentIntentId },
      { idempotencyKey: `gig-refund-${order.id}` },
    );
    refundId = refund.id;
  }
  if (refundId) {
    await db.gigOrder.update({
      where: { id: order.id },
      data: { stripeRefundId: refundId },
    });
  }

  await notify({
    userId: order.buyerId,
    title: "Order refunded",
    body: `${usd(order.priceMinor)} is on its way back to your card (5–10 days).`,
    href: `/gigs/orders/${order.id}`,
  });
  await notify({
    userId: order.sellerId,
    title: "Order refunded to the buyer",
    body: resolution,
    href: `/gigs/orders/${order.id}`,
  });
  return db.gigOrder.findUnique({ where: { id: order.id } });
}

/** Delivered orders the buyer never answered: pay the seller. Run by cron. */
export async function autoReleaseDueOrders() {
  const due = await db.gigOrder.findMany({
    where: { status: "DELIVERED", autoReleaseAt: { lte: new Date() } },
    take: 50,
  });
  let released = 0;
  for (const order of due) {
    // eslint-disable-next-line no-await-in-loop
    const result = await releaseGigOrder(order, {
      resolution: `Released automatically ${AUTO_RELEASE_DAYS} days after delivery.`,
    });
    if (result) released += 1;
  }
  return { checked: due.length, released };
}

export function autoReleaseDate(from = new Date()) {
  return addDays(from, AUTO_RELEASE_DAYS);
}

export const GIG_SELECT = {
  id: true,
  slug: true,
  title: true,
  description: true,
  includes: true,
  priceMinor: true,
  deliveryDays: true,
  images: true,
  tags: true,
  faq: true,
  ratingSum: true,
  ratingCount: true,
  status: true,
  packages: {
    select: {
      id: true,
      tier: true,
      name: true,
      description: true,
      includes: true,
      priceMinor: true,
      deliveryDays: true,
      revisions: true,
    },
  },
  seller: {
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
      headline: true,
      location: true,
      createdAt: true,
    },
  },
} as const;

/** Packages in Basic → Premium order regardless of insertion. */
export function sortPackages<T extends { tier: GigTier }>(packages: T[]) {
  return [...packages].sort(
    (a, b) => TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier),
  );
}

/** Seller-level trust numbers shown in the gig header, from real orders. */
export async function sellerStats(sellerId: string) {
  const [completed, rating, active] = await Promise.all([
    db.gigOrder.count({ where: { sellerId, status: "RELEASED" } }),
    db.gig.aggregate({
      where: { sellerId, status: { not: "REMOVED" } },
      _sum: { ratingSum: true, ratingCount: true },
    }),
    db.gigOrder.count({
      where: { sellerId, status: { in: ["PAID", "DELIVERED"] } },
    }),
  ]);
  const sum = rating._sum.ratingSum ?? 0;
  const count = rating._sum.ratingCount ?? 0;
  return {
    completed,
    inProgress: active,
    ratingCount: count,
    rating: averageRating(sum, count),
  };
}
