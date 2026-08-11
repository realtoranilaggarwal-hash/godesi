import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { reviewClaimAction } from "@/app/actions/claims";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Business claims" };

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/claims");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const claims = await db.businessClaim.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      user: { select: { email: true, name: true } },
      business: { select: { name: true, city: true, slug: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Business claims</h1>
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
    </div>
  );
}
