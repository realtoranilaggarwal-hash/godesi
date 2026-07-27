import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatMoney, siteUrl } from "@/lib/format";
import { formatEventDate, isPast, seatsLeft } from "@/lib/events";
import { gradientFor } from "@/lib/categories";
import { TicketForm } from "@/components/forms/TicketForm";
import { SidebarBanners } from "@/components/Banners";
import { PostedBy } from "@/components/PostedBy";
import { ShareButtons } from "@/components/ShareButtons";
import { Alert, Badge, Card, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";

async function loadEvent(slug: string) {
  return db.event.findUnique({
    where: { slug },
    include: {
      category: { select: { slug: true, name: true, icon: true, color: true } },
      organizer: {
        select: { name: true, username: true, avatarUrl: true },
      },
      business: { select: { slug: true, name: true, logoUrl: true, city: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const event = await loadEvent(params.slug);
  if (!event) return { title: "Event not found" };
  return {
    title: `${event.title} — ${event.city}`,
    description: event.description.slice(0, 160),
    alternates: { canonical: `${siteUrl()}/events/${event.slug}` },
    openGraph: { images: event.imageUrl ? [event.imageUrl] : undefined },
  };
}

export default async function EventPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { error?: string };
}) {
  const event = await loadEvent(params.slug);
  if (!event || event.status === "REJECTED") notFound();

  const user = await getCurrentUser();
  const left = seatsLeft(event);
  const past = isPast(event);
  const maxPerBooking = Math.min(10, left);

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        {searchParams.error === "cancelled" ? (
          <Alert>Payment cancelled — your seats were not booked.</Alert>
        ) : null}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {event.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.imageUrl} alt={event.title} className="h-56 w-full object-cover" />
          ) : (
            <div
              className={`flex h-40 items-center justify-center bg-gradient-to-br ${gradientFor(
                event.category?.color ?? "rose",
              )} text-6xl`}
              aria-hidden
            >
              {event.category?.icon ?? "🎉"}
            </div>
          )}
          <div className="space-y-3 p-5">
            <div className="flex flex-wrap items-center gap-2">
              {event.category ? (
                <Link href={`/categories/${event.category.slug}`}>
                  <Badge tone="indigo">
                    {event.category.icon} {event.category.name}
                  </Badge>
                </Link>
              ) : null}
              {past ? <Badge tone="slate">Finished</Badge> : null}
              {left === 0 && !past ? <Badge tone="red">Sold out</Badge> : null}
            </div>

            <h1 className="text-2xl font-black sm:text-3xl">{event.title}</h1>
            <div className="grid gap-1 text-sm text-slate-700 sm:grid-cols-2">
              <p>📅 {formatEventDate(event.startsAt)}</p>
              <p>
                📍 {event.venue}, {event.city}
              </p>
              <p>
                🎫 {event.price ? `${formatMoney(event.price, event.currency)} per seat` : "Free entry"}
              </p>
              <p>🪑 {left} of {event.seatsTotal} seats available</p>
            </div>
            <p className="whitespace-pre-line text-slate-700">{event.description}</p>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <PostedBy user={event.organizer} />
              <ShareButtons
                url={`${siteUrl()}/events/${event.slug}`}
                title={event.title}
              />
            </div>
          </div>
        </div>

        <Card>
          <h2 className="font-bold">Organiser</h2>
          {event.business ? (
            <div className="mt-2 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.business.logoUrl || "/placeholder-logo.svg"}
                alt=""
                className="h-12 w-12 rounded-xl object-cover"
              />
              <div>
                <Link
                  href={`/b/${event.business.slug}`}
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  {event.business.name}
                </Link>
                <p className="text-sm text-slate-500">{event.business.city}</p>
              </div>
            </div>
          ) : (
            <PostedBy user={event.organizer} className="mt-1" />
          )}
        </Card>

        <Card>
          <h2 className="font-bold">Book your seats</h2>
          {past ? (
            <p className="mt-2 text-sm text-slate-600">This event has already taken place.</p>
          ) : left === 0 ? (
            <p className="mt-2 text-sm text-slate-600">All seats are booked.</p>
          ) : !user ? (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-slate-600">Sign in to book a seat.</p>
              <LinkButton href={`/login?next=/events/${event.slug}`}>Sign in to book</LinkButton>
            </div>
          ) : (
            <div className="mt-3">
              <TicketForm
                eventId={event.id}
                price={event.price}
                seatsLeft={left}
                maxPerBooking={maxPerBooking}
                defaultName={user.name}
                defaultEmail={user.email}
              />
            </div>
          )}
        </Card>
      </div>

      <SidebarBanners />
    </div>
  );
}
