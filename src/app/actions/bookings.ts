"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { siteUrl } from "@/lib/format";
import {
  businessCanBook,
  businessIsBookable,
  bookingCurrency,
  bookingSplits,
  bookingExpiry,
  releaseBooking,
  refundBooking,
  BOOKING_RESPONSE_HOURS,
} from "@/lib/bookings";

const bookingSchema = z.object({
  slug: z.string().min(1),
  bookerName: z.string().trim().min(2).max(120),
  bookerEmail: z.string().trim().email().max(200),
  bookerPhone: z.string().trim().min(7).max(30),
  eventDate: z.string().min(1),
  eventType: z.string().trim().max(60).optional(),
  guestCount: z.coerce.number().int().min(1).max(100_000).optional(),
  notes: z.string().trim().max(2000).optional(),
});

/** Guest or member pays the deposit for a bookable business card. */
export async function startBooking(formData: FormData) {
  const parsed = bookingSchema.safeParse({
    slug: formData.get("slug"),
    bookerName: formData.get("bookerName"),
    bookerEmail: formData.get("bookerEmail"),
    bookerPhone: formData.get("bookerPhone"),
    eventDate: formData.get("eventDate"),
    eventType: formData.get("eventType") || undefined,
    guestCount: formData.get("guestCount") || undefined,
    notes: formData.get("notes") || undefined,
  });
  const slug = String(formData.get("slug") ?? "");
  if (!parsed.success) redirect(`/book/${slug}?error=invalid`);
  const input = parsed.data;

  const eventDate = new Date(input.eventDate);
  if (Number.isNaN(eventDate.getTime()) || eventDate < new Date()) {
    redirect(`/book/${slug}?error=date`);
  }

  const business = await db.business.findUnique({ where: { slug } });
  if (!business || !businessIsBookable(business)) {
    redirect(`/business/${slug}?error=not_bookable`);
  }
  if (!stripeEnabled()) redirect(`/book/${slug}?error=stripe_unavailable`);

  const priceMinor = business.bookingPriceMinor;
  const { depositMinor, feeMinor, payoutMinor } = bookingSplits(
    priceMinor,
    business.bookingDepositPct,
  );
  if (depositMinor <= 0 || payoutMinor <= 0) {
    redirect(`/book/${slug}?error=price`);
  }

  const booking = await db.booking.create({
    data: {
      businessId: business.id,
      bookerName: input.bookerName,
      bookerEmail: input.bookerEmail,
      bookerPhone: input.bookerPhone,
      eventDate,
      eventType: input.eventType ?? null,
      guestCount: input.guestCount ?? null,
      notes: input.notes ?? null,
      priceMinor,
      depositMinor,
      feeMinor,
      payoutMinor,
      currency: bookingCurrency(business),
      expiresAt: bookingExpiry(),
    },
  });

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: input.bookerEmail,
    metadata: { kind: "booking", bookingId: booking.id },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: booking.currency.toLowerCase(),
          unit_amount: depositMinor,
          product_data: {
            name: `Booking deposit — ${business.name}`,
            description: `${business.bookingDepositPct}% deposit for ${eventDate.toDateString()}. Balance paid to ${business.name} directly. Held by Godesi until they confirm — auto-refunded if declined or unanswered in ${BOOKING_RESPONSE_HOURS}h.`,
          },
        },
      },
    ],
    success_url: `${siteUrl()}/book/${slug}/done?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/book/${slug}?error=cancelled`,
  });
  if (!session.url) redirect(`/book/${slug}?error=stripe_session`);
  redirect(session.url);
}

const settingsSchema = z.object({
  businessId: z.string().min(1),
  enabled: z.boolean(),
  price: z.coerce.number().min(0).max(10_000_000),
  depositPct: z.coerce.number().int().min(5).max(100).default(20),
});

/** Owner turns bookings on/off and sets their price + deposit share. */
export async function saveBookingSettings(formData: FormData) {
  const user = await requireUser();
  const parsed = settingsSchema.safeParse({
    businessId: formData.get("businessId"),
    enabled: formData.get("enabled") === "on" || formData.get("enabled") === "true",
    price: formData.get("price"),
    depositPct: formData.get("depositPct"),
  });
  if (!parsed.success) redirect("/dashboard/bookings?error=invalid");
  const input = parsed.data;

  const business = await db.business.findUnique({
    where: { id: input.businessId },
  });
  if (!business || business.ownerId !== user.id) {
    redirect("/dashboard/bookings?error=forbidden");
  }

  await db.business.update({
    where: { id: business.id },
    data: {
      bookingsEnabled: input.enabled && businessCanBook(business),
      bookingPriceMinor: Math.round(input.price * 100),
      bookingDepositPct: input.depositPct,
    },
  });
  redirect("/dashboard/bookings?saved=1");
}

async function ownedBooking(bookingId: string, userId: string) {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { business: { select: { name: true, ownerId: true } } },
  });
  if (!booking || booking.business.ownerId !== userId) return null;
  return booking;
}

/** Owner accepts: confirms the booking and releases their deposit share. */
export async function acceptBooking(bookingId: string) {
  const user = await requireUser();
  const booking = await ownedBooking(bookingId, user.id);
  if (!booking) redirect("/dashboard/bookings?error=forbidden");
  await releaseBooking(booking);
  redirect(`/dashboard/bookings/${bookingId}`);
}

/** Owner declines: the deposit goes straight back to the booker. */
export async function declineBooking(formData: FormData) {
  const user = await requireUser();
  const bookingId = String(formData.get("bookingId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500);
  const booking = await ownedBooking(bookingId, user.id);
  if (!booking) redirect("/dashboard/bookings?error=forbidden");
  await refundBooking(
    booking,
    "DECLINED",
    reason || "The business could not take this booking.",
  );
  redirect("/dashboard/bookings");
}
