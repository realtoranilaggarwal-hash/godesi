import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { applicationStatus, payLabel } from "@/lib/jobs";
import { Badge, Card, EmptyState, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My jobs" };

export default async function DashboardJobsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/jobs");

  const [posted, applied] = await Promise.all([
    db.job.findMany({
      where: { posterId: user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true } } },
    }),
    db.jobApplication.findMany({
      where: { applicantId: user.id },
      orderBy: { createdAt: "desc" },
      include: { job: { select: { title: true, slug: true, status: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">💼 My jobs</h1>
        <LinkButton href="/jobs/new">Post a job</LinkButton>
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-bold">Jobs you posted</h2>
        {posted.length ? (
          <ul className="divide-y divide-slate-100">
            {posted.map((job) => (
              <li key={job.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <div>
                  <Link href={`/jobs/${job.slug}`} className="font-semibold text-indigo-700 hover:underline">
                    {job.title}
                  </Link>
                  <p className="text-xs text-slate-500">{payLabel(job)}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {job.status === "CLOSED" ? <Badge tone="red">Closed</Badge> : <Badge tone="green">Open</Badge>}
                  <Link href={`/jobs/${job.slug}#applicants`} className="font-semibold hover:underline">
                    {job._count.applications} applicant{job._count.applications === 1 ? "" : "s"}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="You haven't posted a job yet." />
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-bold">Jobs you applied for</h2>
        {applied.length ? (
          <ul className="divide-y divide-slate-100">
            {applied.map((application) => {
              const status = applicationStatus(application.status);
              return (
                <li key={application.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <Link href={`/jobs/${application.job.slug}`} className="font-semibold text-indigo-700 hover:underline">
                    {application.job.title}
                  </Link>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            title="No applications yet."
            action={<LinkButton href="/jobs" variant="secondary">Browse jobs</LinkButton>}
          />
        )}
      </Card>
    </div>
  );
}
