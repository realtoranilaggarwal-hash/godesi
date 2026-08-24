import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { reviewWorshipAction } from "@/app/actions/worship";
import { FAITH_LABELS } from "@/lib/worship";
import { Card } from "@/components/ui";
import { deskFallback } from "@/lib/adminSections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Places of worship" };

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/temples");
  if (user.role !== "ADMIN")
    redirect(deskFallback(user, "Temples"));

  const pendingWorship = await db.worshipPlace.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { submittedBy: { select: { email: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Places of worship</h1>
      <Card id="places-of-worship-awaiting-review">
        <h2 className="mb-3 text-lg font-bold">
          Places of worship awaiting review
        </h2>
        {pendingWorship.length ? (
          <ul className="divide-y divide-slate-100 text-sm">
            {pendingWorship.map((place) => (
              <li
                key={place.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2"
              >
                <div className="min-w-0">
                  <p className="font-medium">{place.name}</p>
                  <p className="text-xs text-slate-400">
                    {FAITH_LABELS[place.faith]} · {place.city}, {place.country}{" "}
                    · {place.submittedBy?.email ?? "unknown"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(["approve", "reject"] as const).map((decision) => (
                    <form key={decision} action={reviewWorshipAction}>
                      <input type="hidden" name="id" value={place.id} />
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
          <p className="text-sm text-slate-500">Nothing waiting for review.</p>
        )}
      </Card>
    </div>
  );
}
