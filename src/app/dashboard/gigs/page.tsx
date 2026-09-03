import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { properName } from "@/lib/names";
import {
  GIG_FEE_USD,
  GIG_MAX_USD,
  GIG_MIN_USD,
  MAX_DELIVERY_DAYS,
  MAX_GIGS_PER_SELLER,
  ORDER_LABEL,
  ORDER_TONE,
  usd,
} from "@/lib/gigs";
import {
  createGigAction,
  setGigStatusAction,
  updateGigAction,
} from "@/app/actions/gigs";
import { ActionForm } from "@/components/gigs/GigForms";
import { FeeNote } from "@/components/gigs/GigCard";
import { Alert, Badge, Button, Card, Field, inputClass } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My gigs" };

function GigFields({
  gig,
}: {
  gig?: {
    title: string;
    description: string;
    includes: string | null;
    priceMinor: number;
    deliveryDays: number;
  };
}) {
  return (
    <>
      <Field label="Title" required hint="Say the outcome: “Kundli reading with 30-min call”, not “Astrology”.">
        <input
          name="title"
          required
          minLength={6}
          maxLength={80}
          defaultValue={gig?.title}
          className={inputClass}
        />
      </Field>
      <Field label="What you will do" required hint="Your own words. Who it is for, what you need from them, what they get back.">
        <textarea
          name="description"
          required
          minLength={40}
          maxLength={2000}
          rows={4}
          defaultValue={gig?.description}
          className={inputClass}
        />
      </Field>
      <Field label="What's included" hint="One item per line, e.g. “PDF report”, “One revision”.">
        <textarea
          name="includes"
          maxLength={1000}
          rows={3}
          defaultValue={gig?.includes ?? ""}
          className={inputClass}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={`Price in US$ (${GIG_MIN_USD}–${GIG_MAX_USD})`} required>
          <input
            name="priceUsd"
            type="number"
            required
            min={GIG_MIN_USD}
            max={GIG_MAX_USD}
            step={1}
            defaultValue={gig ? gig.priceMinor / 100 : 25}
            className={inputClass}
          />
        </Field>
        <Field label={`Delivery in days (1–${MAX_DELIVERY_DAYS})`} required>
          <input
            name="deliveryDays"
            type="number"
            required
            min={1}
            max={MAX_DELIVERY_DAYS}
            step={1}
            defaultValue={gig?.deliveryDays ?? 3}
            className={inputClass}
          />
        </Field>
      </div>
    </>
  );
}

export default async function DashboardGigsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/gigs");

  const [gigs, sales, purchases] = await Promise.all([
    db.gig.findMany({
      where: { sellerId: user.id, status: { not: "REMOVED" } },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: { where: { status: "RELEASED" } } } } },
    }),
    db.gigOrder.findMany({
      where: { sellerId: user.id, status: { not: "PENDING" } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        gig: { select: { title: true } },
        buyer: { select: { name: true } },
      },
    }),
    db.gigOrder.findMany({
      where: { buyerId: user.id, status: { not: "PENDING" } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        gig: { select: { title: true } },
        seller: { select: { name: true } },
      },
    }),
  ]);

  const earned = sales
    .filter((order) => order.status === "RELEASED")
    .reduce((sum, order) => sum + order.sellerMinor, 0);
  const owed = sales
    .filter((order) => order.status === "RELEASED" && !order.stripeTransferId)
    .reduce((sum, order) => sum + order.sellerMinor, 0);
  const needsAction = sales.filter((order) => order.status === "PAID").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My gigs</h1>
          <p className="text-sm text-slate-600">
            Sell what you know for a fixed price, ${GIG_MIN_USD}–${GIG_MAX_USD}.
            Buyer pays, Godesi keeps ${GIG_FEE_USD}, you get the rest.{" "}
            <Link href="/gigs/how-it-works" className="font-semibold underline">
              How it works
            </Link>
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-800">
            <p className="text-xs uppercase tracking-wide">Earned</p>
            <p className="text-lg font-black">{usd(earned)}</p>
          </div>
          {needsAction ? (
            <div className="rounded-xl bg-indigo-50 px-3 py-2 text-indigo-800">
              <p className="text-xs uppercase tracking-wide">To deliver</p>
              <p className="text-lg font-black">{needsAction}</p>
            </div>
          ) : null}
        </div>
      </div>

      {!user.emailVerifiedAt ? (
        <Alert tone="info">
          <Link href="/verify-email" className="font-semibold underline">
            Verify your email
          </Link>{" "}
          before listing a gig.
        </Alert>
      ) : null}
      {gigs.length && !user.stripePayoutsEnabled ? (
        <Alert tone="info">
          To be paid automatically,{" "}
          <Link href="/dashboard/payouts" className="font-semibold underline">
            connect your Stripe account
          </Link>{" "}
          — takes five minutes, any plan.
          {owed > 0 ? ` ${usd(owed)} is already owed to you.` : ""}
        </Alert>
      ) : null}

      {gigs.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">Your gigs</h2>
          {gigs.map((gig) => (
            <Card key={gig.id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Link href={`/gigs/${gig.slug}`} className="font-bold hover:underline">
                    {gig.title}
                  </Link>
                  <Badge tone={gig.status === "ACTIVE" ? "green" : "amber"}>
                    {gig.status === "ACTIVE" ? "Live" : "Paused"}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {gig._count.orders} completed
                  </span>
                </div>
                <div className="flex gap-2">
                  <form action={setGigStatusAction}>
                    <input type="hidden" name="gigId" value={gig.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={gig.status === "ACTIVE" ? "PAUSED" : "ACTIVE"}
                    />
                    <Button type="submit" variant="secondary" className="!py-1.5">
                      {gig.status === "ACTIVE" ? "Pause" : "Go live"}
                    </Button>
                  </form>
                  <form action={setGigStatusAction}>
                    <input type="hidden" name="gigId" value={gig.id} />
                    <input type="hidden" name="status" value="REMOVED" />
                    <Button type="submit" variant="ghost" className="!py-1.5 text-rose-600">
                      Remove
                    </Button>
                  </form>
                </div>
              </div>
              <details>
                <summary className="cursor-pointer text-sm font-semibold text-indigo-700">
                  Edit
                </summary>
                <div className="mt-3">
                  <ActionForm action={updateGigAction} submitLabel="Save changes">
                    <input type="hidden" name="gigId" value={gig.id} />
                    <GigFields gig={gig} />
                  </ActionForm>
                </div>
              </details>
            </Card>
          ))}
        </section>
      ) : null}

      {gigs.length < MAX_GIGS_PER_SELLER && user.emailVerifiedAt ? (
        <Card className="space-y-3">
          <h2 className="text-lg font-bold">
            {gigs.length ? "Add another gig" : "List your first gig"}
          </h2>
          <ActionForm
            action={createGigAction}
            submitLabel="Publish gig"
            pendingLabel="Publishing…"
            resetOnSuccess
          >
            <GigFields />
          </ActionForm>
          <FeeNote priceMinor={2500} audience="seller" />
        </Card>
      ) : null}

      {sales.length ? (
        <section className="space-y-2">
          <h2 className="text-lg font-bold">Orders for you</h2>
          <OrderTable
            rows={sales.map((order) => ({
              id: order.id,
              title: order.gig.title,
              who: properName(order.buyer.name),
              amount: usd(order.sellerMinor),
              status: order.status,
              when: order.createdAt,
              note:
                order.status === "RELEASED" && !order.stripeTransferId
                  ? "owed — connect Stripe"
                  : null,
            }))}
            whoLabel="Buyer"
          />
        </section>
      ) : null}

      {purchases.length ? (
        <section className="space-y-2">
          <h2 className="text-lg font-bold">Gigs you bought</h2>
          <OrderTable
            rows={purchases.map((order) => ({
              id: order.id,
              title: order.gig.title,
              who: properName(order.seller.name),
              amount: usd(order.priceMinor),
              status: order.status,
              when: order.createdAt,
              note: null,
            }))}
            whoLabel="Seller"
          />
        </section>
      ) : null}
    </div>
  );
}

function OrderTable({
  rows,
  whoLabel,
}: {
  rows: {
    id: string;
    title: string;
    who: string;
    amount: string;
    status: keyof typeof ORDER_LABEL;
    when: Date;
    note: string | null;
  }[];
  whoLabel: string;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2">Gig</th>
            <th className="px-3 py-2">{whoLabel}</th>
            <th className="px-3 py-2">Amount</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Placed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-slate-100">
              <td className="px-3 py-2">
                <Link href={`/gigs/orders/${row.id}`} className="font-semibold text-indigo-700 underline">
                  {row.title}
                </Link>
              </td>
              <td className="px-3 py-2">{row.who}</td>
              <td className="px-3 py-2 font-semibold">{row.amount}</td>
              <td className="px-3 py-2">
                <Badge tone={ORDER_TONE[row.status]}>{ORDER_LABEL[row.status]}</Badge>
                {row.note ? <span className="ml-1 text-xs text-amber-700">{row.note}</span> : null}
              </td>
              <td className="px-3 py-2 text-slate-500">
                {row.when.toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
