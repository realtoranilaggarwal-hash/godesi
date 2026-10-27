import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { confirmBooking } from "@/lib/bookings";
import { Alert, Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Booking sent",
  robots: { index: false },
};

/** Verifies the Checkout Session before marking the deposit paid; idempotent with the webhook. */
export default async function BookingDonePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { session_id?: string };
}) {
  if (!searchParams.session_id || !stripeEnabled()) {
    redirect(`/book/${params.slug}`);
  }

  let bookingId: string | null = null;
  let error: string | null = null;

  try {
    const session = await getStripe().checkout.sessions.retrieve(
      searchParams.session_id,
    );
    const id = session.metadata?.bookingId;
    if (session.metadata?.kind !== "booking" || !id) {
      error = "This payment is not a booking.";
    } else if (session.payment_status !== "paid") {
      error = "Your payment has not completed yet.";
    } else {
      const booking = await confirmBooking({
        bookingId: id,
        sessionId: session.id,
        paymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : (session.payment_intent?.id ?? null),
      });
      if (booking) bookingId = booking.id;
      else error = "We could not find that booking.";
    }
  } catch {
    error = "We could not verify this payment. If you were charged it confirms automatically within a minute.";
  }

  const booking = bookingId
    ? await db.booking.findUnique({
        where: { id: bookingId },
        include: { business: { select: { name: true } } },
      })
    : null;

  return (
    <div className="mx-auto max-w-lg space-y-4 py-10 text-center">
      <Card className="space-y-4">
        {booking ? (
          <>
            <div className="text-5xl">🎉</div>
            <h1 className="text-2xl font-bold">Booking request sent</h1>
            <p className="text-sm text-slate-600">
              Your deposit is received and <b>{booking.business.name}</b> has been
              asked to confirm for <b>{booking.eventDate.toDateString()}</b>. You&apos;ll
              get an email the moment they accept — and a full refund if they decline
              or don&apos;t answer in time.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Booking pending</h1>
            <Alert>{error}</Alert>
            <p className="text-sm text-slate-500">
              If you were charged, the booking confirms automatically within a minute.
            </p>
          </>
        )}
        <Link
          href={`/business/${params.slug}`}
          className="block font-semibold text-indigo-600"
        >
          Back to the listing
        </Link>
      </Card>
    </div>
  );
}
