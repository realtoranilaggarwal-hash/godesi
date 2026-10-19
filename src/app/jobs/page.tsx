import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { payLabel, workTypeLabel } from "@/lib/jobs";
import { Badge, Card, EmptyState, LinkButton, inputClass } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Jobs & mini jobs — work for desi businesses and families",
  description:
    "Part-time, full-time and mini jobs posted by GoDesi members: sales callers, tutors, helpers, drivers and more. Sign in free to see the jobs and apply.",
  alternates: { canonical: "/jobs" },
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim().slice(0, 80);
  const user = await getCurrentUser();
  const openWhere = { status: "OPEN" as const };
  const [count, jobs] = await Promise.all([
    db.job.count({ where: openWhere }),
    user
      ? db.job.findMany({
          where: {
            ...openWhere,
            ...(q
              ? {
                  OR: [
                    { title: { contains: q, mode: "insensitive" } },
                    { description: { contains: q, mode: "insensitive" } },
                    { city: { contains: q, mode: "insensitive" } },
                  ],
                }
              : {}),
          },
          orderBy: { createdAt: "desc" },
          take: 100,
          include: { poster: { select: { name: true } } },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-sky-600 via-indigo-600 to-violet-600 p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-white/70">Jobs</p>
        <h1 className="mt-1 text-3xl font-black sm:text-4xl">Jobs &amp; mini jobs</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/90">
          Members post work, from a one-day helper to a part-time sales caller,
          and members apply. Pay can be hourly, monthly, per sale or commission,
          by cash, Zelle or check. Jobs are for signed-in members only. Want to
          sell a fixed-price service instead? That&apos;s a{" "}
          <Link href="/gigs" className="font-semibold underline">
            gig
          </Link>
          .
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton
            href={user ? "/jobs/new" : "/login?next=/jobs/new"}
            variant="secondary"
          >
            💼 Post a job
          </LinkButton>
          {user ? (
            <Link
              href="/dashboard/jobs"
              className="inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white underline"
            >
              My jobs &amp; applications
            </Link>
          ) : null}
        </div>
      </section>

      {!user ? (
        <Card className="text-center">
          <p className="text-lg font-bold">
            {count ? `${count} open job${count === 1 ? "" : "s"}` : "Jobs"} for GoDesi members
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Sign in or join free to see the jobs and apply.
          </p>
          <div className="mt-3 flex justify-center gap-2">
            <LinkButton href="/login?next=/jobs">Sign in</LinkButton>
            <LinkButton href="/signup?next=/jobs" variant="secondary">
              Join free
            </LinkButton>
          </div>
        </Card>
      ) : (
        <>
          <form className="flex gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search jobs, e.g. sales, tutor, Edison"
              className={inputClass}
            />
            <button className="rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white">
              Search
            </button>
          </form>
          {jobs.length ? (
            <div className="space-y-3">
              {jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.slug}`} className="block">
                  <Card className="transition hover:border-indigo-300">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2 className="text-lg font-bold text-slate-900">{job.title}</h2>
                      <span className="font-bold text-emerald-700">{payLabel(job)}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                      <Badge tone="indigo">{workTypeLabel(job.workType)}</Badge>
                      <Badge>{job.remote ? "🏠 Work from home" : `📍 ${job.city}`}</Badge>
                      <span className="text-slate-500">by {job.poster.name}</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{job.description}</p>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title={q ? "No jobs match that search." : "No open jobs yet."}
              body="Hiring? Post the first one."
              action={<LinkButton href="/jobs/new">Post a job</LinkButton>}
            />
          )}
        </>
      )}
    </div>
  );
}
