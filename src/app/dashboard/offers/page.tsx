import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { dealDetails, dealSelect, liveDealWhere, liveDeals } from "@/lib/deals";
import { liveStoreOffers } from "@/lib/storeOffers";
import { circleEvents } from "@/lib/connectCircle";
import { formatEventDate } from "@/lib/events";
import { BENEFITS_TITLE, offerInterest } from "@/lib/offerInterests";
import { Badge, Card } from "@/components/ui";
import { DealCard } from "@/components/DealCard";
import { EventCard } from "@/components/EventCard";
import { StoreOfferCard } from "@/components/StoreOfferCard";
import { OfferInterestsForm } from "@/components/forms/OfferInterestsForm";
import type { PublicDeal } from "@/lib/deals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My member benefits" };

function sameTown(a: string, b: string | null) {
  return !!b && b.toLowerCase().includes(a.trim().toLowerCase());
}

function DealTile({ deal }: { deal: PublicDeal }) {
  return (
    <DealCard
      title={deal.title}
      details={dealDetails(deal)}
      code={deal.code}
      linkUrl={deal.linkUrl}
      expiresAt={deal.expiresAt}
      business={{
        slug: deal.business.slug,
        name: deal.business.name,
        city: deal.business.city,
        logoUrl: deal.business.logoUrl,
        icon: deal.business.categoryRef?.icon,
        line:
          deal.business.subcategoryRef?.name ?? deal.business.categoryRef?.name,
      }}
    />
  );
}

function Section({
  title,
  more,
  children,
}: {
  title: string;
  more?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold">{title}</h2>
        {more ? (
          <Link
            href={more.href}
            className="text-sm font-semibold text-indigo-700 hover:underline"
          >
            {more.label} →
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export default async function DashboardOffersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/offers");

  const town = user.location?.split(",")[0]?.trim() ?? "";
  const [wonSpins, tickets, deals, storeOffers, localEvents] =
    await Promise.all([
      db.dailySpin.findMany({
        where: { userId: user.id, deal: liveDealWhere() },
        orderBy: { createdAt: "desc" },
        take: 12,
        select: { deal: { select: dealSelect } },
      }),
      db.ticket.findMany({
        where: {
          userId: user.id,
          status: "CONFIRMED",
          event: { startsAt: { gte: new Date() } },
        },
        orderBy: { event: { startsAt: "asc" } },
        take: 6,
        select: {
          id: true,
          code: true,
          quantity: true,
          event: {
            select: { title: true, slug: true, startsAt: true, timeZone: true },
          },
        },
      }),
      liveDeals({ take: 60 }),
      liveStoreOffers(6),
      town ? circleEvents(town, 3) : Promise.resolve([]),
    ]);
  const upcoming = localEvents.length
    ? localEvents
    : await db.event.findMany({
        where: { status: "APPROVED", startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        take: 3,
        include: {
          category: { select: { name: true, icon: true, color: true } },
        },
      });

  const won = Array.from(
    new Map(
      wonSpins.flatMap((spin) =>
        spin.deal ? [[spin.deal.id, spin.deal]] : [],
      ),
    ).values(),
  );
  const wonIds = new Set(won.map((deal) => deal.id));
  const forYou = deals
    .filter((deal) => !wonIds.has(deal.id))
    .sort(
      (a, b) =>
        Number(town ? sameTown(town, b.business.city) : false) -
        Number(town ? sameTown(town, a.business.city) : false),
    )
    .slice(0, 6);
  const picks = user.offerInterests.flatMap((id) => {
    const item = offerInterest(id);
    return item ? [item] : [];
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/dashboard" className="text-sm font-semibold text-indigo-600">
        ← Dashboard
      </Link>
      <div>
        <h1 className="text-2xl font-bold">🎁 {BENEFITS_TITLE}</h1>
        <p className="mt-1 text-sm text-slate-600">
          Your coupons, discounts, event deals and shopping offers in one place.
          No purchase needed, and nobody contacts you unless you say so below.
        </p>
        {picks.length ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">
              Personalised for:
            </span>
            {picks.map((item) => (
              <Badge key={item.id} tone="indigo">
                {item.icon} {item.label}
              </Badge>
            ))}
            <Badge tone={user.offerContactOk ? "green" : "slate"}>
              {user.offerContactOk
                ? "📞 Providers may contact you"
                : "🔕 No contact"}
            </Badge>
          </div>
        ) : null}
      </div>

      {won.length ? (
        <Section title="🎰 Deals you won on the daily spin">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {won.map((deal) => (
              <DealTile key={deal.id} deal={deal} />
            ))}
          </div>
        </Section>
      ) : null}

      {tickets.length ? (
        <Section
          title="🎟️ Your upcoming tickets"
          more={{ href: "/dashboard/tickets", label: "All my tickets" }}
        >
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            {tickets.map((ticket) => (
              <li
                key={ticket.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <Link
                  href={`/events/${ticket.event.slug}`}
                  className="font-semibold hover:underline"
                >
                  {ticket.event.title}
                </Link>
                <span className="text-slate-500">
                  {formatEventDate(
                    ticket.event.startsAt,
                    ticket.event.timeZone,
                  )}{" "}
                  · {ticket.quantity} × <code>{ticket.code}</code>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section
        title={`🏷️ Business discounts${town ? ` — ${town} first` : ""}`}
        more={{ href: "/deals", label: "All deals" }}
      >
        {forYou.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forYou.map((deal) => (
              <DealTile key={deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No business deals running right now — check back soon.
          </p>
        )}
      </Section>

      {upcoming.length ? (
        <Section
          title={`📅 Upcoming events${localEvents.length ? ` in ${town}` : ""}`}
          more={{ href: "/events", label: "All events" }}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} variant="tile" />
            ))}
          </div>
        </Section>
      ) : null}

      {storeOffers.length ? (
        <Section
          title="🛒 Online shopping coupons"
          more={{ href: "/shop", label: "More in the shop" }}
        >
          <p className="-mt-2 text-xs text-slate-500">
            Paid links: GoDesi may earn a commission when you buy, at no extra
            cost to you. Terms are set by each store.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {storeOffers.map((offer) => (
              <StoreOfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </Section>
      ) : null}

      <Card className="space-y-4">
        <h2 className="text-lg font-bold">
          ⚙️ Your interests and contact choice
        </h2>
        <OfferInterestsForm
          selected={user.offerInterests}
          phone={user.offerPhone ?? ""}
          contactOk={user.offerContactOk}
        />
      </Card>
    </div>
  );
}
