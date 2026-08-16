import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { formatEventDate } from "@/lib/events";
import {
  deleteEventSourceAction,
  findFeedAction,
  removeImportedEventAction,
  runEventSourceAction,
  saveEventSourceAction,
  toggleEventSourceAction,
} from "@/app/actions/eventWire";
import { Card, inputClass } from "@/components/ui";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-slate-700">{label}</span>
      {hint ? <span className="ml-1 text-slate-400">— {hint}</span> : null}
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Event wire" };

export default async function Page({
  searchParams,
}: {
  searchParams: { error?: string; found?: string; feed?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/events/wire");
  if (!isStaff(user) || !can(user, "events")) redirect("/dashboard");

  const [sources, imported] = await Promise.all([
    db.eventSource.findMany({
      orderBy: [{ active: "desc" }, { name: "asc" }],
      include: { _count: { select: { events: true } } },
    }),
    db.event.findMany({
      where: { sourceId: { not: null }, startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 60,
      select: {
        id: true,
        slug: true,
        title: true,
        startsAt: true,
        venue: true,
        city: true,
        status: true,
        source: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Event wire</h1>
        <Link href="/admin/events" className="text-sm font-semibold text-indigo-700">
          Events desk →
        </Link>
      </div>

      {searchParams.error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">
          {searchParams.error.slice(0, 200)}
        </p>
      ) : null}

      <Card>
        <h2 className="mb-1 text-lg font-bold">Find a calendar</h2>
        <p className="mb-3 text-sm text-slate-500">
          Paste a temple or association&apos;s website and we look for the
          calendar feed it publishes — a Google Calendar embed, a linked .ics
          file or a WordPress events export. Anything found is filled into the
          form below.
        </p>
        <form action={findFeedAction} className="flex flex-wrap gap-2">
          <input
            name="website"
            required
            type="url"
            placeholder="https://theirtemple.org"
            aria-label="Organisation website"
            className={`${inputClass} min-w-0 flex-1`}
          />
          <button className="rounded-xl border border-indigo-300 px-4 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50">
            Find calendar
          </button>
        </form>
        {searchParams.found ? (
          <p className="mt-3 break-all rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            Found: {searchParams.found.slice(0, 500)}
          </p>
        ) : null}
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-bold">Add a calendar</h2>
        <p className="mb-3 text-sm text-slate-500">
          Paste the public iCal (.ics) address a temple, gurudwara or
          association publishes — in Google Calendar it is Settings → “Secret
          address in iCal format” only if they choose to share it publicly, or
          the “Public address in iCal format”. Imported events go live straight
          away, credited to the calendar, and you remove anything that is junk
          below. Runs every night at 03:30 UTC.
        </p>
        <form action={saveEventSourceAction} className="grid gap-3 sm:grid-cols-2">
          <Field label="Organisation name" hint="Shown as the credit on every event">
            <input
              name="name"
              required
              placeholder="Umiya Dham Edison"
              className={inputClass}
            />
          </Field>
          <Field label="Calendar feed address" hint="Ends in .ics or ?ical=1">
            <input
              name="url"
              required
              type="url"
              defaultValue={searchParams.feed ?? ""}
              placeholder="https://…/basic.ics"
              className={inputClass}
            />
          </Field>
          <Field label="City" hint="Where the events happen, town only">
            <input name="city" required placeholder="Edison" className={inputClass} />
          </Field>
          <Field label="State" hint="Two letters">
            <input name="state" placeholder="NJ" className={inputClass} />
          </Field>
          <Field label="Country">
            <input name="country" defaultValue="USA" className={inputClass} />
          </Field>
          <Field label="Their website" hint="Optional, linked from each event">
            <input
              name="websiteUrl"
              type="url"
              placeholder="https://theirtemple.org"
              className={inputClass}
            />
          </Field>
          <Field label="Categories" hint="Optional, comma separated slugs">
            <input name="categorySlugs" placeholder="religious" className={inputClass} />
          </Field>
          <Field label="Tags" hint="Optional, comma separated">
            <input name="tags" placeholder="temple, aarti" className={inputClass} />
          </Field>
          <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white sm:col-span-2">
            Add calendar
          </button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-bold">Calendars ({sources.length})</h2>
        {sources.length ? (
          <ul className="divide-y divide-slate-100 text-sm">
            {sources.map((source) => (
              <li key={source.id} className="space-y-1 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{source.name}</p>
                  <span className="text-xs text-slate-400">
                    {source.city}
                    {source.state ? `, ${source.state}` : ""} ·{" "}
                    {source._count.events} imported ·{" "}
                    {source.active ? "on" : "paused"}
                  </span>
                </div>
                <p className="break-all text-xs text-slate-500">{source.url}</p>
                <p className="text-xs text-slate-500">
                  {source.lastRunAt
                    ? `Last run ${source.lastRunAt.toISOString().slice(0, 16).replace("T", " ")} — ${source.lastStatus ?? ""}`
                    : "Not run yet."}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <form action={runEventSourceAction}>
                    <input type="hidden" name="id" value={source.id} />
                    <button className="rounded-lg border border-indigo-300 px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50">
                      import now
                    </button>
                  </form>
                  <form action={toggleEventSourceAction}>
                    <input type="hidden" name="id" value={source.id} />
                    <button className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50">
                      {source.active ? "pause" : "resume"}
                    </button>
                  </form>
                  <form action={deleteEventSourceAction}>
                    <input type="hidden" name="id" value={source.id} />
                    <button className="rounded-lg border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                      delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">
            No calendars yet. Add one above.
          </p>
        )}
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-bold">
          Imported events ({imported.length} upcoming)
        </h2>
        <p className="mb-3 text-sm text-slate-500">
          These are live on the site. Removing one hides it for good — the next
          run will not bring it back.
        </p>
        {imported.length ? (
          <ul className="divide-y divide-slate-100 text-sm">
            {imported.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2"
              >
                <div className="min-w-0">
                  <Link
                    href={`/events/${event.slug}`}
                    className="font-semibold text-indigo-700 hover:underline"
                  >
                    {event.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {formatEventDate(event.startsAt)} · {event.venue},{" "}
                    {event.city} · from {event.source?.name}
                    {event.status === "REJECTED" ? " · removed" : ""}
                  </p>
                </div>
                {event.status === "REJECTED" ? null : (
                  <form action={removeImportedEventAction}>
                    <input type="hidden" name="id" value={event.id} />
                    <button className="rounded-lg border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                      remove
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">
            Nothing imported yet. Add a calendar and press “import now”.
          </p>
        )}
      </Card>
    </div>
  );
}
