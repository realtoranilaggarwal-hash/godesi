import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  compTierList,
  describeCoupon,
  loadCompEvents,
  readCompTiers,
} from "@/lib/coupons";
import { toggleCouponAction } from "@/app/actions/coupons";
import {
  CompTicketForm,
  EventCouponForm,
} from "@/components/forms/CouponForms";
import { Badge, Card, EmptyState, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Event coupons" };

export default async function MyCouponsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/coupons");

  const [events, coupons, compEvents] = await Promise.all([
    db.event.findMany({
      where: { organizerId: user.id },
      orderBy: { startsAt: "desc" },
      select: { id: true, title: true },
    }),
    db.coupon.findMany({
      where: { createdById: user.id },
      orderBy: { createdAt: "desc" },
      include: { event: { select: { title: true } } },
    }),
    loadCompEvents({ organizerId: user.id }),
  ]);

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
          <EventCouponForm events={events} />
        ) : (
          <EmptyState
            title="No events yet"
            body="Post an event first, then create discount codes for it."
            action={<LinkButton href="/events/new">Post an event</LinkButton>}
          />
        )}
      </Card>

      {compEvents.length ? (
        <Card id="comp-tickets">
          <h2 className="mb-1 text-lg font-bold">Send comp tickets 🎁</h2>
          <p className="mb-3 text-sm text-slate-500">
            Paid you by cash or Zelle, or a guest? Pick their tickets and we
            email them a one-use code that makes those tickets free at checkout,
            so they get real QR tickets.
          </p>
          <CompTicketForm events={compEvents} />
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
                    {describeCoupon(coupon)}
                    {readCompTiers(coupon.compTiers).length
                      ? ` · comp: ${compTierList(readCompTiers(coupon.compTiers))}`
                      : ""}{" "}
                    · {coupon.event?.title ?? "any event"} ·{" "}
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
