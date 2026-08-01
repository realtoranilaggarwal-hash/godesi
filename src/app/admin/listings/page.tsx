import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  setListingStatusAction,
  toggleFeaturedAction,
  toggleVerifiedProviderAction,
} from "@/app/actions/admin";
import {
  SeedListingForm,
  SeedListingImportForm,
} from "@/components/forms/SeedListingForm";
import { getCategoryTree } from "@/lib/directory";
import { Badge, Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Listings" };

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/listings");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [businesses, businessCount, categories] = await Promise.all([
    db.business.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 60,
      include: { owner: { select: { email: true, plan: true } } },
    }),
    db.business.count(),
    getCategoryTree(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Listings</h1>
      <Card id="listings">
        <h2 className="text-lg font-bold">Listings</h2>
        <p className="mb-3 text-xs text-slate-500">
          Featured cards appear in the ⭐ Premium strip on the homepage and in
          their category, whatever plan the owner is on. Showing anything
          pending plus the newest listings ({businesses.length} of{" "}
          {businessCount}) — use{" "}
          <Link href="/search" className="font-semibold text-indigo-600">
            search
          </Link>{" "}
          to open any other listing.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Business</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Featured</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {businesses.map((business) => (
                <tr key={business.id}>
                  <td className="py-2">
                    <Link
                      href={`/b/${business.slug}`}
                      className="font-medium text-indigo-600"
                    >
                      {business.name}
                    </Link>
                    <div className="text-xs text-slate-500">
                      {business.category} · {business.city}
                    </div>
                  </td>
                  <td className="text-xs text-slate-600">
                    {business.owner?.email ?? "unclaimed"}
                  </td>
                  <td>
                    <Badge
                      tone={
                        business.status === "APPROVED"
                          ? "green"
                          : business.status === "PENDING"
                            ? "amber"
                            : "red"
                      }
                    >
                      {business.status}
                    </Badge>
                  </td>
                  <td>
                    <form action={toggleFeaturedAction}>
                      <input type="hidden" name="id" value={business.id} />
                      <button
                        type="submit"
                        className="text-xs font-semibold text-indigo-600"
                      >
                        {business.featured ? "Yes — unset" : "No — set"}
                      </button>
                    </form>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <form action={toggleVerifiedProviderAction}>
                        <input type="hidden" name="id" value={business.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-emerald-300 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                        >
                          {business.verifiedProvider ? "unverify" : "✅ verify"}
                        </button>
                      </form>
                      {(["APPROVED", "REJECTED", "PENDING"] as const)
                        .filter((status) => status !== business.status)
                        .map((status) => (
                          <form key={status} action={setListingStatusAction}>
                            <input
                              type="hidden"
                              name="id"
                              value={business.id}
                            />
                            <input type="hidden" name="status" value={status} />
                            <button
                              type="submit"
                              className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                            >
                              {status.toLowerCase()}
                            </button>
                          </form>
                        ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card id="seed-a-starter-listing">
        <h2 className="mb-1 text-lg font-bold">Seed a starter listing</h2>
        <p className="mb-3 text-sm text-slate-500">
          Basic, public details only — the business fills in the rest when it
          claims the listing.
        </p>
        <SeedListingForm categories={categories} />
        <div className="mt-5 border-t border-slate-100 pt-4">
          <h3 className="mb-2 font-semibold">Bulk import (CSV)</h3>
          <SeedListingImportForm />
        </div>
      </Card>
    </div>
  );
}
