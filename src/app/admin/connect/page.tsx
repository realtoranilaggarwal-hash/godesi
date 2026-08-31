import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { reviewMeetupProfileAction } from "@/app/actions/meetups";
import { GENDER_LABELS, MARITAL_LABELS, intentLabels } from "@/lib/meetups";
import { Card } from "@/components/ui";
import { deskFallback } from "@/lib/adminSections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Connect" };

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/connect");
  if (user.role !== "ADMIN")
    redirect(deskFallback(user, "Connect"));

  const [pendingMeetups, reportedMeetups] = await Promise.all([
    db.meetupProfile.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: 30,
      include: { user: { select: { email: true, name: true } } },
    }),
    db.meetupReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        reporter: { select: { email: true } },
        profile: { include: { user: { select: { email: true } } } },
      },
    }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Connect</h1>
      <Card id="connect">
        <h2 className="mb-3 text-lg font-bold">
          Connect profiles awaiting review ({pendingMeetups.length})
        </h2>
        {pendingMeetups.length ? (
          <ul className="divide-y divide-slate-100 text-sm">
            {pendingMeetups.map((profile) => (
              <li
                key={profile.id}
                className="flex flex-wrap items-start justify-between gap-2 py-2"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {profile.displayName}, {profile.age} ·{" "}
                    {GENDER_LABELS[profile.gender]} ·{" "}
                    {MARITAL_LABELS[profile.marital]}
                  </p>
                  <p className="text-xs text-slate-400">
                    {profile.city}
                    {profile.state ? `, ${profile.state}` : ""} ·{" "}
                    {profile.user.email} ·{" "}
                    {intentLabels(profile.intents).join(", ")}
                  </p>
                  <p className="mt-1 max-w-xl break-words text-slate-600">
                    {profile.bio}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(["approve", "reject"] as const).map((decision) => (
                    <form key={decision} action={reviewMeetupProfileAction}>
                      <input type="hidden" name="id" value={profile.id} />
                      <input type="hidden" name="decision" value={decision} />
                      <button
                        type="submit"
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                      >
                        {decision}
                      </button>
                    </form>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Nothing waiting.</p>
        )}

        {reportedMeetups.length ? (
          <div className="mt-4 rounded-xl bg-rose-50 p-3">
            <h3 className="text-sm font-bold text-rose-900">
              Reported profiles
            </h3>
            <ul className="mt-2 space-y-2 text-sm">
              {reportedMeetups.map((report) => (
                <li
                  key={report.id}
                  className="flex flex-wrap items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {report.profile.displayName} ({report.profile.user.email})
                    </p>
                    <p className="text-xs text-slate-500">
                      reported by {report.reporter.email}: {report.reason}
                    </p>
                  </div>
                  <form action={reviewMeetupProfileAction}>
                    <input type="hidden" name="id" value={report.profileId} />
                    <input type="hidden" name="decision" value="reject" />
                    <button
                      type="submit"
                      className="rounded-lg border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-white"
                    >
                      remove profile
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
