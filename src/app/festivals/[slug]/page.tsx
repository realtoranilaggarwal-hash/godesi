import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";
import { FAITH_LABELS } from "@/lib/worship";
import {
  FESTIVALS,
  festivalBySlug,
  festivalDates,
  festivalSlug,
  formatFestivalDate,
} from "@/lib/festivals";
import { EventCard } from "@/components/EventCard";
import { ShareButtons } from "@/components/ShareButtons";
import { SidebarBanners } from "@/components/Banners";
import { Card, LinkButton } from "@/components/ui";

export const revalidate = 3600;

export function generateStaticParams() {
  return FESTIVALS.map((festival) => ({ slug: festivalSlug(festival) }));
}

function nextDate(dates: Date[], now = new Date()) {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return dates.find((date) => date.getTime() >= today) ?? null;
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const festival = festivalBySlug(params.slug);
  if (!festival) return { title: "Festival not found" };
  const next = nextDate(festivalDates(festival));
  const year = next ? next.getUTCFullYear() : "";
  return {
    title: `${festival.name} ${year} date in the USA — events near you`,
    description: `${festival.name} ${year}${next ? ` is on ${formatFestivalDate(next)}` : ""}. ${festival.blurb} Find ${festival.name} events, pujas and parties near you on GoDesi.`,
    alternates: {
      canonical: `${siteUrl()}/festivals/${festivalSlug(festival)}`,
    },
  };
}

export default async function FestivalPage({
  params,
}: {
  params: { slug: string };
}) {
  const festival = festivalBySlug(params.slug);
  if (!festival) notFound();

  const dates = festivalDates(festival);
  const next = nextDate(dates);
  const url = `${siteUrl()}/festivals/${festivalSlug(festival)}`;

  const events = await db.event.findMany({
    where: {
      status: "APPROVED",
      startsAt: { gte: new Date() },
      OR: [
        ...(festival.genre ? [{ genres: { has: festival.genre } }] : []),
        ...festival.keywords.map((keyword) => ({
          title: { contains: keyword, mode: "insensitive" as const },
        })),
      ],
    },
    orderBy: { startsAt: "asc" },
    take: 24,
    include: {
      category: { select: { name: true, icon: true, color: true } },
    },
  });

  const faq = [
    ...(next
      ? [
          {
            q: `When is ${festival.name} ${next.getUTCFullYear()}?`,
            a: `${festival.name} ${next.getUTCFullYear()} falls on ${formatFestivalDate(next)}. Lunar festivals can be marked a day apart in the US and India, so check with your local temple or community group.`,
          },
        ]
      : []),
    {
      q: `What is ${festival.name}?`,
      a: festival.blurb,
    },
    {
      q: `Where can I celebrate ${festival.name} near me?`,
      a: `GoDesi lists ${festival.name} events posted by temples, clubs and organisers across the US — see the list on this page, or post your own event free.`,
    },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const others = FESTIVALS.filter((other) => other.name !== festival.name);

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <section className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-5 py-8 text-white sm:px-8">
          <Link
            href="/festivals"
            className="text-xs font-semibold uppercase tracking-widest text-white/80 hover:underline"
          >
            ← Festival calendar
          </Link>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            {festival.emoji} {festival.name}
            {next ? ` ${next.getUTCFullYear()}` : ""}
          </h1>
          {next ? (
            <p className="mt-2 text-xl font-bold">{formatFestivalDate(next)}</p>
          ) : null}
          <p className="mt-2 max-w-2xl text-white/90">{festival.blurb}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href="/events/new" variant="secondary">
              Post a {festival.name} event free
            </LinkButton>
            <LinkButton
              href={`/religious?faith=${festival.faith}`}
              variant="secondary"
            >
              {FAITH_LABELS[festival.faith]} near you
            </LinkButton>
          </div>
        </section>

        <Card>
          <h2 className="font-bold">
            {festival.name} events near you ({events.length})
          </h2>
          {events.length ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} variant="tile" />
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              Nothing posted yet. Running a {festival.name} puja, party or mela?
              Post it free and it shows here, on the events page and in our
              social channels.
            </p>
          )}
          {festival.genre ? (
            <Link
              href={`/events?genre=${festival.genre}`}
              className="mt-3 inline-block text-sm font-bold text-indigo-600 hover:underline"
            >
              See all {festival.name} events →
            </Link>
          ) : null}
        </Card>

        <Card>
          <h2 className="mb-2 font-bold">{festival.name} dates</h2>
          <ul className="space-y-1 text-sm">
            {dates.map((date) => (
              <li key={date.toISOString()}>
                <span className="font-semibold">{date.getUTCFullYear()}:</span>{" "}
                {formatFestivalDate(date)}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="mb-2 font-bold">Questions</h2>
          <dl className="space-y-3 text-sm">
            {faq.map((item) => (
              <div key={item.q}>
                <dt className="font-semibold text-slate-900">{item.q}</dt>
                <dd className="text-slate-600">{item.a}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <h2 className="mb-2 font-bold">Share with family</h2>
          <ShareButtons
            url={url}
            title={`${festival.name}${next ? ` ${next.getUTCFullYear()} — ${formatFestivalDate(next)}` : ""}`}
          />
        </Card>

        <Card>
          <h2 className="mb-2 font-bold">Other festivals</h2>
          <div className="flex flex-wrap gap-2">
            {others.map((other) => (
              <Link
                key={other.name}
                href={`/festivals/${festivalSlug(other)}`}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm hover:border-amber-400"
              >
                {other.emoji} {other.name}
              </Link>
            ))}
          </div>
        </Card>
      </div>
      <SidebarBanners />
    </div>
  );
}
