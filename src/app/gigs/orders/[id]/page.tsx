import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { properName } from "@/lib/names";
import {
  AUTO_RELEASE_DAYS,
  ORDER_LABEL,
  ORDER_TONE,
  usd,
} from "@/lib/gigs";
import {
  acceptGigAction,
  declineGigAction,
  deliverGigAction,
  disputeGigAction,
  postGigMessageAction,
  reviewGigAction,
} from "@/app/actions/gigs";
import { ActionForm } from "@/components/gigs/GigForms";
import { Alert, Badge, Button, Card, Field, inputClass } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order", robots: { index: false } };

function when(date: Date) {
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
}

export default async function GigOrderPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { paid?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/gigs/orders/${params.id}`);

  const order = await db.gigOrder.findUnique({
    where: { id: params.id },
    include: {
      gig: { select: { title: true, slug: true } },
      review: { select: { id: true, rating: true, comment: true } },
      buyer: { select: { id: true, name: true, avatarUrl: true, username: true } },
      seller: { select: { id: true, name: true, avatarUrl: true, username: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true } } },
      },
    },
  });
  if (!order) notFound();

  const isBuyer = order.buyerId === user.id;
  const isSeller = order.sellerId === user.id;
  const staff = isStaff(user);
  if (!isBuyer && !isSeller && !staff) notFound();

  const open = !["PENDING", "CANCELLED", "REFUNDED", "RELEASED"].includes(
    order.status,
  );
  const other = isSeller ? order.buyer : order.seller;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <nav className="text-xs text-slate-500">
        <Link href="/dashboard/gigs" className="underline">
          My gigs & orders
        </Link>{" "}
        / Order
      </nav>

      {searchParams.paid ? (
        <Alert tone="success">
          Paid. Your money is held by Godesi until you confirm the work — the
          seller has been told to start.
        </Alert>
      ) : null}
      {isSeller &&
      !user.stripePayoutsEnabled &&
      ["PAID", "DELIVERED", "DISPUTED"].includes(order.status) ? (
        <Alert tone="info">
          You have a paying customer — {usd(order.sellerMinor)} is yours when
          they confirm.{" "}
          <Link href="/dashboard/payouts" className="font-semibold underline">
            Connect your Stripe account
          </Link>{" "}
          now so it lands there automatically; otherwise it waits as owed to
          you.
        </Alert>
      ) : null}
      {isBuyer && order.status === "RELEASED" && !order.review ? (
        <Card className="space-y-2 border-amber-200">
          <h2 className="font-bold">How did it go?</h2>
          <p className="text-sm text-slate-600">
            Your review shows on the gig, under your name. Only buyers who
            completed an order can leave one.
          </p>
          <ActionForm action={reviewGigAction} submitLabel="Post review" pendingLabel="Posting…">
            <input type="hidden" name="orderId" value={order.id} />
            <Field label="Rating" required>
              <select name="rating" defaultValue="5" className={inputClass}>
                <option value="5">★★★★★ Excellent</option>
                <option value="4">★★★★ Good</option>
                <option value="3">★★★ Okay</option>
                <option value="2">★★ Poor</option>
                <option value="1">★ Bad</option>
              </select>
            </Field>
            <Field label="Your review" required>
              <textarea name="comment" required minLength={10} maxLength={1000} rows={3} className={inputClass} />
            </Field>
          </ActionForm>
        </Card>
      ) : null}
      {order.review ? (
        <Alert tone="success">
          {isBuyer ? "You rated this" : "The buyer rated this"} {order.review.rating}★ — “{order.review.comment}”
        </Alert>
      ) : null}
      {isSeller &&
      order.status === "RELEASED" &&
      !order.stripeTransferId ? (
        <Alert tone="info">
          {usd(order.sellerMinor)} is owed to you.{" "}
          <Link href="/dashboard/payouts" className="font-semibold underline">
            Connect Stripe
          </Link>{" "}
          to receive it.
        </Alert>
      ) : null}

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge tone={ORDER_TONE[order.status]}>{ORDER_LABEL[order.status]}</Badge>
            <h1 className="mt-2 text-2xl font-black">
              <Link href={`/gigs/${order.gig.slug}`} className="hover:underline">
                {order.gig.title}
              </Link>
            </h1>
            <p className="text-sm text-slate-600">
              {isSeller ? "Buyer" : "Seller"}:{" "}
              {other.username ? (
                <Link href={`/${other.username}`} className="font-semibold underline">
                  {properName(other.name)}
                </Link>
              ) : (
                <span className="font-semibold">{properName(other.name)}</span>
              )}
              {staff && !isBuyer && !isSeller ? (
                <>
                  {" "}
                  · buyer {properName(order.buyer.name)}, seller{" "}
                  {properName(order.seller.name)}
                </>
              ) : null}
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="text-2xl font-black">{usd(order.priceMinor)}</p>
            {order.packageName ? (
              <p className="font-semibold text-slate-700">
                {order.packageName} · {order.deliveryDays} day
                {order.deliveryDays === 1 ? "" : "s"} · {order.revisions} revision
                {order.revisions === 1 ? "" : "s"}
              </p>
            ) : null}
            <p className="text-slate-500">
              seller receives {usd(order.sellerMinor)} · Godesi {usd(order.feeMinor)}
            </p>
          </div>
        </div>

        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          {order.paidAt ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Paid</dt>
              <dd>{when(order.paidAt)}</dd>
            </div>
          ) : null}
          {order.dueAt && order.status === "PAID" ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Due</dt>
              <dd>{when(order.dueAt)}</dd>
            </div>
          ) : null}
          {order.deliveredAt ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Delivered</dt>
              <dd>{when(order.deliveredAt)}</dd>
            </div>
          ) : null}
          {order.autoReleaseAt && order.status === "DELIVERED" ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">
                Pays the seller on
              </dt>
              <dd>{when(order.autoReleaseAt)} unless the buyer objects</dd>
            </div>
          ) : null}
          {order.releasedAt ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Paid out</dt>
              <dd>{when(order.releasedAt)}</dd>
            </div>
          ) : null}
        </dl>

        {order.resolution ? (
          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
            {order.resolution}
          </p>
        ) : null}
        {order.status === "DISPUTED" && order.disputeReason ? (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            <p className="font-bold">Problem raised by the buyer</p>
            <p className="mt-1 whitespace-pre-line">{order.disputeReason}</p>
            <p className="mt-1 text-xs">
              Godesi staff will read this order and settle it. Payment stays on hold.
            </p>
          </div>
        ) : null}
      </Card>

      <Card>
        <h2 className="font-bold">The brief</h2>
        <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{order.brief}</p>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-bold">Order room</h2>
        {order.messages.length ? (
          <ul className="space-y-3">
            {order.messages.map((message) => (
              <li
                key={message.id}
                className={`rounded-2xl p-3 text-sm ${
                  message.delivery
                    ? "border border-emerald-200 bg-emerald-50"
                    : message.senderId === user.id
                      ? "bg-indigo-50"
                      : "bg-slate-50"
                }`}
              >
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {properName(message.sender.name)}
                  </span>{" "}
                  · {when(message.createdAt)}
                  {message.delivery ? (
                    <span className="ml-2 font-bold text-emerald-700">📦 Delivery</span>
                  ) : null}
                </p>
                <p className="mt-1 whitespace-pre-line text-slate-800">{message.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No messages yet.</p>
        )}

        {open && (isBuyer || isSeller) ? (
          <ActionForm
            action={postGigMessageAction}
            submitLabel="Send"
            pendingLabel="Sending…"
            variant="secondary"
            resetOnSuccess
          >
            <input type="hidden" name="orderId" value={order.id} />
            <textarea
              name="body"
              rows={3}
              required
              className={inputClass}
              placeholder="Ask a question, share a link, agree a detail…"
            />
          </ActionForm>
        ) : null}
      </Card>

      {isSeller && order.status === "PAID" ? (
        <Card className="space-y-3 border-emerald-200">
          <h2 className="font-bold">Deliver the work</h2>
          <p className="text-sm text-slate-600">
            Post the finished work or a link to it. The buyer then has{" "}
            {AUTO_RELEASE_DAYS} days to confirm or raise a problem; if they do
            nothing, {usd(order.sellerMinor)} is released to you automatically.
          </p>
          <ActionForm
            action={deliverGigAction}
            submitLabel="Mark as delivered"
            pendingLabel="Delivering…"
          >
            <input type="hidden" name="orderId" value={order.id} />
            <textarea
              name="body"
              rows={4}
              required
              className={inputClass}
              placeholder="Here is your reading / the file is at this link / summary of what was done…"
            />
          </ActionForm>
          <form action={declineGigAction} className="border-t border-slate-100 pt-3">
            <input type="hidden" name="orderId" value={order.id} />
            <p className="text-xs text-slate-500">
              Can&apos;t take this one? Declining refunds the buyer in full.
            </p>
            <Button type="submit" variant="ghost" className="mt-1 !px-0 text-rose-600">
              Decline and refund the buyer
            </Button>
          </form>
        </Card>
      ) : null}

      {isBuyer && order.status === "DELIVERED" ? (
        <Card className="space-y-3 border-amber-200">
          <h2 className="font-bold">Happy with the work?</h2>
          <form action={acceptGigAction}>
            <input type="hidden" name="orderId" value={order.id} />
            <Button type="submit">
              ✅ Yes — release {usd(order.sellerMinor)} to {properName(order.seller.name)}
            </Button>
          </form>
          <details className="text-sm">
            <summary className="cursor-pointer font-semibold text-rose-700">
              There is a problem
            </summary>
            <div className="mt-2">
              <ActionForm
                action={disputeGigAction}
                submitLabel="Raise a problem"
                pendingLabel="Sending…"
                variant="danger"
              >
                <input type="hidden" name="orderId" value={order.id} />
                <Field
                  label="What went wrong?"
                  hint="Godesi staff read this and the order room, then either release the payment or refund you."
                >
                  <textarea name="reason" rows={4} required className={inputClass} />
                </Field>
              </ActionForm>
            </div>
          </details>
        </Card>
      ) : null}

      {isBuyer && order.status === "PAID" && order.dueAt && order.dueAt < new Date() ? (
        <Card className="space-y-2 border-rose-200">
          <h2 className="font-bold">Delivery is overdue</h2>
          <p className="text-sm text-slate-600">
            The seller promised {order.deliveryDays} day(s). Message them
            first; if there is no answer you can raise a problem and staff will
            refund you.
          </p>
          <ActionForm
            action={disputeGigAction}
            submitLabel="Raise a problem"
            pendingLabel="Sending…"
            variant="danger"
          >
            <input type="hidden" name="orderId" value={order.id} />
            <textarea name="reason" rows={3} required className={inputClass} placeholder="Nothing delivered, no reply since…" />
          </ActionForm>
        </Card>
      ) : null}
    </div>
  );
}
