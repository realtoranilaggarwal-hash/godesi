import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { can, getCurrentUser } from "@/lib/auth";
import { deskFallback } from "@/lib/adminSections";
import { properName } from "@/lib/names";
import { ORDER_LABEL, ORDER_TONE, usd } from "@/lib/gigs";
import {
  markGigSettledAction,
  resolveGigDisputeAction,
} from "@/app/actions/gigs";
import { ActionForm } from "@/components/gigs/GigForms";
import { Badge, Button, Card, inputClass } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gigs" };

export default async function AdminGigsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/gigs");
  if (!can(user, "gigs")) redirect(deskFallback(user, "Gigs"));

  const party = {
    buyer: { select: { name: true, email: true } },
    seller: { select: { name: true, email: true, stripePayoutsEnabled: true } },
    gig: { select: { title: true } },
  };

  const [disputes, owed, recent, totals, live] = await Promise.all([
    db.gigOrder.findMany({
      where: { status: "DISPUTED" },
      orderBy: { disputedAt: "asc" },
      include: party,
    }),
    db.gigOrder.findMany({
      where: { status: "RELEASED", stripeTransferId: null },
      orderBy: { releasedAt: "asc" },
      include: party,
    }),
    db.gigOrder.findMany({
      where: { status: { not: "PENDING" } },
      orderBy: { createdAt: "desc" },
      take: 40,
      include: party,
    }),
    db.gigOrder.aggregate({
      where: { status: "RELEASED" },
      _sum: { feeMinor: true, priceMinor: true },
      _count: true,
    }),
    db.gig.count({ where: { status: "ACTIVE" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gigs</h1>
        <p className="text-sm text-slate-600">
          {live} live gigs · {totals._count} completed orders ·{" "}
          {usd(totals._sum.priceMinor ?? 0)} sold · {usd(totals._sum.feeMinor ?? 0)}{" "}
          in Godesi fees (before card costs).
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">
          Disputes to settle{" "}
          <span className="text-sm font-normal text-slate-500">({disputes.length})</span>
        </h2>
        {disputes.length ? (
          disputes.map((order) => (
            <Card key={order.id} className="space-y-3 border-rose-200">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/gigs/orders/${order.id}`}
                    className="font-bold text-indigo-700 underline"
                  >
                    {order.gig.title}
                  </Link>
                  <p className="text-sm text-slate-600">
                    Buyer {properName(order.buyer.name)} ({order.buyer.email}) · Seller{" "}
                    {properName(order.seller.name)} ({order.seller.email}) · {usd(order.priceMinor)}
                  </p>
                </div>
                <Badge tone="red">
                  raised{" "}
                  {order.disputedAt?.toLocaleDateString("en-US", {
                    dateStyle: "medium",
                    timeZone: "UTC",
                  })}
                </Badge>
              </div>
              <p className="whitespace-pre-line rounded-xl bg-rose-50 p-3 text-sm text-rose-900">
                {order.disputeReason}
              </p>
              <p className="text-xs text-slate-500">
                Read the order room first (link above). Then decide; both sides
                get your note.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <ActionForm
                  action={resolveGigDisputeAction}
                  submitLabel={`Refund buyer ${usd(order.priceMinor)}`}
                  pendingLabel="Refunding…"
                  variant="danger"
                >
                  <input type="hidden" name="orderId" value={order.id} />
                  <input type="hidden" name="outcome" value="refund" />
                  <textarea name="note" rows={2} required className={inputClass} placeholder="Why the buyer is refunded" />
                </ActionForm>
                <ActionForm
                  action={resolveGigDisputeAction}
                  submitLabel={`Pay seller ${usd(order.sellerMinor)}`}
                  pendingLabel="Releasing…"
                >
                  <input type="hidden" name="orderId" value={order.id} />
                  <input type="hidden" name="outcome" value="release" />
                  <textarea name="note" rows={2} required className={inputClass} placeholder="Why the seller is paid" />
                </ActionForm>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-sm text-slate-500">Nothing in dispute.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">
          Owed to sellers without Stripe{" "}
          <span className="text-sm font-normal text-slate-500">({owed.length})</span>
        </h2>
        {owed.length ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Seller</th>
                  <th className="px-3 py-2">Gig</th>
                  <th className="px-3 py-2">Owed</th>
                  <th className="px-3 py-2">Released</th>
                  <th className="px-3 py-2">Settle by hand</th>
                </tr>
              </thead>
              <tbody>
                {owed.map((order) => (
                  <tr key={order.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      {properName(order.seller.name)}
                      <br />
                      <span className="text-xs text-slate-500">{order.seller.email}</span>
                    </td>
                    <td className="px-3 py-2">
                      <Link href={`/gigs/orders/${order.id}`} className="underline">
                        {order.gig.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2 font-bold">{usd(order.sellerMinor)}</td>
                    <td className="px-3 py-2 text-slate-500">
                      {order.releasedAt?.toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" })}
                    </td>
                    <td className="px-3 py-2">
                      <form action={markGigSettledAction} className="flex gap-2">
                        <input type="hidden" name="orderId" value={order.id} />
                        <input
                          name="reference"
                          required
                          placeholder="Bank / UPI reference"
                          className={`${inputClass} !py-1.5`}
                        />
                        <Button type="submit" variant="secondary" className="!py-1.5">
                          Paid
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Nothing owed — every released order went to a connected Stripe account.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Recent orders</h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Gig</th>
                <th className="px-3 py-2">Buyer → Seller</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Placed</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((order) => (
                <tr key={order.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">
                    <Link href={`/gigs/orders/${order.id}`} className="font-semibold text-indigo-700 underline">
                      {order.gig.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    {properName(order.buyer.name)} → {properName(order.seller.name)}
                  </td>
                  <td className="px-3 py-2">{usd(order.priceMinor)}</td>
                  <td className="px-3 py-2">
                    <Badge tone={ORDER_TONE[order.status]}>{ORDER_LABEL[order.status]}</Badge>
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {order.createdAt.toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" })}
                  </td>
                </tr>
              ))}
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                    No orders yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
