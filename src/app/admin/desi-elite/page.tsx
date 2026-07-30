import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { Card, inputClass } from "@/components/ui";
import {
  deleteEliteAction,
  updateEliteAction,
} from "@/app/actions/elite";
import { ELITE_BADGES, ELITE_STATUS_LABELS } from "@/lib/elite";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "GoDesi Elite desk",
  robots: { index: false },
};

const STATUSES = Object.keys(ELITE_STATUS_LABELS) as (keyof typeof ELITE_STATUS_LABELS)[];
const BADGES = Object.keys(ELITE_BADGES) as (keyof typeof ELITE_BADGES)[];

export default async function EliteAdminPage({
  searchParams,
}: {
  searchParams: { status?: string; entry?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent("/admin/desi-elite")}`);
  if (!isStaff(user)) notFound();

  const entries = await db.eliteEntry.findMany({
    where: searchParams.status
      ? { status: searchParams.status as (typeof STATUSES)[number] }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true, name: true } } },
    take: 200,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">🏆 GoDesi Elite desk</h1>
        <Link href="/desi-elite" className="text-sm font-semibold text-indigo-600">
          View directory →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/desi-elite"
          className={`rounded-full px-3 py-1 font-semibold ${
            searchParams.status ? "bg-slate-100 text-slate-700" : "bg-slate-900 text-white"
          }`}
        >
          All ({entries.length})
        </Link>
        {STATUSES.map((status) => (
          <Link
            key={status}
            href={`/admin/desi-elite?status=${status}`}
            className={`rounded-full px-3 py-1 font-semibold ${
              searchParams.status === status
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {status.replace(/_/g, " ").toLowerCase()}
          </Link>
        ))}
      </div>

      {!entries.length ? (
        <Card>
          <p className="text-sm text-slate-600">No applications here yet.</p>
        </Card>
      ) : null}

      {entries.map((entry) => (
        <Card
          key={entry.id}
          className={searchParams.entry === entry.id ? "ring-2 ring-indigo-400" : ""}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-slate-900">
                {entry.fullName}
                {entry.businessName ? ` · ${entry.businessName}` : ""}
              </p>
              <p className="text-xs text-slate-500">
                {entry.category} · {entry.city}
                {entry.country ? `, ${entry.country}` : ""} ·{" "}
                {entry.nominationType === "OTHER"
                  ? "nominated by a member"
                  : "self-applied"}{" "}
                · {entry.createdAt.toISOString().slice(0, 10)}
              </p>
              <p className="text-xs text-slate-500">
                Account: {entry.user?.email ?? "—"} · Interview:{" "}
                {entry.interviewTypes.join(", ") || "not stated"} · Contact:{" "}
                {entry.contactPhone ?? "—"} {entry.contactEmail ?? ""}
              </p>
              {entry.nomineeContact ? (
                <p className="text-xs text-slate-500">
                  Nominee contact: {entry.nomineeContact}
                </p>
              ) : null}
            </div>
            <div className="text-right text-xs">
              <p className="font-bold text-slate-700">
                {ELITE_STATUS_LABELS[entry.status]}
              </p>
              <p className="text-slate-500">{ELITE_BADGES[entry.badge].label}</p>
              {entry.status === "PUBLISHED" ? (
                <Link
                  href={`/desi-elite/${entry.slug}`}
                  className="font-semibold text-indigo-600"
                >
                  View profile →
                </Link>
              ) : null}
            </div>
          </div>

          <details className="mt-2">
            <summary className="cursor-pointer text-sm font-semibold text-slate-700">
              Bio, achievements & proof
            </summary>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
              {entry.shortBio}
            </p>
            {entry.achievements ? (
              <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
                {entry.achievements}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-indigo-600">
              {[entry.websiteUrl, ...entry.socialLinks, ...entry.proofUrls]
                .filter((url): url is string => Boolean(url))
                .map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer">
                    {url.slice(0, 44)}
                  </a>
                ))}
            </div>
          </details>

          <form action={updateEliteAction} className="mt-3 grid gap-2 sm:grid-cols-6">
            <input type="hidden" name="id" value={entry.id} />
            <select name="status" defaultValue={entry.status} className={inputClass}>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ").toLowerCase()}
                </option>
              ))}
            </select>
            <select name="badge" defaultValue={entry.badge} className={inputClass}>
              {BADGES.map((badge) => (
                <option key={badge} value={badge}>
                  {ELITE_BADGES[badge].label}
                </option>
              ))}
            </select>
            <input
              name="assignedTo"
              defaultValue={entry.assignedTo ?? ""}
              placeholder="Assigned to"
              className={inputClass}
            />
            <input
              name="interviewUrl"
              defaultValue={entry.interviewUrl ?? ""}
              placeholder="Interview link"
              className={inputClass}
            />
            <input
              name="videoUrl"
              defaultValue={entry.videoUrl ?? ""}
              placeholder="Video (YouTube/Vimeo)"
              className={inputClass}
            />
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white"
            >
              Save
            </button>
            <input
              name="adminNote"
              defaultValue={entry.adminNote ?? ""}
              placeholder="Internal note"
              className={`${inputClass} sm:col-span-5`}
            />
          </form>

          <form action={deleteEliteAction} className="mt-2">
            <input type="hidden" name="id" value={entry.id} />
            <button
              type="submit"
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              Delete entry
            </button>
          </form>
        </Card>
      ))}
    </div>
  );
}
