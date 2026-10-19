import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { JOB_CATEGORIES, jobCategory, payLabel, workTypeLabel } from "@/lib/jobs";
import { CareerjetSearchBox } from "@/components/CareerjetSearchBox";
import { Badge, Card, EmptyState, LinkButton, inputClass } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Desi mini jobs — nanny, babysitting, spa at home & more",
  description:
    "Part-time, full-time and mini jobs posted by GoDesi members: sales callers, tutors, helpers, drivers and more. Sign in free to see the jobs and apply.",
  alternates: { canonical: "/jobs" },
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string };
}) {
  const q = (searchParams.q ?? "").trim().slice(0, 80);
  const type = JOB_CATEGORIES.find((category) => category.value === searchParams.type)?.value;
  const user = await getCurrentUser();
  const openWhere = { status: "OPEN" as const };
  const [count, jobs] = await Promise.all([
    db.job.count({ where: openWhere }),
    user
      ? db.job.findMany({
          where: {
            ...openWhere,
            ...(type ? { category: type } : {}),
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
          Mini jobs from GoDesi members: nanny, babysitting, spa and beauty at
          home, cleaning, cooking, tutoring, event help and more. Members post
          the work, and members apply. Pay can be hourly, monthly, per sale or commission,
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
          <div className="flex flex-wrap gap-2">
            <Link
              href="/jobs"
              className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                type ? "border-slate-300 bg-white" : "border-indigo-600 bg-indigo-600 text-white"
              }`}
            >
              All
            </Link>
            {JOB_CATEGORIES.map((category) => (
              <Link
                key={category.value}
                href={`/jobs?type=${category.value}`}
                className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                  type === category.value
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {category.icon} {category.label}
              </Link>
            ))}
          </div>
          <form className="flex gap-2">
            {type ? <input type="hidden" name="type" value={type} /> : null}
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
                      <Badge tone="amber">
                        {jobCategory(job.category).icon} {jobCategory(job.category).label}
                      </Badge>
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
          <Card>
            <h2 className="text-lg font-bold text-slate-900">Search more jobs</h2>
            <p className="mt-1 text-sm text-slate-600">
              Jobs from across the web, by Careerjet. These open on other websites.
            </p>
            <div className="mt-3">
              <CareerjetSearchBox />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
