import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { reviewClaimAction } from "@/app/actions/claims";
import { reviewEventClaimAction } from "@/app/actions/eventClaims";
import { Card } from "@/components/ui";
import { deskFallback } from "@/lib/adminSections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Claims" };

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/claims");
  if (user.role !== "ADMIN")
    redirect(deskFallback(user, "Claims"));

  const [claims, eventClaims] = await Promise.all([
    db.businessClaim.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        user: { select: { email: true, name: true } },
        business: { select: { name: true, city: true, slug: true } },
      },
    }),
    db.eventClaim.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        user: { select: { email: true, name: true } },
        event: {
          select: {
            title: true,
            slug: true,
            city: true,
            startsAt: true,
            source: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Claims</h1>
      <Card id="business-claims">
        <h2 className="mb-3 text-lg font-bold">Business claims</h2>
        {claims.length ? (
          <ul className="divide-y divide-slate-100 text-sm">
            {claims.map((claim) => (
              <li
                key={claim.id}
                className="flex flex-wrap items-start justify-between gap-2 py-2"
              >
                <div className="min-w-0">
                  <Link
                    href={`/b/${claim.business.slug}`}
                    className="font-medium text-indigo-600"
                  >
                    {claim.business.name}
                  </Link>
                  <p className="text-xs text-slate-400">
                    {claim.business.city} · claimed by {claim.user.name} (
                    {claim.user.email}){claim.phone ? ` · ${claim.phone}` : ""}
                  </p>
                  <p className="mt-1 max-w-xl text-slate-600">
                    {claim.message}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(["approve", "reject"] as const).map((decision) => (
                    <form key={decision} action={reviewClaimAction}>
                      <input type="hidden" name="id" value={claim.id} />
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
          <p className="text-sm text-slate-500">No claims waiting.</p>
        )}
      </Card>

      <Card id="event-claims">
        <h2 className="mb-1 text-lg font-bold">Event claims</h2>
        <p className="mb-3 text-xs text-slate-500">
          Approving hands the imported event to the organiser so they can edit
          it and sell tickets here. The site we first listed it from stays
          credited on the page.
        </p>
        {eventClaims.length ? (
          <ul className="divide-y divide-slate-100 text-sm">
            {eventClaims.map((claim) => (
              <li
                key={claim.id}
                className="flex flex-wrap items-start justify-between gap-2 py-2"
              >
                <div className="min-w-0">
                  <Link
                    href={`/events/${claim.event.slug}`}
                    className="font-medium text-indigo-600"
                  >
                    {claim.event.title}
                  </Link>
                  <p className="text-xs text-slate-400">
                    {claim.event.city} ·{" "}
                    {claim.event.startsAt.toDateString()} · listed from{" "}
                    {claim.event.source?.name ?? "a public calendar"} · claimed
                    by {claim.user.name} ({claim.user.email})
                    {claim.email ? ` · ${claim.email}` : ""}
                    {claim.phone ? ` · ${claim.phone}` : ""}
                  </p>
                  <p className="mt-1 max-w-xl text-slate-600">
                    {claim.message}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(["approve", "reject"] as const).map((decision) => (
                    <form key={decision} action={reviewEventClaimAction}>
                      <input type="hidden" name="id" value={claim.id} />
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
          <p className="text-sm text-slate-500">No event claims waiting.</p>
        )}
      </Card>
    </div>
  );
}
