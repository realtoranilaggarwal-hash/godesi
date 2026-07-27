import Link from "next/link";
import { db } from "@/lib/db";
import { planRank } from "@/lib/plans";
import { EventCard } from "@/components/EventCard";
import { formatEventDate } from "@/lib/events";

/** Upcoming events whose organiser is on a paid plan, newest first. */
async function paidEvents(take: number) {
  const rows = await db.event.findMany({
    where: { status: "APPROVED", startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    take: 40,
    include: {
      category: { select: { name: true, icon: true, color: true } },
      organizer: { select: { plan: true } },
    },
  });

  return rows.filter((row) => planRank(row.organizer.plan) > 0).slice(0, take);
}

const UPGRADE_COPY =
  "Upgrade to put your event at the top of this list and above free events in search.";

export async function FeaturedEventStrip({ take = 12 }: { take?: number }) {
  const events = await paidEvents(take);

  return (
    <section aria-label="Featured events">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-black text-slate-900">
          ⭐ Featured events
        </h2>
        <Link
          href="/pricing"
          className="text-sm font-semibold text-rose-600 hover:underline"
        >
          Feature your event →
        </Link>
      </div>

      <div className="-mx-1 mt-3 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
        {events.map((event) => (
          <div
            key={event.id}
            className="w-[280px] shrink-0 snap-start sm:w-[320px]"
          >
            <EventCard event={event} />
          </div>
        ))}

        <Link
          href="/pricing"
          className="flex w-[280px] shrink-0 snap-start flex-col justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-fuchsia-600 to-indigo-600 p-5 text-white sm:w-[320px]"
        >
          <span className="text-2xl" aria-hidden>
            ⭐
          </span>
          <span className="mt-2 text-base font-black leading-tight">
            Feature your event here
          </span>
          <span className="mt-1 text-sm text-white/90">{UPGRADE_COPY}</span>
          <span className="mt-3 text-sm font-bold underline">See plans →</span>
        </Link>
      </div>
    </section>
  );
}

/** Compact rail for pages with an empty right-hand column. */
export async function FeaturedEventRail({ take = 4 }: { take?: number }) {
  const events = await paidEvents(take);

  return (
    <aside
      className="hidden w-[300px] shrink-0 space-y-3 lg:block"
      aria-label="Featured events"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Featured events
      </p>

      {events.map((event) => (
        <Link
          key={event.id}
          href={`/events/${event.slug}`}
          className="block rounded-2xl border border-slate-200 bg-white p-3 transition hover:shadow-md"
        >
          <p className="text-sm font-bold text-slate-900">{event.title}</p>
          <p className="mt-1 text-xs text-slate-500">
            {formatEventDate(event.startsAt)} · {event.city}
          </p>
        </Link>
      ))}

      <Link
        href="/pricing"
        className="block rounded-2xl bg-gradient-to-br from-rose-500 via-fuchsia-600 to-indigo-600 p-4 text-white"
      >
        <p className="text-sm font-black">⭐ Feature your event here</p>
        <p className="mt-1 text-xs text-white/90">{UPGRADE_COPY}</p>
        <p className="mt-2 text-xs font-bold underline">See plans →</p>
      </Link>
    </aside>
  );
}
