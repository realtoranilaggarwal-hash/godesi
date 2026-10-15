import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  dismissRishtaReportsAction,
  reviewRishtaProfileAction,
} from "@/app/actions/rishta";
import { RishtaPhoto } from "@/components/RishtaCard";
import { POSTED_BY_LABELS, ageFromBirthYear } from "@/lib/rishta";
import { deskFallback } from "@/lib/adminSections";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Rishta" };

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/rishta");
  if (user.role !== "ADMIN") redirect(deskFallback(user, "Rishta"));

  const reported = await db.rishtaProfile.findMany({
    where: { reports: { some: {} } },
    orderBy: { updatedAt: "desc" },
    take: 40,
    include: { reports: { orderBy: { createdAt: "desc" } } },
  });
  const pending = await db.rishtaProfile.findMany({
    where: { status: "PENDING" },
    orderBy: { updatedAt: "asc" },
    take: 40,
    include: { user: { select: { email: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Rishta review ({pending.length})</h1>
      {pending.length === 0 ? (
        <p className="text-sm text-slate-500">No profiles waiting.</p>
      ) : null}
      {reported.length > 0 ? (
        <>
          <h2 className="text-lg font-bold">Reported ({reported.length})</h2>
          {reported.map((profile) => (
            <Card key={profile.id}>
              <p className="font-semibold">
                <Link
                  href={`/rishta/${profile.id}`}
                  className="hover:underline"
                >
                  {profile.displayName}
                </Link>{" "}
                · {profile.status.toLowerCase()}
                {profile.visible ? "" : " · hidden by owner"}
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm">
                {profile.reports.map((report) => (
                  <li key={report.id}>{report.reason}</li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <form action={reviewRishtaProfileAction}>
                  <input type="hidden" name="id" value={profile.id} />
                  <input type="hidden" name="decision" value="reject" />
                  <button className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white">
                    Take down
                  </button>
                </form>
                <form action={dismissRishtaReportsAction}>
                  <input type="hidden" name="id" value={profile.id} />
                  <button className="rounded-lg bg-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700">
                    Dismiss reports
                  </button>
                </form>
              </div>
            </Card>
          ))}
          <h2 className="text-lg font-bold">Waiting for review</h2>
        </>
      ) : null}
      {pending.map((profile) => (
        <Card key={profile.id}>
          {profile.photoUrl ? (
            <div className="mb-3 w-40">
              <RishtaPhoto profile={profile} canSee className="h-40" />
            </div>
          ) : null}
          <p className="font-semibold">
            <Link href={`/rishta/${profile.id}`} className="hover:underline">
              {profile.displayName}
            </Link>{" "}
            · {profile.gender === "WOMAN" ? "Bride" : "Groom"},{" "}
            {ageFromBirthYear(profile.birthYear)} · {profile.city}
          </p>
          <p className="text-xs text-slate-500">
            Posted by {POSTED_BY_LABELS[profile.postedBy].toLowerCase()} ·{" "}
            {profile.user.email}
            {profile.photoUrl ? " · has photo" : ""}
            {profile.hidePhoto ? " (hidden)" : ""}
          </p>
          <p className="mt-2 whitespace-pre-line text-sm">{profile.about}</p>
          <div className="mt-3 flex gap-2">
            {["approve", "reject"].map((decision) => (
              <form key={decision} action={reviewRishtaProfileAction}>
                <input type="hidden" name="id" value={profile.id} />
                <input type="hidden" name="decision" value={decision} />
                <button
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold text-white ${decision === "approve" ? "bg-green-600" : "bg-rose-600"}`}
                >
                  {decision === "approve" ? "Approve" : "Reject"}
                </button>
              </form>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
