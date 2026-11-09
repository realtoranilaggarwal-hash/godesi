import { db } from "@/lib/db";

export const sponsorSelect = {
  id: true,
  status: true,
  offer: true,
  message: true,
  sortOrder: true,
  createdAt: true,
  coupon: {
    select: {
      code: true,
      discountKind: true,
      amount: true,
      active: true,
      currency: true,
    },
  },
  business: {
    select: {
      slug: true,
      name: true,
      logoUrl: true,
      category: true,
      city: true,
      publicEmail: true,
      owner: { select: { email: true, avatarUrl: true } },
    },
  },
} as const;

export function sponsorsForEvent(eventId: string, approvedOnly = true) {
  return db.eventSponsor.findMany({
    where: { eventId, ...(approvedOnly ? { status: "APPROVED" } : {}) },
    orderBy: [
      { sortOrder: "asc" },
      { approvedAt: "asc" },
      { createdAt: "asc" },
    ],
    select: sponsorSelect,
  });
}

export type EventSponsorRow = Awaited<
  ReturnType<typeof sponsorsForEvent>
>[number];

export function sponsorPhoto(sponsor: EventSponsorRow) {
  return sponsor.business.logoUrl || sponsor.business.owner?.avatarUrl || null;
}

/** "10% off tickets" for a live sponsor coupon, else null. */
export function sponsorDiscountLabel(sponsor: EventSponsorRow) {
  const coupon = sponsor.coupon;
  if (!coupon || !coupon.active) return null;
  return coupon.discountKind === "PERCENT"
    ? `${coupon.amount}% off tickets`
    : `${coupon.amount} ${coupon.currency ?? ""} off tickets`.replace(
        /\s+/g,
        " ",
      );
}
