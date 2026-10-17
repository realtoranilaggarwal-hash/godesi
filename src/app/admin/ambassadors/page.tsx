import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { Badge, Card, inputClass } from "@/components/ui";
import { reviewAmbassadorAction } from "@/app/actions/joinGoals";
import { AMBASSADOR_HELP, JOIN_GOALS, joinGoal } from "@/lib/joinGoals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Ambassadors & join goals",
  robots: { index: false },
};

const HELP_LABEL = Object.fromEntries(
  AMBASSADOR_HELP.map((item) => [item.id, item.label]),
);
const STATUSES = ["PENDING", "APPROVED", "DECLINED"] as const;
const TONE = { PENDING: "amber", APPROVED: "green", DECLINED: "red" } as const;

export default async function AmbassadorsAdminPage({
  searchParams,
}: {
  searchParams: { status?: string; goal?: string };
}) {
  const user = await getCurrentUser();
  if (!user)
    redirect(`/login?next=${encodeURIComponent("/admin/ambassadors")}`);
  if (!isStaff(user)) notFound();

  const status = STATUSES.find((item) => item === searchParams.status);
  const goal = joinGoal(searchParams.goal ?? "")?.id ?? null;

  const [counts, applications, members] = await Promise.all([
    db.$queryRaw<{ id: string; count: bigint }[]>`
      SELECT unnest("joinGoals") AS id, COUNT(*) AS count
      FROM "User" WHERE "bannedAt" IS NULL GROUP BY 1`,
    db.ambassador.findMany({
      where: status ? { status } : undefined,
      include: {
        user: { select: { name: true, email: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    goal
      ? db.user.findMany({
          where: { bannedAt: null, joinGoals: { has: goal } },
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            location: true,
            joinGoalsAt: true,
          },
          orderBy: { joinGoalsAt: { sort: "desc", nulls: "last" } },
          take: 200,
        })
      : Promise.resolve([]),
  ]);
  const countFor = new Map(counts.map((row) => [row.id, Number(row.count)]));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">🤝 Ambassadors &amp; join goals</h1>
        <Link
          href="/ambassador"
          className="text-sm font-semibold text-indigo-600"
        >
          Public page →
        </Link>
      </div>

      <Card>
        <h2 className="font-bold">What members want to do</h2>
        <p className="text-sm text-slate-600">
          Ticked at signup or on their dashboard. Click one to see who.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {JOIN_GOALS.map((item) => (
            <Link
              key={item.id}
              href={`/admin/ambassadors?goal=${item.id}`}
              className={`rounded-full border px-3 py-1 text-sm ${
                goal === item.id
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-300 bg-white"
              }`}
            >
              {item.icon} {item.label} · {countFor.get(item.id) ?? 0}
            </Link>
          ))}
        </div>
        {goal ? (
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {members.length === 0 ? (
              <li className="py-2 text-slate-500">Nobody yet.</li>
            ) : null}
            {members.map((member) => (
              <li key={member.id} className="flex flex-wrap gap-x-3 py-2">
                <span className="font-semibold">
                  {member.username ? (
                    <Link
                      href={`/${member.username}`}
                      className="hover:underline"
                    >
                      {member.name}
                    </Link>
                  ) : (
                    member.name
                  )}
                </span>
                <span className="text-slate-500">{member.email}</span>
                {member.location ? (
                  <span className="text-slate-500">📍 {member.location}</span>
                ) : null}
                {member.joinGoalsAt ? (
                  <span className="text-xs text-slate-400">
                    {member.joinGoalsAt.toISOString().slice(0, 10)}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </Card>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/ambassadors"
          className={`rounded-full px-3 py-1 font-semibold ${
            status ? "bg-slate-100 text-slate-700" : "bg-slate-900 text-white"
          }`}
        >
          All applications
        </Link>
        {STATUSES.map((item) => (
          <Link
            key={item}
            href={`/admin/ambassadors?status=${item}`}
            className={`rounded-full px-3 py-1 font-semibold ${
              status === item
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {item.toLowerCase()}
          </Link>
        ))}
      </div>

      {applications.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">
            No ambassador applications yet. Share godesi.com/ambassador.
          </p>
        </Card>
      ) : null}

      {applications.map((app) => (
        <Card key={app.id} id={app.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-slate-900">
                {app.user.name} · {app.city}
              </p>
              <p className="text-xs text-slate-500">
                {app.user.email}
                {app.phone ? ` · ${app.phone}` : ""} · applied{" "}
                {app.createdAt.toISOString().slice(0, 10)}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Pledge signed as <em>{app.signedName}</em> on{" "}
                {app.pledgedAt.toISOString().slice(0, 10)}
              </p>
              {app.helps.length ? (
                <p className="mt-1 text-xs font-semibold text-emerald-700">
                  {app.helps.map((id) => HELP_LABEL[id] ?? id).join(" · ")}
                </p>
              ) : null}
            </div>
            <Badge tone={TONE[app.status]}>
              {app.status.toLowerCase()}
              {app.certificateNo !== null ? ` · #${app.certificateNo}` : ""}
            </Badge>
          </div>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
            {app.pitch}
          </p>
          <form
            action={reviewAmbassadorAction}
            className="mt-3 grid gap-2 sm:grid-cols-4"
          >
            <input type="hidden" name="id" value={app.id} />
            <select
              name="decision"
              defaultValue={app.status}
              className={inputClass}
            >
              {STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item === "APPROVED" ? "approve" : item.toLowerCase()}
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
          {app.status === "APPROVED" ? (
            <Link
              href={`/ambassador/certificate/${app.id}`}
              className="mt-2 inline-block text-xs font-semibold text-indigo-600"
            >
              Certificate →
            </Link>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
