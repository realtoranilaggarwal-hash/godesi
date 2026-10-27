import type { Booking, Business } from "@prisma/client";
import { db } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { sendEmail, shell, emailEnabled } from "@/lib/email";
import { siteUrl } from "@/lib/format";

/** Godesi's cut of a booking: 5% of the full quoted price, taken from the deposit. */
export const BOOKING_FEE_BPS = 500;

/** Hours the business has to accept before the deposit auto-refunds. */
export const BOOKING_RESPONSE_HOURS = 48;

/**
 * Categories where "Book now" makes sense — subcategory slugs under
 * Wedding & Event Services. Expand here to open bookings to more categories.
 */
export const BOOKING_CATEGORY_SLUGS = [
  "events-wedding-dj-and-sound",
  "events-wedding-banquet-halls-and-venues",
] as const;

export function businessIsBookable(
  business: Pick<
    Business,
    | "bookingsEnabled"
    | "bookingPriceMinor"
    | "subcategorySlug"
    | "categorySlug"
    | "extraCategorySlugs"
    | "ownerId"
    | "status"
  >,
) {
  if (!business.ownerId || business.status !== "APPROVED") return false;
  const scopes = [
    business.subcategorySlug,
    business.categorySlug,
    ...business.extraCategorySlugs,
  ];
  return (
    business.bookingsEnabled &&
    business.bookingPriceMinor > 0 &&
    scopes.some((slug) =>
      slug ? (BOOKING_CATEGORY_SLUGS as readonly string[]).includes(slug) : false,
    )
  );
}

/** A business in a booking-eligible category, whether or not it has opted in yet. */
export function businessCanBook(business: Pick<Business, "subcategorySlug" | "extraCategorySlugs" | "categorySlug">) {
  const scopes = [
    business.subcategorySlug,
    business.categorySlug,
    ...business.extraCategorySlugs,
  ];
  return scopes.some((slug) =>
    slug ? (BOOKING_CATEGORY_SLUGS as readonly string[]).includes(slug) : false,
  );
}

export function bookingCurrency(business: Pick<Business, "country">) {
  return business.country === "India" ? "INR" : "USD";
}

export function formatBookingMoney(minor: number, currency: string) {
  return currency === "INR"
    ? `₹${Math.round(minor / 100).toLocaleString("en-IN")}`
    : `$${(minor / 100).toFixed(2)}`;
}

export function bookingSplits(priceMinor: number, depositPct: number) {
  const pct = Math.min(Math.max(depositPct || 20, 5), 100);
  const depositMinor = Math.round((priceMinor * pct) / 100);
  const feeMinor = Math.round((priceMinor * BOOKING_FEE_BPS) / 10_000);
  return { depositMinor, feeMinor, payoutMinor: depositMinor - feeMinor };
}

export function bookingExpiry(from = new Date()) {
  return new Date(from.getTime() + BOOKING_RESPONSE_HOURS * 3_600_000);
}

function bookingLink(id: string) {
  return `${siteUrl()}/dashboard/bookings/${id}`;
}

/**
 * Marks a booking paid once Stripe confirms the deposit. Idempotent: the
 * webhook and the success page both call it.
 */
export async function confirmBooking({
  bookingId,
  sessionId,
  paymentIntentId,
}: {
  bookingId: string;
  sessionId: string;
  paymentIntentId: string | null;
}) {
  const claimed = await db.booking.updateMany({
    where: { id: bookingId, status: "AWAITING_PAYMENT" },
    data: {
      status: "PENDING",
      stripeSessionId: sessionId,
      stripePaymentIntentId: paymentIntentId,
      paidAt: new Date(),
    },
  });
  if (claimed.count === 0) {
    return db.booking.findUnique({ where: { id: bookingId } });
  }

  const booking = await db.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: {
      business: {
        select: {
          name: true,
          slug: true,
          ownerId: true,
          owner: { select: { email: true, name: true } },
        },
      },
    },
  });
  const biz = booking.business;
  const money = (m: number) => formatBookingMoney(m, booking.currency);

  if (biz.ownerId) {
    await notify({
      userId: biz.ownerId,
      title: `New booking request for ${biz.name}`,
      body: `${booking.bookerName} paid a ${money(booking.depositMinor)} deposit for ${booking.eventDate.toDateString()}. Accept or decline within ${BOOKING_RESPONSE_HOURS}h or it auto-refunds.`,
      href: `/dashboard/bookings/${booking.id}`,
    });
  }
  if (emailEnabled() && biz.owner?.email) {
    await sendEmail({
      to: biz.owner.email,
      subject: `Booking request: ${biz.name} — ${booking.eventDate.toDateString()}`,
      html: shell(
        `New booking request`,
        `<p>Hi ${biz.owner.name ?? "there"},</p>
         <p><b>${booking.bookerName}</b> wants to book <b>${biz.name}</b> for <b>${booking.eventDate.toDateString()}</b> and has paid a <b>${money(booking.depositMinor)}</b> deposit.</p>
         <p>Accept within ${BOOKING_RESPONSE_HOURS} hours or the deposit is refunded automatically.</p>
         <p><a href="${bookingLink(booking.id)}">Review the booking</a></p>`,
      ),
    });
  }
  if (emailEnabled()) {
    await sendEmail({
      to: booking.bookerEmail,
      subject: `Deposit received — booking request sent to ${biz.name}`,
      html: shell(
        `Booking request sent`,
        `<p>Hi ${booking.bookerName},</p>
         <p>Your <b>${money(booking.depositMinor)}</b> deposit is received and your request went to <b>${biz.name}</b> for <b>${booking.eventDate.toDateString()}</b>.</p>
         <p>They have ${BOOKING_RESPONSE_HOURS} hours to confirm. If they decline or don't answer, the deposit comes straight back to your card. The remaining <b>${money(booking.priceMinor - booking.depositMinor)}</b> is paid to them directly.</p>`,
      ),
    });
  }
  return booking;
}

/**
 * Business accepted: release their share (deposit minus the Godesi fee) to
 * their connected Stripe account, or record it owed for manual settlement.
 */
export async function releaseBooking(booking: Booking) {
  const claimed = await db.booking.updateMany({
    where: { id: booking.id, status: "PENDING" },
    data: { status: "CONFIRMED", respondedAt: new Date() },
  });
  if (claimed.count === 0) return null;

  const business = await db.business.findUniqueOrThrow({
    where: { id: booking.businessId },
    include: { owner: { select: { id: true, email: true, name: true, stripeAccountId: true, stripePayoutsEnabled: true } } },
  });

  let transferId: string | null = null;
  const acct = business.owner;
  if (
    stripeEnabled() &&
    acct?.stripeAccountId &&
    acct.stripePayoutsEnabled &&
    booking.payoutMinor > 0
  ) {
    try {
      const transfer = await getStripe().transfers.create(
        {
          amount: booking.payoutMinor,
          currency: booking.currency.toLowerCase(),
          destination: acct.stripeAccountId,
          ...(booking.stripePaymentIntentId
            ? { transfer_group: booking.stripePaymentIntentId }
            : {}),
          metadata: { kind: "booking", bookingId: booking.id },
        },
        { idempotencyKey: `booking-release-${booking.id}` },
      );
      transferId = transfer.id;
    } catch {
      // Left without a transfer id: admin desk lists it as owed.
    }
  }
  if (transferId) {
    await db.booking.update({
      where: { id: booking.id },
      data: { stripeTransferId: transferId },
    });
  }

  const money = (m: number) => formatBookingMoney(m, booking.currency);
  if (acct) {
    await notify({
      userId: acct.id,
      title: `Booking confirmed: ${money(booking.payoutMinor)}`,
      body: transferId
        ? `${business.name}'s deposit share was sent to your Stripe account. ${booking.bookerName} pays you the remaining ${money(booking.priceMinor - booking.depositMinor)} directly — their contact: ${booking.bookerPhone}.`
        : `Booking confirmed. Connect Stripe under Payouts to receive ${money(booking.payoutMinor)}; until then it is owed to you.`,
      href: `/dashboard/bookings/${booking.id}`,
    });
    if (emailEnabled() && acct.email) {
      await sendEmail({
        to: acct.email,
        subject: `Booking confirmed — ${business.name}`,
        html: shell(
          "Booking confirmed",
          `<p><b>${business.name}</b> is booked for <b>${booking.eventDate.toDateString()}</b>.</p>
           <p>Deposit share: <b>${money(booking.payoutMinor)}</b> ${transferId ? "(sent to your Stripe account)" : "(connect Stripe under Payouts to receive it)"}. The customer pays the remaining <b>${money(booking.priceMinor - booking.depositMinor)}</b> to you directly.</p>
           <p>Customer: ${booking.bookerName} — ${booking.bookerPhone} — ${booking.bookerEmail}</p>`,
        ),
      });
    }
  }
  if (emailEnabled()) {
    await sendEmail({
      to: booking.bookerEmail,
      subject: `Confirmed — ${business.name} is booked for ${booking.eventDate.toDateString()}`,
      html: shell(
        "Booking confirmed 🎉",
        `<p>Hi ${booking.bookerName},</p>
         <p><b>${business.name}</b> confirmed your booking for <b>${booking.eventDate.toDateString()}</b>.</p>
         <p>Remaining <b>${money(booking.priceMinor - booking.depositMinor)}</b> is paid to them directly — they'll be in touch at ${booking.bookerEmail} / ${booking.bookerPhone}.</p>`,
      ),
    });
  }
  return db.booking.findUnique({ where: { id: booking.id } });
}

/** Refunds the deposit and closes the booking (decline, expiry, cancel). */
export async function refundBooking(
  booking: Booking,
  status: "DECLINED" | "EXPIRED" | "CANCELLED",
  reason: string,
) {
  const claimed = await db.booking.updateMany({
    where: { id: booking.id, status: { in: ["PENDING", "CONFIRMED"] } },
    data: { status, respondedAt: new Date(), declineReason: reason },
  });
  if (claimed.count === 0) return null;

  let refundId: string | null = null;
  if (stripeEnabled() && booking.stripePaymentIntentId) {
    try {
      const refund = await getStripe().refunds.create(
        { payment_intent: booking.stripePaymentIntentId },
        { idempotencyKey: `booking-refund-${booking.id}` },
      );
      refundId = refund.id;
    } catch {
      // Refund stays unset — admin desk can retry.
    }
  }
  if (refundId) {
    await db.booking.update({
      where: { id: booking.id },
      data: { stripeRefundId: refundId },
    });
  }

  const business = await db.business.findUniqueOrThrow({
    where: { id: booking.businessId },
    include: { owner: { select: { id: true, email: true, name: true } } },
  });
  const money = (m: number) => formatBookingMoney(m, booking.currency);

  if (emailEnabled()) {
    await sendEmail({
      to: booking.bookerEmail,
      subject: `Booking ${status === "DECLINED" ? "declined" : status === "EXPIRED" ? "expired" : "cancelled"} — deposit refunded`,
      html: shell(
        "Deposit refunded",
        `<p>Hi ${booking.bookerName},</p>
         <p>Your booking with <b>${business.name}</b> for ${booking.eventDate.toDateString()} was ${status === "DECLINED" ? "declined" : status === "EXPIRED" ? "not answered in time" : "cancelled"}. ${reason}</p>
         <p>The <b>${money(booking.depositMinor)}</b> deposit is on its way back to your card (5–10 days).</p>`,
      ),
    });
  }
  if (business.owner?.id) {
    await notify({
      userId: business.owner.id,
      title: `Booking ${status.toLowerCase()}`,
      body: `${booking.bookerName}'s ${business.name} booking for ${booking.eventDate.toDateString()}: ${reason}. Deposit refunded.`,
      href: `/dashboard/bookings/${booking.id}`,
    });
  }
  return db.booking.findUnique({ where: { id: booking.id } });
}

/** PENDING bookings past their response window: refund them. Run by cron. */
export async function expireStaleBookings() {
  const stale = await db.booking.findMany({
    where: { status: "PENDING", expiresAt: { lte: new Date() } },
    take: 50,
  });
  let expired = 0;
  for (const booking of stale) {
    // eslint-disable-next-line no-await-in-loop
    const result = await refundBooking(
      booking,
      "EXPIRED",
      `No answer within ${BOOKING_RESPONSE_HOURS} hours.`,
    );
    if (result) expired += 1;
  }
  // Never-paid checkouts are just closed off; nothing to refund.
  await db.booking.updateMany({
    where: {
      status: "AWAITING_PAYMENT",
      createdAt: { lte: new Date(Date.now() - 24 * 3_600_000) },
    },
    data: { status: "EXPIRED" },
  });
  return { checked: stale.length, expired };
}
