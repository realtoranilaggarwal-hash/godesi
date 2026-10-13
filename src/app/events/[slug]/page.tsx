import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatMoney, siteUrl } from "@/lib/format";
import { Money } from "@/components/Money";
import { formatEventDate, formatEventEnd, isPast, seatsLeft } from "@/lib/events";
import { TicketForm } from "@/components/forms/TicketForm";
import { InContentBanner, SidebarBanners } from "@/components/Banners";
import { EventCard } from "@/components/EventCard";
import { PostedBy } from "@/components/PostedBy";
import { ShareButtons } from "@/components/ShareButtons";
import { AddToCalendar } from "@/components/AddToCalendar";
import { EventEmbed } from "@/components/EventEmbed";
import { EventClaimPitch } from "@/components/EventClaimPitch";
import { VideoEmbed } from "@/components/VideoEmbed";
import { PhotoAlbumGallery } from "@/components/PhotoAlbumGallery";
import { eventTheme } from "@/lib/eventTheme";
import { EventPartnerProof } from "@/components/forms/EventPartnerProof";
import { Alert, Badge, Card, LinkButton } from "@/components/ui";
import {
  eventFeatureIcon,
  eventModeIcon,
  eventModeLabel,
} from "@/lib/eventOptions";
import {
  eventCategoryIcon,
  eventCategoryLabel,
  eventLanguageLabel,
} from "@/lib/eventCategories";
import { StaffEditLink } from "@/components/StaffEditLink";
import { metaDescription } from "@/lib/seo";
import { platformFeePercent } from "@/lib/connect";

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
      source: { select: { name: true, websiteUrl: true } },
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
  // Imported from someone else's public calendar: we list it and send people to
  // the organiser. Godesi sells no seats for it, so the booking box would lie.
  const imported = event.sourceId !== null;
  const left = seatsLeft(event);
  const theme = eventTheme(
    event.title,
    event.category?.icon,
    event.category?.color,
  );
  const past = isPast(event);
  const maxPerBooking = Math.min(10, left);
  const endLabel = event.endsAt
    ? formatEventEnd(event.startsAt, event.endsAt, event.timeZone)
    : null;

  // The page runs out of content well before the ad rail does, so it ends with
  // what the visitor most likely wants next: the same kind of event, or
  // anything else on in their city.
  const related = await db.event.findMany({
    where: {
      status: "APPROVED",
      startsAt: { gte: new Date() },
      id: { not: event.id },
      OR: [
        { city: { equals: event.city, mode: "insensitive" } },
        ...(event.genres.length ? [{ genres: { hasSome: event.genres } }] : []),
        ...(event.state
          ? [{ state: { equals: event.state, mode: "insensitive" as const } }]
          : []),
      ],
    },
    orderBy: { startsAt: "asc" },
    take: 8,
    include: {
      category: { select: { name: true, icon: true, color: true } },
    },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description.slice(0, 500),
    startDate: event.startsAt.toISOString(),
    endDate: event.endsAt?.toISOString(),
    eventAttendanceMode:
      event.mode === "ONLINE"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : event.mode === "HYBRID"
          ? "https://schema.org/MixedEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    url: `${siteUrl()}/events/${event.slug}`,
    image: event.imageUrl ?? undefined,
    ...(event.mode === "ONLINE"
      ? {
          location: {
            "@type": "VirtualLocation",
            url: event.onlineUrl ?? `${siteUrl()}/events/${event.slug}`,
          },
        }
      : {
          location: {
            "@type": "Place",
            name: [event.venue, event.hallName].filter(Boolean).join(" — "),
            address: {
              "@type": "PostalAddress",
              streetAddress: event.address ?? undefined,
              addressLocality: event.city,
              addressRegion: event.state ?? undefined,
              addressCountry: event.country ?? undefined,
            },
          },
        }),
    organizer: {
      "@type": "Organization",
      name: event.business?.name ?? event.organizer?.name ?? "Godesi",
      url: event.business
        ? `${siteUrl()}/b/${event.business.slug}`
        : siteUrl(),
    },
    // Imported events are ticketed elsewhere, so no offer is claimed for them.
    ...(imported
      ? {}
      : {
          offers: {
            "@type": "Offer",
            price: event.price,
            priceCurrency: event.currency,
            availability:
              left > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/SoldOut",
            url: `${siteUrl()}/events/${event.slug}`,
          },
        }),
  };

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {searchParams.error === "cancelled" ? (
          <Alert>Payment cancelled — your seats were not booked.</Alert>
        ) : null}

        {/* Where the visitor is, and the way back to the list they came from. */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1 text-sm text-slate-500"
        >
          <Link href="/events" className="font-semibold text-indigo-600 hover:underline">
            ← All events
          </Link>
          {event.genres.length ? (
            <>
              <span aria-hidden>/</span>
              <Link
                href={`/events?genre=${event.genres[0]}`}
                className="font-semibold text-indigo-600 hover:underline"
              >
                {eventCategoryIcon(event.genres[0])}{" "}
                {eventCategoryLabel(event.genres[0])}
              </Link>
            </>
          ) : null}
          {event.category ? (
            <>
              <span aria-hidden>/</span>
              <Link
                href={`/events?category=${event.category.slug}`}
                className="font-semibold text-indigo-600 hover:underline"
              >
                {event.category.icon} {event.category.name}
              </Link>
            </>
          ) : null}
          <span aria-hidden>/</span>
          <Link
            href={`/events?city=${encodeURIComponent(event.city)}`}
            className="font-semibold text-indigo-600 hover:underline"
          >
            {event.city}
          </Link>
        </nav>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {event.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.imageUrl} alt={event.title} className="h-56 w-full object-cover" />
          ) : null}
          <div className="space-y-3 p-5">
            <div className="flex flex-wrap items-center gap-2">
              {event.category ? (
                <Link href={`/categories/${event.category.slug}`}>
                  <Badge tone="indigo">
                    {event.category.icon} {event.category.name}
                  </Badge>
                </Link>
              ) : null}
              {event.genres.map((slug) => (
                <Link key={slug} href={`/events?genre=${slug}`}>
                  <Badge tone="amber">
                    {eventCategoryIcon(slug)} {eventCategoryLabel(slug)}
                  </Badge>
                </Link>
              ))}
              {event.languages.map((slug) => (
                <Link key={slug} href={`/events?lang=${slug}`}>
                  <Badge tone="green">{eventLanguageLabel(slug)}</Badge>
                </Link>
              ))}
              {event.genres.length || !event.eventType ? null : (
                <Badge tone="amber">{event.eventType}</Badge>
              )}
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
              {left === 0 && !past && !imported ? (
                <Badge tone="red">Sold out</Badge>
              ) : null}
              {imported ? <Badge tone="slate">📅 Community calendar</Badge> : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="flex items-center gap-2 text-2xl font-black sm:text-3xl">
                {event.imageUrl ? null : (
                  <span aria-hidden>{theme.icon}</span>
                )}
                {event.title}
              </h1>
              <StaffEditLink href={`/admin/events/${event.id}`} />
            </div>
            <div className="grid gap-1 text-sm text-slate-700 sm:grid-cols-2">
              <p>
                📅 {formatEventDate(event.startsAt, event.timeZone)}
                {endLabel ? ` – ${endLabel}` : ""}
              </p>
              <p>
                📍{" "}
                <Link
                  href={`/events?venue=${encodeURIComponent(event.venue)}`}
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  {event.venue}
                </Link>
                {event.hallName ? ` — ${event.hallName}` : ""},{" "}
                <Link
                  href={`/events?city=${encodeURIComponent(event.city)}`}
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  {event.city}
                </Link>
                {event.state ? (
                  <>
                    ,{" "}
                    <Link
                      href={`/events?state=${encodeURIComponent(event.state)}`}
                      className="font-semibold text-indigo-600 hover:underline"
                    >
                      {event.state}
                    </Link>
                  </>
                ) : null}
                {event.country ? `, ${event.country}` : ""}
              </p>
              {event.hallName || event.hallCapacity || event.venueUrl ? (
                <p>
                  🏛️{" "}
                  {event.hallName ? <strong>{event.hallName}</strong> : "Hall"}
                  {event.hallCapacity
                    ? ` · holds about ${event.hallCapacity.toLocaleString("en-IN")} people`
                    : ""}
                  {event.venueUrl ? (
                    <>
                      {" · "}
                      <a
                        href={event.venueUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-indigo-600 hover:underline"
                      >
                        venue website
                      </a>
                    </>
                  ) : null}
                </p>
              ) : null}
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
                ) : imported ? (
                  "Entry terms: see the organiser"
                ) : (
                  "Free entry"
                )}
              </p>
              {imported ? null : (
                <p>🪑 {left} of {event.seatsTotal} seats available</p>
              )}
            </div>

            {past ? null : (
              <AddToCalendar
                slug={event.slug}
                title={event.title}
                startsAt={event.startsAt}
                endsAt={event.endsAt}
                place={[
                  event.hallName,
                  event.venue,
                  event.address,
                  event.city,
                  event.state,
                ]
                  .filter(Boolean)
                  .join(", ")}
                details={`${siteUrl()}/events/${event.slug}`}
              />
            )}

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

        <Card>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
            <div className="min-w-0">
              <h2 className="font-bold">Put this event on your own website</h2>
              <p className="mb-3 mt-1 text-sm text-slate-600">
                Copy this code into your site and the card below appears there,
                always up to date. Visitors tap it and book here — free, no
                account needed on their side.
              </p>
              <EventEmbed
                eventUrl={`${siteUrl()}/events/${event.slug}`}
                title={event.title}
              />
            </div>

            {imported ? (
              <EventClaimPitch
                anchorId="claim-event"
                eventId={event.id}
                slug={event.slug}
                signedIn={Boolean(user)}
              />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Organisers
                </p>
                <h3 className="mt-1 text-base font-black text-slate-900">
                  Running your own event?
                </h3>
                <p className="mt-2">
                  Listing is free and unlimited. We keep{" "}
                  {platformFeePercent()}% of tickets you sell on the free plan
                  and nothing on a paid plan, and free-entry events never cost
                  anything.
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <LinkButton href="/events/new">Post your event free</LinkButton>
                  <Link
                    href="/events/how-it-works"
                    className="text-sm font-bold text-indigo-600 hover:underline"
                  >
                    Fees, tickets and where you get listed →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </Card>

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
          {event.claimedAt && event.importedFrom ? (
            <p className="mt-2 text-xs text-slate-500">
              Claimed by the organiser. First listed from {event.importedFrom}.
            </p>
          ) : null}
        </Card>

        {imported ? (
          <Card>
            <h2 className="font-bold">Tickets and details</h2>
            <p className="mt-2 text-sm text-slate-600">
              Godesi listed this event from the organiser&apos;s public listing
              and does not sell tickets for it. Check times and entry with the
              organiser before travelling.
            </p>
            {event.websiteUrl ? (
              <div className="mt-3">
                <LinkButton href={event.websiteUrl} target="_blank">
                  Open the organiser&apos;s page
                </LinkButton>
              </div>
            ) : null}
            <p className="mt-3 text-sm text-emerald-800">
              <span className="font-bold">Is this your event?</span> Claim it
              free and sell these seats here instead — {platformFeePercent()}% on
              the free plan, nothing on a paid one.{" "}
              <a href="#claim-event" className="font-bold underline">
                Claim it below
              </a>{" "}
              or read{" "}
              <Link
                href="/events/how-it-works"
                className="font-bold underline"
              >
                how events work on Godesi
              </Link>
              .
            </p>
          </Card>
        ) : (
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
        )}

        <InContentBanner size="leaderboard" />

        {related.length ? (
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold">More events like this</h2>
              <Link
                href={`/events?city=${encodeURIComponent(event.city)}`}
                className="text-sm font-semibold text-indigo-600 hover:underline"
              >
                All events in {event.city} →
              </Link>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <EventCard key={item.id} event={item} variant="tile" />
              ))}
            </div>
          </Card>
        ) : null}
      </div>

      <SidebarBanners />
    </div>
  );
}
