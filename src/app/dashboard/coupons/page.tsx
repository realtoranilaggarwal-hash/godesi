import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { describeCoupon } from "@/lib/coupons";
import { toggleCouponAction } from "@/app/actions/coupons";
import {
  EventCouponForm,
  SendCompTicketsForm,
} from "@/components/forms/CouponForms";
import { compTicketEventOptions } from "@/lib/compTickets";
import { Badge, Card, EmptyState, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Event coupons" };

export default async function MyCouponsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/coupons");

  const [events, coupons] = await Promise.all([
    db.event.findMany({
      where: { organizerId: user.id },
      orderBy: { startsAt: "desc" },
      select: {
        id: true,
        title: true,
        startsAt: true,
        currency: true,
        sourceId: true,
        tiers: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, price: true, kind: true },
        },
      },
    }),
    db.coupon.findMany({
      where: { createdById: user.id },
      orderBy: { createdAt: "desc" },
      include: { event: { select: { title: true } } },
    }),
  ]);

  const compEvents = compTicketEventOptions(
    events.filter((event) => event.startsAt.getTime() >= Date.now() - 2 * 86_400_000),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Event coupons 🎟️</h1>
        <LinkButton href="/dashboard/tickets" variant="secondary">
          My events
        </LinkButton>
      </div>

      <Card>
        <h2 className="mb-1 text-lg font-bold">Create a coupon</h2>
        <p className="mb-3 text-sm text-slate-500">
          Give your customers a code they can enter when booking tickets for your event.
          Each customer can use a code once.
        </p>
        {events.length ? (
          <EventCouponForm
            events={events.map((event) => ({ id: event.id, title: event.title }))}
          />
        ) : (
          <EmptyState
            title="No events yet"
            body="Post an event first, then create discount codes for it."
            action={<LinkButton href="/events/new">Post an event</LinkButton>}
          />
        )}
      </Card>

      {compEvents.length ? (
        <Card id="send-comp-tickets">
          <h2 className="mb-1 text-lg font-bold">Send comp tickets 🎁</h2>
          <p className="mb-3 text-sm text-slate-500">
            Paid by Zelle or cash, or a guest? Pick the tickets, and we email the
            buyer a one-use code that makes exactly those tickets free. Their QR
            passes arrive when they book with it.
          </p>
          <SendCompTicketsForm events={compEvents} />
        </Card>
      ) : null}

      <Card>
        <h2 className="mb-3 text-lg font-bold">Your codes</h2>
        {coupons.length ? (
          <ul className="divide-y divide-slate-100 text-sm">
            {coupons.map((coupon) => (
              <li key={coupon.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-semibold">
                    {coupon.code}{" "}
                    <Badge tone={coupon.active ? "green" : "slate"}>
                      {coupon.active ? "active" : "off"}
                    </Badge>
                  </p>
                  <p className="text-xs text-slate-500">
                    {describeCoupon(coupon)} · {coupon.event?.title ?? "any event"} ·{" "}
                    {coupon.timesRedeemed}
                    {coupon.maxRedemptions ? `/${coupon.maxRedemptions}` : ""} used
                    {coupon.expiresAt
                      ? ` · expires ${coupon.expiresAt.toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <form action={toggleCouponAction}>
                  <input type="hidden" name="id" value={coupon.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                  >
                    {coupon.active ? "switch off" : "switch on"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No coupons yet.</p>
        )}
      </Card>
    </div>
  );
}
