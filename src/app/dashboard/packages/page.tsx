import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatMoney } from "@/lib/format";
import { Card, EmptyState, LinkButton } from "@/components/ui";
import { PackageForm } from "@/components/forms/PackageForm";
import { deletePackageAction } from "@/app/actions/packages";
import { requestCurrency } from "@/lib/currency";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Packages & pricing" };

export default async function PackagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/packages");

  const business = await db.business.findUnique({
    where: { ownerId: user.id },
    include: { packages: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Packages & pricing</h1>
        <p className="text-sm text-slate-600">
          Show clear packages on your profile — wedding and event vendors get far more
          enquiries when prices are visible.
        </p>
      </div>

      {business ? (
        <>
          <Card>
            <PackageForm defaultCurrency={requestCurrency()} />
          </Card>

          {business.packages.length ? (
            <Card className="space-y-2">
              {business.packages.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    {item.description ? (
                      <p className="text-xs text-slate-500">{item.description}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-emerald-700">
                      {formatMoney(item.price, item.currency)}
                    </span>
                    <form action={deletePackageAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="text-xs font-semibold text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </Card>
          ) : (
            <EmptyState
              title="No packages yet"
              body="Add two or three tiers — for example Silver, Gold and Platinum shoots."
            />
          )}
        </>
      ) : (
        <Card className="space-y-3">
          <p className="text-sm text-slate-600">
            Create your business profile first, then you can publish packages.
          </p>
          <LinkButton href="/dashboard/profile">Create business profile</LinkButton>
        </Card>
      )}
    </div>
  );
}
