import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { stripeEnabled } from "@/lib/stripe";
import { startBooking } from "@/app/actions/bookings";
import {
  businessIsBookable,
  bookingSplits,
  bookingCurrency,
  formatBookingMoney,
  BOOKING_RESPONSE_HOURS,
} from "@/lib/bookings";
import { Alert, Card, LinkButton } from "@/components/ui";
import { metaDescription, pageTitle } from "@/lib/seo";

export const dynamic = "force-dynamic";

const EVENT_TYPES = [
  "Wedding",
  "Engagement / Sangeet",
  "Birthday party",
  "Corporate event",
  "Religious function",
  "Other",
];

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const business = await db.business.findUnique({
    where: { slug: params.slug },
    select: { name: true, city: true },
  });
  if (!business) return { title: "Booking" };
  const title = pageTitle(`Book ${business.name} — ${business.city}`);
  return {
    title,
    description: metaDescription(
      `Request a booking with ${business.name} on GoDesi. Pay a small deposit now, the business confirms within ${BOOKING_RESPONSE_HOURS} hours or you get it back.`,
      "Book desi DJs, venues and event services on GoDesi — deposit held safely until the business confirms.",
    ),
    robots: { index: false },
    alternates: { canonical: `/book/${params.slug}` },
  };
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { error?: string };
}) {
  const [business, viewer] = await Promise.all([
    db.business.findUnique({
      where: { slug: params.slug },
      include: { owner: { select: { name: true } } },
    }),
    getCurrentUser(),
  ]);
  if (!business) notFound();
  if (!businessIsBookable(business)) redirect(`/business/${business.slug}`);

  const currency = bookingCurrency(business);
  const money = (m: number) => formatBookingMoney(m, currency);
  const { depositMinor } = bookingSplits(
    business.bookingPriceMinor,
    business.bookingDepositPct,
  );
  const balanceMinor = business.bookingPriceMinor - depositMinor;

  const ERROR_TEXT: Record<string, string> = {
    invalid: "Please check the form — a field was missing or invalid.",
    date: "Please pick a date in the future.",
    cancelled: "Checkout was cancelled — nothing was charged.",
    stripe_unavailable: "Payments are temporarily unavailable. Try again later.",
    stripe_session: "Could not open checkout. Try again.",
    price: "This listing's booking price isn't set correctly yet.",
    not_bookable: "This business is not taking bookings right now.",
  };

  const tomorrow = new Date(Date.now() + 24 * 3_600_000)
    .toISOString()
    .slice(0, 10);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <nav className="text-sm text-slate-500">
        <Link href={`/business/${business.slug}`} className="hover:text-slate-700">
          ← {business.name}
        </Link>
      </nav>

      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">
          📅 Book {business.name}
        </h1>
        <p className="text-sm text-slate-600">
          {business.category} · {business.city}
          {business.state ? `, ${business.state}` : ""}
        </p>
      </header>

      {searchParams.error ? (
        <Alert>{ERROR_TEXT[searchParams.error] ?? "Something went wrong."}</Alert>
      ) : null}

      <Card className="space-y-3 border-rose-100 bg-rose-50/60">
        <h2 className="font-bold text-slate-900">How it works</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
          <li>
            Pay a <b>{money(depositMinor)}</b> deposit now ({business.bookingDepositPct}% of their{" "}
            {money(business.bookingPriceMinor)} rate).
          </li>
          <li>
            {business.name} has <b>{BOOKING_RESPONSE_HOURS} hours</b> to confirm —
            if they decline or don&apos;t answer, the deposit comes straight back.
          </li>
          <li>
            Confirmed? You pay the remaining <b>{money(balanceMinor)}</b> to them directly.
          </li>
        </ol>
      </Card>

      <Card>
        <form action={startBooking} className="space-y-4">
          <input type="hidden" name="slug" value={business.slug} />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Your name
              <input
                name="bookerName"
                required
                maxLength={120}
                defaultValue={viewer?.name ?? ""}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                placeholder="Full name"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Phone / WhatsApp
              <input
                name="bookerPhone"
                required
                maxLength={30}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                placeholder="+1 555 000 0000"
              />
            </label>
          </div>

          <label className="block text-sm font-semibold text-slate-700">
            Email — deposit receipt goes here
            <input
              name="bookerEmail"
              type="email"
              required
              maxLength={200}
              defaultValue={viewer?.email ?? ""}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              placeholder="you@email.com"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-semibold text-slate-700">
              Event date
              <input
                name="eventDate"
                type="date"
                required
                min={tomorrow}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Event type
              <select
                name="eventType"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Guests (approx.)
              <input
                name="guestCount"
                type="number"
                min={1}
                max={100000}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                placeholder="150"
              />
            </label>
          </div>

          <label className="block text-sm font-semibold text-slate-700">
            Anything they should know? (venue address, hours, songs…)
            <textarea
              name="notes"
              rows={3}
              maxLength={2000}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-3.5 text-base font-bold text-white shadow hover:from-rose-700 hover:to-pink-700"
          >
            Pay {money(depositMinor)} deposit →
          </button>
          <p className="text-center text-xs text-slate-500">
            Secure card checkout · refund guaranteed if not confirmed in {BOOKING_RESPONSE_HOURS}h
            {!stripeEnabled() ? " · Payments offline right now" : ""}
          </p>
        </form>
      </Card>

      <p className="text-center text-sm text-slate-500">
        Changed your mind? <LinkButton href={`/business/${business.slug}`} variant="secondary">Back to {business.name}</LinkButton>
      </p>
    </div>
  );
}
