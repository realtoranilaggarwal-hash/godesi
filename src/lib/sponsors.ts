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

const liveCoupon = () => ({
  active: true,
  OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
});

/** Live sponsor ticket codes a business hands out for its upcoming events. */
export async function sponsorCodesForBusiness(businessId: string) {
  const rows = await db.eventSponsor.findMany({
    where: {
      businessId,
      status: "APPROVED",
      coupon: { is: liveCoupon() },
      event: { status: "APPROVED", startsAt: { gte: new Date() } },
    },
    orderBy: { event: { startsAt: "asc" } },
    select: {
      ...sponsorSelect,
      event: { select: { title: true, slug: true } },
    },
  });
  return rows.flatMap((row) =>
    row.coupon
      ? [
          {
            code: row.coupon.code,
            label: sponsorDiscountLabel(row) ?? "a ticket discount",
            eventTitle: row.event.title,
            eventSlug: row.event.slug,
          },
        ]
      : [],
  );
}

/** The approved sponsor whose live code this is, for checkout on network sites. */
export function sponsorForCode(eventSlug: string, code: string) {
  return db.eventSponsor.findFirst({
    where: {
      status: "APPROVED",
      event: { slug: eventSlug, status: "APPROVED" },
      coupon: {
        is: { ...liveCoupon(), code: { equals: code, mode: "insensitive" } },
      },
    },
    select: sponsorSelect,
  });
}
