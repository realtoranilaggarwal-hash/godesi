import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatMoney, siteUrl } from "@/lib/format";
import { Money } from "@/components/Money";
import { formatEventDate, isPast, seatsLeft } from "@/lib/events";
import { gradientFor } from "@/lib/categories";
import { TicketForm } from "@/components/forms/TicketForm";
import { SidebarBanners } from "@/components/Banners";
import { PostedBy } from "@/components/PostedBy";
import { ShareButtons } from "@/components/ShareButtons";
import { VideoEmbed } from "@/components/VideoEmbed";
import { PhotoAlbumGallery } from "@/components/PhotoAlbumGallery";
import { EventPartnerProof } from "@/components/forms/EventPartnerProof";
import { Alert, Badge, Card, LinkButton } from "@/components/ui";
import {
  eventFeatureIcon,
  eventModeIcon,
  eventModeLabel,
} from "@/lib/eventOptions";
import { StaffEditLink } from "@/components/StaffEditLink";
import { metaDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";

async function loadEvent(slug: string) {
  return db.event.findUnique({
    where: { slug },
    include: {
      tiers: { orderBy: { sortOrder: "asc" } },
      speakers: { orderBy: { sortOrder: "asc" } },
      sessions: { orderBy: { sortOrder: "asc" } },
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
    description: metaDescription(
      event.description,
      `${event.title} at ${event.venue}, ${event.city} on ${event.startsAt.toDateString()}.`,
      "See the line-up, ticket prices and directions, and book online on Godesi.",
    ),
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
              {event.eventType ? <Badge tone="amber">{event.eventType}</Badge> : null}
              <Badge>
                {eventModeIcon(event.mode)} {eventModeLabel(event.mode)}
              </Badge>
              {event.frequency === "RECURRING" ? (
                <Badge tone="green">
                  🔁 {event.recurrence || "Recurring"}
                </Badge>
              ) : null}
              {event.partnerStatus === "APPROVED" ? (
                <Badge tone="amber">🔥 Godesi Partner Event</Badge>
              ) : null}
              {past ? <Badge tone="slate">Finished</Badge> : null}
              {left === 0 && !past ? <Badge tone="red">Sold out</Badge> : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black sm:text-3xl">{event.title}</h1>
              <StaffEditLink href={`/admin/events/${event.id}`} />
            </div>
            <div className="grid gap-1 text-sm text-slate-700 sm:grid-cols-2">
              <p>📅 {formatEventDate(event.startsAt)}</p>
              <p>
                📍 {event.venue}
                {event.hallName ? ` — ${event.hallName}` : ""}, {event.city}
                {event.state ? `, ${event.state}` : ""}
                {event.country ? `, ${event.country}` : ""}
              </p>
              {event.address ? <p>🏠 {event.address}</p> : null}
              {event.mapsUrl ? (
                <p>
                  🗺️{" "}
                  <a
                    href={event.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    Open the venue in maps
                  </a>
                </p>
              ) : null}
              {event.onlineUrl ? (
                <p>
                  🔗{" "}
                  <a
                    href={event.onlineUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    Join link
                  </a>
                </p>
              ) : null}
              {event.bonusNote ? (
                <p className="font-semibold text-emerald-700">🎁 {event.bonusNote}</p>
              ) : null}
              {event.websiteUrl ? (
                <p>
                  🌐{" "}
                  <a
                    href={event.websiteUrl}
                    target="_blank"
                    rel="noreferrer nofollow"
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    Event website
                  </a>
                </p>
              ) : null}
              <p>
                🎫{" "}
                {event.price ? (
                  <>
                    {event.tiers.length
                      ? `${event.tiers.length} ticket types from `
                      : null}
                    <Money value={event.price} currency={event.currency} />
                    {event.tiers.length ? null : " per seat"}
                  </>
                ) : event.tiers.length ? (
                  `${event.tiers.length} ticket types from free`
                ) : (
                  "Free entry"
                )}
              </p>
              <p>🪑 {left} of {event.seatsTotal} seats available</p>
            </div>

            {event.features.length ? (
              <div className="flex flex-wrap gap-1.5">
                {event.features.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                  >
                    {eventFeatureIcon(feature)} {feature}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="whitespace-pre-line text-slate-700">{event.description}</p>
            {event.tags.length ? (
              <div className="flex flex-wrap gap-1.5">
                {event.tags.map((tag) => (
                  <Badge key={tag} tone="slate">
                    #{tag}
                  </Badge>
                ))}
              </div>
            ) : null}
            <VideoEmbed url={event.videoUrl} title={event.title} />
            <PhotoAlbumGallery url={event.albumUrl} heading="Event photos" />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <PostedBy user={event.organizer} />
              <ShareButtons
                url={`${siteUrl()}/events/${event.slug}`}
                title={event.title}
              />
            </div>
          </div>
        </div>

        {user?.id === event.organizerId && event.partnerStatus !== "NONE" ? (
          <EventPartnerProof
            eventId={event.id}
            status={event.partnerStatus}
            bannerUrl={event.partnerBannerUrl}
            standeeUrl={event.partnerStandeeUrl}
            salesUrl={event.partnerSalesUrl}
          />
        ) : null}

        {event.sessions.length ? (
          <Card>
            <h2 className="font-bold">Agenda</h2>
            <ul className="mt-3 divide-y divide-slate-100">
              {event.sessions.map((session) => (
                <li key={session.id} className="flex flex-wrap gap-x-3 gap-y-1 py-2">
                  <p className="w-28 shrink-0 text-sm font-semibold text-indigo-700">
                    {session.startTime
                      ? `${session.startTime}${session.endTime ? `–${session.endTime}` : ""}`
                      : "—"}
                  </p>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{session.title}</p>
                    <p className="text-sm text-slate-500">
                      {[session.stage, session.speaker].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        {event.speakers.length ? (
          <Card>
            <h2 className="font-bold">Speakers & guests</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {event.speakers.map((speaker) => (
                <div key={speaker.id} className="flex gap-3">
                  {speaker.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={speaker.photoUrl}
                      alt={speaker.name}
                      className="h-14 w-14 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-lg font-black text-white">
                      {speaker.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{speaker.name}</p>
                    {speaker.bio ? (
                      <p className="text-sm text-slate-600">{speaker.bio}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        {event.tiers.length ? (
          <Card>
            <h2 className="font-bold">Ticket types</h2>
            <ul className="mt-3 divide-y divide-slate-100">
              {event.tiers.map((tier) => (
                <li key={tier.id} className="flex items-center justify-between gap-3 py-2">
                  <div>
                    <p className="font-semibold">{tier.name}</p>
                    <p className="text-sm text-slate-500">
                      {seatsLeft(tier)} of {tier.seatsTotal} seats left
                    </p>
                  </div>
                  <p className="font-bold">
                    {tier.price ? formatMoney(tier.price, event.currency) : "Free"}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <Card>
          <h2 className="font-bold">Organiser</h2>
          {event.business ? (
            <div className="mt-2 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.business.logoUrl || "/placeholder-logo.svg"}
                alt={`${event.business.name} logo`}
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
                currency={event.currency}
                seatsLeft={left}
                maxPerBooking={maxPerBooking}
                tiers={event.tiers.map((tier) => ({
                  id: tier.id,
                  name: tier.name,
                  price: tier.price,
                  seatsLeft: seatsLeft(tier),
                }))}
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
