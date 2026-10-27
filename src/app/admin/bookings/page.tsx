import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { formatBookingMoney } from "@/lib/bookings";
import { Card, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Bookings desk", robots: { index: false } };

const TONE: Record<string, string> = {
  AWAITING_PAYMENT: "bg-slate-100 text-slate-600",
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  DECLINED: "bg-rose-100 text-rose-700",
  EXPIRED: "bg-slate-100 text-slate-500",
  CANCELLED: "bg-slate-100 text-slate-500",
};

export default async function AdminBookingsPage() {
  const user = await getCurrentUser();
  if (!user || !isStaff(user)) redirect("/");

  const bookings = await db.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      business: { select: { name: true, slug: true, city: true } },
    },
  });

  const fees = bookings
    .filter((b) => ["CONFIRMED", "PENDING"].includes(b.status))
    .reduce((s, b) => s + b.feeMinor, 0);
  const owed = bookings.filter(
    (b) => b.status === "CONFIRMED" && !b.stripeTransferId,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bookings desk</h1>
        <p className="text-sm text-slate-600">
          Deposit escrow for bookable cards — fee {formatBookingMoney(fees, "USD")} earned so far.
        </p>
      </div>

      {owed.length ? (
        <Card className="border-amber-200 bg-amber-50">
          <h2 className="font-bold text-amber-900">Payouts owed ({owed.length})</h2>
          <ul className="mt-2 space-y-1 text-sm text-amber-800">
            {owed.map((b) => (
              <li key={b.id}>
                {b.business.name} — {formatBookingMoney(b.payoutMinor, b.currency)}{" "}
                (no Stripe account connected; settle manually)
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {bookings.length === 0 ? (
        <EmptyState title="No bookings yet" body="Paid deposits will list here." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase text-slate-400">
                <th className="py-2 pr-3">Business</th>
                <th className="py-2 pr-3">Booker</th>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Deposit</th>
                <th className="py-2 pr-3">Fee</th>
                <th className="py-2 pr-3">Payout</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3 font-semibold">
                    {b.business.name}
                    <span className="block text-xs font-normal text-slate-400">
                      {b.business.city}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    {b.bookerName}
                    <span className="block text-xs text-slate-400">{b.bookerPhone}</span>
                  </td>
                  <td className="py-2 pr-3">{b.eventDate.toDateString()}</td>
                  <td className="py-2 pr-3">{formatBookingMoney(b.depositMinor, b.currency)}</td>
                  <td className="py-2 pr-3 font-semibold text-emerald-700">
                    {formatBookingMoney(b.feeMinor, b.currency)}
                  </td>
                  <td className="py-2 pr-3">
                    {formatBookingMoney(b.payoutMinor, b.currency)}
                    {b.status === "CONFIRMED" && !b.stripeTransferId ? (
                      <span className="block text-xs text-amber-600">owed (no Stripe)</span>
                    ) : null}
                  </td>
                  <td className="py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${TONE[b.status]}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
