import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { Card, inputClass } from "@/components/ui";
import { updateMediaApplicationAction } from "@/app/actions/media";
import { MEDIA_APPLICATION_STATUSES, MEDIA_ROLES } from "@/lib/media";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "GoDesi Media team desk",
  robots: { index: false },
};

const ROLE_LABEL = Object.fromEntries(
  MEDIA_ROLES.map((role) => [role.id, role.label]),
);

export default async function MediaAdminPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent("/admin/media")}`);
  if (!isStaff(user)) notFound();

  const applications = await db.mediaApplication.findMany({
    where: searchParams.status ? { status: searchParams.status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">🎙️ GoDesi Media team</h1>
        <div className="flex gap-3 text-sm font-semibold text-indigo-600">
          <Link href="/media">Public page →</Link>
          <Link href="/admin/desi-elite">Elite desk (interviews) →</Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/media"
          className={`rounded-full px-3 py-1 font-semibold ${
            searchParams.status
              ? "bg-slate-100 text-slate-700"
              : "bg-slate-900 text-white"
          }`}
        >
          All
        </Link>
        {MEDIA_APPLICATION_STATUSES.map((status) => (
          <Link
            key={status}
            href={`/admin/media?status=${status}`}
            className={`rounded-full px-3 py-1 font-semibold ${
              searchParams.status === status
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {status.toLowerCase()}
          </Link>
        ))}
      </div>

      {applications.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">
            No applications yet. Share godesi.com/media/join.
          </p>
        </Card>
      ) : null}

      {applications.map((app) => (
        <Card key={app.id} id={app.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-slate-900">
                {app.name} · {app.city}
              </p>
              <p className="text-xs text-slate-500">
                {app.email}
                {app.phone ? ` · ${app.phone}` : ""} ·{" "}
                {app.createdAt.toISOString().slice(0, 10)}
                {app.languages ? ` · ${app.languages}` : ""}
              </p>
              <p className="mt-1 text-xs font-semibold text-indigo-700">
                {app.roles.map((role) => ROLE_LABEL[role] ?? role).join(" · ")}
              </p>
            </div>
            <p className="text-xs font-bold text-slate-700">
              {app.status.toLowerCase()}
            </p>
          </div>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
            {app.experience}
          </p>
          {app.availability ? (
            <p className="mt-1 text-xs text-slate-500">
              Availability: {app.availability}
            </p>
          ) : null}
          {app.links.length ? (
            <p className="mt-1 flex flex-wrap gap-2 text-xs">
              {app.links.map((link) => (
                <a
                  key={link}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  {link.replace(/^https?:\/\//, "").slice(0, 50)}
                </a>
              ))}
            </p>
          ) : null}

          <form
            action={updateMediaApplicationAction}
            className="mt-3 grid gap-2 sm:grid-cols-4"
          >
            <input type="hidden" name="id" value={app.id} />
            <select
              name="status"
              defaultValue={app.status}
              className={inputClass}
            >
              {MEDIA_APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.toLowerCase()}
                </option>
              ))}
            </select>
            <input
              name="adminNote"
              defaultValue={app.adminNote ?? ""}
              placeholder="Internal note"
              className={`${inputClass} sm:col-span-2`}
            />
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white"
            >
              Save
            </button>
          </form>
        </Card>
      ))}
    </div>
  );
}
