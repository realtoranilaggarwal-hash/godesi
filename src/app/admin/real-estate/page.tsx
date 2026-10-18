import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { Card } from "@/components/ui";
import { PROPERTY_WHERE, REAL_ESTATE_AGENT_WHERE } from "@/lib/realEstateFeed";

export const metadata: Metadata = { title: "Real estate agents — admin" };

export default async function AdminRealEstatePage() {
  const staff = await getCurrentUser();
  if (!staff) redirect("/login?next=/admin/real-estate");
  if (!isStaff(staff)) redirect("/dashboard");

  const now = new Date();
  const agents = REAL_ESTATE_AGENT_WHERE;
  const [
    total,
    claimed,
    verified,
    invited,
    paid,
    properties,
    prospects,
    sources,
  ] = await Promise.all([
    db.business.count({ where: agents }),
    db.business.count({ where: { AND: [agents, { ownerId: { not: null } }] } }),
    db.business.count({ where: { AND: [agents, { verifiedProvider: true }] } }),
    db.business.count({
      where: { AND: [agents, { ownerId: null, invitedAt: { not: null } }] },
    }),
    db.business.count({
      where: {
        AND: [
          agents,
          { owner: { plan: { not: "FREE" }, planExpiresAt: { gt: now } } },
        ],
      },
    }),
    db.listing.count({ where: PROPERTY_WHERE }),
    db.prospect.count({ where: { categorySlug: "real-estate" } }),
    db.business.groupBy({
      by: ["source"],
      where: agents,
      _count: { _all: true },
      orderBy: { _count: { source: "desc" } },
    }),
  ]);

  const tiles = [
    { label: "Agent cards", value: total },
    { label: "Claimed", value: claimed },
    { label: "Unclaimed", value: total - claimed },
    { label: "Verified licence", value: verified },
    { label: "Unclaimed, already contacted", value: invited },
    { label: "Paying (Pro or Featured)", value: paid },
    { label: "Properties posted", value: properties },
    { label: "Real estate call-list leads", value: prospects },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
      <h1 className="text-2xl font-bold">🏡 Real estate agents</h1>
      <p className="text-sm text-slate-600">
        Agent cards on godesi.com, which also feed RealEstateYP.com.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label} className="text-center">
            <p className="text-2xl font-bold">{tile.value}</p>
            <p className="text-xs text-slate-600">{tile.label}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="font-bold">Where the cards came from</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {sources.map((row) => (
            <li key={row.source ?? "member"}>
              {row.source ?? "Added by members or staff"}:{" "}
              <strong>{row._count._all}</strong>
            </li>
          ))}
        </ul>
      </Card>
      <div className="flex flex-wrap gap-2 text-sm font-semibold">
        <Link
          href="/admin/prospects?category=real-estate"
          className="rounded-xl bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
        >
          ☎️ Real estate call list
        </Link>
        <Link
          href="/categories/real-estate-property-dealers"
          className="rounded-xl border border-slate-300 px-3 py-2 hover:bg-slate-50"
        >
          Public agent page
        </Link>
      </div>
    </div>
  );
}
