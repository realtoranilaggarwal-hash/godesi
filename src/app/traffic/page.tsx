import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, LinkButton } from "@/components/ui";
import { gaActiveNow, gaConfigured, gaReport, type GaRank } from "@/lib/ga";
import { siteTraffic } from "@/lib/traffic";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live traffic — who is on Godesi right now",
  description:
    "Live, independently measured visitor numbers for godesi.com from Google Analytics: people on the site now, the last 30 days, top pages, cities and countries.",
  alternates: { canonical: "/traffic" },
};

const MONTH = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const DAY = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const TIME = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/New_York",
});

export default async function TrafficPage() {
  if (!gaConfigured()) notFound();

  const [active, report, totals] = await Promise.all([
    gaActiveNow(),
    gaReport(),
    siteTraffic(),
  ]);

  const days = report?.days ?? [];
  const peak = Math.max(1, ...days.map((d) => d.views));
  const countedDays = days.filter((d) => d.views > 0).length;
  const avgVisitors =
    countedDays && report
      ? Math.round(report.last30.visitors / countedDays)
      : 0;

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
          Live traffic
        </p>
        <h1 className="text-3xl font-bold text-slate-900">
          Who is on Godesi right now
        </h1>
        <p className="max-w-3xl text-slate-600">
          Measured independently by Google Analytics and shown here as-is, so
          businesses and advertisers can see the audience for themselves.
          Updated every few minutes.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="On the site now"
          value={active ?? 0}
          hint="last 30 minutes"
          live
        />
        <Stat
          label="Visitors, last 30 days"
          value={report?.last30.visitors ?? 0}
          hint={
            avgVisitors ? `about ${avgVisitors.toLocaleString()} a day` : ""
          }
        />
        <Stat
          label="Page views, last 30 days"
          value={report?.last30.views ?? 0}
        />
        <Stat
          label="Page views, all time"
          value={totals.views}
          hint={
            totals.since
              ? `${totals.visitors.toLocaleString()} visitors since ${MONTH.format(totals.since)}`
              : `${totals.visitors.toLocaleString()} visitors`
          }
        />
      </section>

      {days.length ? (
        <Card>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Page views, day by day
            </h2>
            <p className="text-xs text-slate-500">
              {DAY.format(new Date(days[0].date))} –{" "}
              {DAY.format(new Date(days[days.length - 1].date))}
            </p>
          </div>
          <div
            className="mt-4 flex h-40 items-end gap-1"
            role="img"
            aria-label="Bar chart of daily page views for the last 30 days"
          >
            {days.map((d) => (
              <div
                key={d.date}
                className="group relative flex-1 rounded-t bg-indigo-500/80 transition hover:bg-indigo-600"
                style={{ height: `${Math.max(2, (d.views / peak) * 100)}%` }}
                title={`${DAY.format(new Date(d.date))}: ${d.views.toLocaleString()} views, ${d.visitors.toLocaleString()} visitors`}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-slate-400">
            <span>{DAY.format(new Date(days[0].date))}</span>
            <span>
              peak {peak.toLocaleString()} views in a day · Google finalises
              each day within about 24 hours
            </span>
            <span>{DAY.format(new Date(days[days.length - 1].date))}</span>
          </div>
        </Card>
      ) : null}

      {report ? (
        <section className="grid gap-4 md:grid-cols-2">
          <Ranking
            title="Most-read pages"
            rows={report.pages}
            unit="views"
            path
          />
          <Ranking title="Top cities" rows={report.cities} unit="visitors" />
          <Ranking
            title="Top countries"
            rows={report.countries}
            unit="visitors"
          />
          <Ranking
            title="How people arrive"
            rows={report.sources}
            unit="sessions"
          />
        </section>
      ) : (
        <Card>
          <p className="text-slate-600">
            Google Analytics did not answer just now — refresh in a minute.
          </p>
        </Card>
      )}

      <Card className="bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-900">
          Want this audience to see you?
        </h2>
        <p className="mt-1 text-slate-600">
          A free Godesi page puts your business, event or profile in front of
          these visitors. Featured spots on the home page rotate through the
          categories they browse most.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href="/add-business">Add your business free</LinkButton>
          <LinkButton href="/pricing" variant="secondary">
            Featured placement
          </LinkButton>
        </div>
      </Card>

      <p className="text-xs text-slate-500">
        Source: Google Analytics 4 for godesi.com, read live via the Analytics
        Data API. All-time totals add the {totals.since ? "earlier " : ""}
        Umami count kept from before Google Analytics was added. Page generated{" "}
        {TIME.format(new Date())} ET.{" "}
        <Link href="/why-godesi" className="underline hover:text-slate-700">
          Why Godesi
        </Link>
      </p>
    </main>
  );
}

function Stat({
  label,
  value,
  hint,
  live,
}: {
  label: string;
  value: number;
  hint?: string;
  live?: boolean;
}) {
  return (
    <Card>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {live ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
        ) : null}
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
        {value.toLocaleString()}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </Card>
  );
}

function Ranking({
  title,
  rows,
  unit,
  path,
}: {
  title: string;
  rows: GaRank[];
  unit: string;
  path?: boolean;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {rows.length ? (
        <ol className="mt-3 space-y-2">
          {rows.map((r) => (
            <li key={r.label} className="text-sm">
              <div className="flex items-baseline justify-between gap-3">
                {path ? (
                  <Link
                    href={r.label}
                    className="truncate font-medium text-slate-700 hover:text-indigo-600 hover:underline"
                  >
                    {r.label}
                  </Link>
                ) : (
                  <span className="truncate font-medium text-slate-700">
                    {r.label}
                  </span>
                )}
                <span className="shrink-0 tabular-nums text-slate-500">
                  {r.value.toLocaleString()} {unit}
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded bg-slate-100">
                <div
                  className="h-1.5 rounded bg-indigo-400"
                  style={{ width: `${(r.value / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Nothing to show yet for the last 30 days.
        </p>
      )}
    </Card>
  );
}
