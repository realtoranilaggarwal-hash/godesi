import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { fromMinor } from "@/lib/format";
import {
  SALE_SIDE_LABELS,
  agentMoney,
  isAgentCard,
  splitList,
} from "@/lib/agents";
import { deleteAgentSaleAction } from "@/app/actions/agents";
import { AgentProfileForm } from "@/components/forms/AgentProfileForm";
import { AgentSaleForm } from "@/components/forms/AgentSaleForm";
import { Card } from "@/components/ui";
import { SidebarBanners } from "@/components/Banners";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Real estate agent profile" };

function number(value: number | null) {
  return value === null ? "" : String(value);
}

export default async function AgentDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/agent");

  const business = await db.business.findUnique({
    where: { ownerId: user.id },
    include: {
      agentProfile: { include: { sales: { orderBy: { soldOn: "desc" } } } },
    },
  });

  if (!business) {
    return (
      <Card>
        <p className="text-sm text-slate-600">
          Create your business card first, then come back to add your agent
          credentials.
        </p>
        <Link
          href="/dashboard/profile"
          className="mt-2 inline-block text-sm font-semibold text-indigo-600"
        >
          Create my card →
        </Link>
      </Card>
    );
  }

  const profile = business.agentProfile;

  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-3xl flex-1 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Real estate agent profile</h1>
          <p className="mt-1 text-sm text-slate-600">
            Service areas, licence, specialties, awards and closed sales — all
            shown on{" "}
            <Link
              href={`/b/${business.slug}`}
              className="font-semibold text-indigo-600"
            >
              your public card
            </Link>
            .
          </p>
          {isAgentCard(business.subcategorySlug) ? null : (
            <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              Your card is not listed under Real Estate Agents yet, so this
              section stays hidden on the public page. Change the subcategory in{" "}
              <Link
                href="/dashboard/profile"
                className="font-semibold underline"
              >
                your card settings
              </Link>
              .
            </p>
          )}
        </div>

        <Card>
          <AgentProfileForm
            defaults={{
              brokerage: profile?.brokerage ?? "",
              serviceAreas: profile?.serviceAreas ?? "",
              licenseNumber: profile?.licenseNumber ?? "",
              licenseState: profile?.licenseState ?? "",
              designations: profile?.designations ?? "",
              awards: profile?.awards ?? "",
              specialties: splitList(profile?.specialties ?? null),
              yearsExperience: number(profile?.yearsExperience ?? null),
              transactions: number(profile?.transactions ?? null),
              totalSales:
                profile?.totalSalesMinor === undefined ||
                profile?.totalSalesMinor === null
                  ? ""
                  : String(fromMinor(profile.totalSalesMinor)),
              avgPrice:
                profile?.avgPriceMinor === undefined ||
                profile?.avgPriceMinor === null
                  ? ""
                  : String(fromMinor(profile.avgPriceMinor)),
              currency: profile?.currency ?? "USD",
            }}
          />
        </Card>

        <Card>
          <h2 className="mb-1 text-lg font-bold">Recent sales</h2>
          <p className="mb-3 text-sm text-slate-600">
            Add closed transactions you are allowed to publish. Buyers use these
            to judge whether you know their price range and area.
          </p>
          <AgentSaleForm />

          {profile?.sales.length ? (
            <ul className="mt-4 divide-y divide-slate-100 text-sm">
              {profile.sales.map((sale) => (
                <li
                  key={sale.id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{sale.address}</p>
                    <p className="text-xs text-slate-500">
                      {sale.soldOn.toLocaleDateString("en-US")} ·{" "}
                      {agentMoney(profile.currency, sale.priceMinor)} ·{" "}
                      {SALE_SIDE_LABELS[sale.side]}
                    </p>
                  </div>
                  <form action={deleteAgentSaleAction}>
                    <input type="hidden" name="id" value={sale.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                    >
                      remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No sales added yet.</p>
          )}
        </Card>
      </div>

      <SidebarBanners />
    </div>
  );
}
