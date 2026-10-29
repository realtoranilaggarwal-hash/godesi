import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import {
  JOB_APPLICATION_STATUSES,
  applicationStatus,
  jobCategory,
  locationLabel,
  payLabel,
  payMethodLabels,
  workTypeLabel,
} from "@/lib/jobs";
import { setApplicationStatusAction, toggleJobAction } from "@/app/actions/jobs";
import { Alert, Badge, Card, LinkButton } from "@/components/ui";
import { JobApplyForm } from "@/components/forms/JobApplyForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Job", robots: { index: false } };

export default async function JobPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { posted?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/jobs/${params.slug}`);
  const job = await db.job.findUnique({
    where: { slug: params.slug },
    include: {
      poster: { select: { name: true, username: true } },
      applications: {
        orderBy: { createdAt: "desc" },
        include: { applicant: { select: { name: true, email: true, username: true } } },
      },
    },
  });
  if (!job) notFound();
  const manages = job.posterId === user.id || isStaff(user);
  const mine = job.applications.find((application) => application.applicantId === user.id);
  const methods = payMethodLabels(job.payMethods);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {searchParams.posted ? (
        <Alert tone="success">
          Your job is posted. Signed-in members can see it on godesi.com/jobs, and
          each application comes to your email.
        </Alert>
      ) : null}

      <Card>
        <Link href="/jobs" className="text-sm font-semibold text-indigo-700 hover:underline">
          ← All jobs
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
          <h1 className="text-2xl font-black text-slate-900">{job.title}</h1>
          {job.status === "CLOSED" ? <Badge tone="red">Closed</Badge> : null}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          <Badge tone="amber">
            {jobCategory(job.category).icon} {jobCategory(job.category).label}
          </Badge>
          <Badge tone="indigo">{workTypeLabel(job.workType)}</Badge>
          <Badge>{locationLabel(job)}</Badge>
          {job.openings > 1 ? <Badge>👥 {job.openings} openings</Badge> : null}
          {job.hoursPerWeek ? <Badge>🕒 {job.hoursPerWeek} hrs/week</Badge> : null}
          <span className="text-slate-500">
            Posted by{" "}
            {job.poster.username ? (
              <Link href={`/${job.poster.username}`} className="hover:underline">
                {job.poster.name}
              </Link>
            ) : (
              job.poster.name
            )}
          </span>
        </div>
        <div className="mt-4 rounded-xl bg-emerald-50 p-3">
          <p className="text-lg font-black text-emerald-800">💵 {payLabel(job)}</p>
          {methods.length ? (
            <p className="text-sm text-emerald-900">Paid by {methods.join(", ")}</p>
          ) : null}
        </div>
        <p className="mt-4 whitespace-pre-line text-slate-700">{job.description}</p>
        {job.requirements ? (
          <div className="mt-4">
            <h2 className="font-bold">What you need</h2>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">
              {job.requirements
                .split("\n")
                .map((line) => line.replace(/^[-•*]\s*/, "").trim())
                .filter(Boolean)
                .map((line) => (
                  <li key={line}>{line}</li>
                ))}
            </ul>
          </div>
        ) : null}
        {manages ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href={`/jobs/${job.slug}/edit`} variant="secondary">
              ✏️ Edit job
            </LinkButton>
            <form action={toggleJobAction}>
              <input type="hidden" name="jobId" value={job.id} />
              <button className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold">
                {job.status === "OPEN" ? "Close job" : "Reopen job"}
              </button>
            </form>
          </div>
        ) : null}
      </Card>

      {manages ? (
        <Card>
          <h2 id="applicants" className="scroll-mt-28 text-lg font-bold">
            Applicants ({job.applications.length})
          </h2>
          {job.applications.length ? (
            <ul className="mt-3 divide-y divide-slate-100">
              {job.applications.map((application) => {
                const status = applicationStatus(application.status);
                return (
                  <li key={application.id} className="space-y-2 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">
                        {application.applicant.name}{" "}
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </p>
                      <p className="text-xs text-slate-500">
                        {application.createdAt.toLocaleDateString("en-US")}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600">
                      <a href={`mailto:${application.applicant.email}`} className="text-indigo-700 hover:underline">
                        {application.applicant.email}
                      </a>
                      {application.phone ? (
                        <>
                          {" · "}
                          <a href={`tel:${application.phone}`} className="text-indigo-700 hover:underline">
                            {application.phone}
                          </a>
                        </>
                      ) : null}
                    </p>
                    <p className="whitespace-pre-line text-sm text-slate-700">{application.message}</p>
                    <form action={setApplicationStatusAction} className="flex flex-wrap gap-1">
                      <input type="hidden" name="applicationId" value={application.id} />
                      {JOB_APPLICATION_STATUSES.filter((option) => option.value !== application.status).map(
                        (option) => (
                          <button
                            key={option.value}
                            name="status"
                            value={option.value}
                            className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold hover:bg-slate-50"
                          >
                            {option.label}
                          </button>
                        ),
                      )}
                    </form>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              No applications yet. Share this page in your WhatsApp groups to get more.
            </p>
          )}
        </Card>
      ) : (
        <Card>
          <h2 className="mb-3 text-lg font-bold">Apply</h2>
          {mine ? (
            <p className="text-sm text-slate-700">
              You applied on {mine.createdAt.toLocaleDateString("en-US")}. Status:{" "}
              <Badge tone={applicationStatus(mine.status).tone}>
                {applicationStatus(mine.status).label}
              </Badge>
            </p>
          ) : job.status === "OPEN" ? (
            <JobApplyForm jobId={job.id} />
          ) : (
            <p className="text-sm text-slate-600">This job is no longer taking applications.</p>
          )}
        </Card>
      )}
    </div>
  );
}
