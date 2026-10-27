import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { saveBookingSettings, acceptBooking, declineBooking } from "@/app/actions/bookings";
import {
  businessCanBook,
  businessIsBookable,
  bookingCurrency,
  formatBookingMoney,
  bookingSplits,
  BOOKING_RESPONSE_HOURS,
} from "@/lib/bookings";
import { Badge, Card, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Bookings" };

const STATUS_BADGE: Record<string, { label: string; tone: string }> = {
  AWAITING_PAYMENT: { label: "Checkout open", tone: "bg-slate-100 text-slate-600" },
  PENDING: { label: "Needs your answer", tone: "bg-amber-100 text-amber-800" },
  CONFIRMED: { label: "Confirmed", tone: "bg-emerald-100 text-emerald-800" },
  DECLINED: { label: "Declined", tone: "bg-rose-100 text-rose-700" },
  EXPIRED: { label: "Expired", tone: "bg-slate-100 text-slate-500" },
  CANCELLED: { label: "Cancelled", tone: "bg-slate-100 text-slate-500" },
};

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: { saved?: string; error?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/bookings");

  const business = await db.business.findUnique({
    where: { ownerId: user.id },
  });
  const bookings = business
    ? await db.booking.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  const eligible = business ? businessCanBook(business) : false;
  const currency = business ? bookingCurrency(business) : "USD";
  const money = (m: number) => formatBookingMoney(m, currency);
  const pending = bookings.filter((b) => b.status === "PENDING");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-sm text-slate-600">
          Customers pay a deposit to book you; Godesi keeps a 5% fee on the price
          and pays the rest to you.
        </p>
      </div>

      {searchParams.saved ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          Booking settings saved.
        </p>
      ) : null}
      {searchParams.error ? (
        <p className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
          {searchParams.error === "forbidden" ? "That booking isn't yours." : "Something wasn't right — try again."}
        </p>
      ) : null}

      {!business ? (
        <EmptyState
          title="No business card yet"
          body="Create your business card first, then turn on bookings here."
        />
      ) : !eligible ? (
        <Card>
          <p className="text-sm text-slate-600">
            Paid bookings are live first for <b>DJ &amp; Sound</b> and{" "}
            <b>Banquet Halls &amp; Venues</b> categories. Your card is under{" "}
            <b>{business.category}</b> — we&apos;re opening more categories soon.
          </p>
        </Card>
      ) : (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Booking settings</h2>
            {business.bookingsEnabled ? (
              <Badge>ON</Badge>
            ) : (
              <span className="text-xs font-semibold text-slate-400">OFF</span>
            )}
          </div>
          <form action={saveBookingSettings} className="grid gap-4 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-end">
            <input type="hidden" name="businessId" value={business.id} />
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                name="enabled"
                defaultChecked={business.bookingsEnabled}
                className="h-4 w-4"
              />
              Take bookings
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Your price per booking ({currency})
              <input
                name="price"
                type="number"
                min={0}
                step="0.01"
                required
                defaultValue={(business.bookingPriceMinor / 100).toFixed(2)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Deposit %
              <input
                name="depositPct"
                type="number"
                min={5}
                max={100}
                required
                defaultValue={business.bookingDepositPct}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">
              Save
            </button>
          </form>
          {businessIsBookable(business) ? (
            <p className="text-xs text-slate-500">
              Customers pay {money(bookingSplits(business.bookingPriceMinor, business.bookingDepositPct).depositMinor)} up front;
              you receive {money(bookingSplits(business.bookingPriceMinor, business.bookingDepositPct).payoutMinor)} on acceptance
              and the balance directly from the customer.{" "}
              {!user.stripePayoutsEnabled ? (
                <>
                  <Link href="/dashboard/payouts" className="font-semibold text-indigo-600">
                    Connect your Stripe account
                  </Link>{" "}
                  to get paid automatically.
                </>
              ) : null}
            </p>
          ) : null}
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-bold">
          Requests {pending.length ? <Badge>{pending.length} waiting</Badge> : null}
        </h2>
        {bookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            body="When someone pays a deposit to book you, it appears here for you to accept or decline."
          />
        ) : (
          bookings.map((b) => (
            <Card key={b.id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900">
                    {b.bookerName} · {b.eventDate.toDateString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {b.eventType ?? "Event"} · {b.bookerPhone} · {b.bookerEmail}
                    {b.guestCount ? ` · ~${b.guestCount} guests` : ""}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_BADGE[b.status]?.tone ?? ""}`}>
                  {STATUS_BADGE[b.status]?.label ?? b.status}
                </span>
              </div>
              {b.notes ? (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  “{b.notes}”
                </p>
              ) : null}
              <p className="text-sm text-slate-600">
                Deposit paid: <b>{money(b.depositMinor)}</b> · you get{" "}
                <b>{money(b.payoutMinor)}</b> on accept
              </p>
              {b.status === "PENDING" ? (
                <div className="flex flex-wrap items-center gap-2">
                  <form action={acceptBooking.bind(null, b.id)}>
                    <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">
                      ✓ Accept — release {money(b.payoutMinor)}
                    </button>
                  </form>
                  <form action={declineBooking} className="flex items-center gap-2">
                    <input type="hidden" name="bookingId" value={b.id} />
                    <input
                      name="reason"
                      placeholder="Reason (optional)"
                      maxLength={200}
                      className="w-44 rounded-xl border border-slate-300 px-3 py-2 text-xs"
                    />
                    <button className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50">
                      Decline & refund
                    </button>
                  </form>
                  <span className="text-xs text-slate-400">
                    auto-refunds {b.expiresAt.toLocaleDateString()} if unanswered ({BOOKING_RESPONSE_HOURS}h window)
                  </span>
                </div>
              ) : null}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
