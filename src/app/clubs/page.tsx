import type { Metadata } from "next";
import Link from "next/link";
import { ClubCard } from "@/components/ClubCard";
import { Card, EmptyState, LinkButton, inputClass } from "@/components/ui";
import { CLUB_CATEGORIES } from "@/lib/clubs";
import { listClubs } from "@/lib/clubQueries";
import { weddingServiceSlug } from "@/lib/wedding";

/** Trades clubs book for their meets; each links to its listings on GoDesi. */
const CLUB_VENDORS = [
  { icon: "🎧", service: "DJ & Sound" },
  { icon: "🎤", service: "Singers" },
  { icon: "🎸", service: "Live Bands" },
  { icon: "🍛", service: "Caterers" },
  { icon: "🏛️", service: "Banquet Halls & Venues" },
  { icon: "📸", service: "Photographers" },
  { icon: "🎉", service: "Decorators & Florists" },
  { icon: "🎙️", service: "Anchors & Artists" },
  { icon: "🥁", service: "Dhol & Baraat" },
  { icon: "💃", service: "Dance Choreographers" },
];

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Desi clubs near you — karaoke, cricket, food, travel & more",
  description:
    "Find your people: join a desi singing circle, cricket team, foodie group or business club near you, or start your own on GoDesi and run its events, RSVPs and contributions in one place.",
  alternates: { canonical: "/clubs" },
};

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: { category?: string; city?: string; q?: string };
}) {
  const clubs = await listClubs(searchParams);
  const active = searchParams.category;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">GoDesi Clubs 🎤🏏🍛</h1>
          <p className="max-w-2xl text-sm text-slate-600">
            Find your people. Karaoke circles, cricket teams, foodie groups,
            travel gangs, business networks — a club is permanent, its events
            come and go, and members say what they&rsquo;re bringing and doing
            at each one.
          </p>
        </div>
        <LinkButton href="/clubs/new">Start a club</LinkButton>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/clubs"
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            !active
              ? "bg-indigo-600 text-white"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          All
        </Link>
        {CLUB_CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/clubs?category=${c.slug}`}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              active === c.slug
                ? "bg-indigo-600 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {c.emoji} {c.label}
          </Link>
        ))}
      </div>

      <form className="flex gap-2" action="/clubs">
        {active ? <input type="hidden" name="category" value={active} /> : null}
        <input
          name="q"
          defaultValue={searchParams.q ?? ""}
          placeholder="Search clubs by name or city…"
          className={inputClass}
        />
        <button className="rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white">
          Search
        </button>
      </form>

      {clubs.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club) => (
            <ClubCard key={club.slug} club={club} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No clubs here yet"
          body="Be the first — start a club, invite your friends, and post your next meet as an event."
          action={<LinkButton href="/clubs/new">Start a club</LinkButton>}
        />
      )}

      <Card>
        <h2 className="font-bold text-slate-900">How clubs work</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700">
          <li>
            An organiser starts the club — public (anyone joins) or private
            (requests need approval).
          </li>
          <li>
            Members join from the club page; organisers approve, remove and
            promote members.
          </li>
          <li>
            Organisers post events under the club. Members RSVP and say whether
            they&rsquo;re singing, bringing food, or chipping in — the organiser
            sees the tally.
          </li>
          <li>
            A YouTube playlist on the club page keeps the songs and clips from
            past meets in one place.
          </li>
        </ol>
      </Card>

      <Card className="!border-2 !border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-white">
        <h2 className="font-bold text-slate-900">
          DJs, singers, caterers, halls &mdash; clubs are your customers
        </h2>
        <p className="mt-1 text-sm text-slate-700">
          Every club here runs karaoke nights, cricket socials, potlucks and
          parties, and each one needs a DJ, sound, singers, food, a hall or a
          photographer. List your business free and organisers find you from the
          club and event pages when they plan the next meet.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {CLUB_VENDORS.map((v) => (
            <Link
              key={v.service}
              href={`/wedding?service=${weddingServiceSlug(v.service)}`}
              className="rounded-full border border-fuchsia-200 bg-white px-3 py-1 text-xs font-semibold text-fuchsia-900 hover:bg-fuchsia-100"
            >
              {v.icon} {v.service}
            </Link>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href="/signup">List my business free</LinkButton>
          <LinkButton href="/advertise" variant="secondary">
            Advertise to club organisers
          </LinkButton>
        </div>
      </Card>
    </div>
  );
}
