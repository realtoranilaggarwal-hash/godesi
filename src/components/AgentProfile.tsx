import Link from "next/link";
import type { SaleSide } from "@prisma/client";
import { db } from "@/lib/db";
import {
  REVIEW_CRITERIA,
  SALE_SIDE_LABELS,
  agentMoney,
  criteriaAverages,
  splitList,
} from "@/lib/agents";
import { Badge, Card } from "@/components/ui";
import { PlaceLink } from "@/components/PlaceLink";

type AgentSaleRow = {
  id: string;
  soldOn: Date;
  address: string;
  priceMinor: number;
  side: SaleSide;
};

export type AgentProfileData = {
  serviceAreas: string | null;
  licenseNumber: string | null;
  licenseState: string | null;
  designations: string | null;
  specialties: string | null;
  awards: string | null;
  brokerage: string | null;
  brokerageAddress: string | null;
  brokerageWebsite: string | null;
  licenseType: string | null;
  mlsId: string | null;
  mlsBoard: string | null;
  certifications: string | null;
  languages: string | null;
  yearsExperience: number | null;
  transactions: number | null;
  totalSalesMinor: number | null;
  avgPriceMinor: number | null;
  currency: string;
  sales: AgentSaleRow[];
};

type ReviewScores = {
  localKnowledge: number | null;
  processExpertise: number | null;
  responsiveness: number | null;
  negotiation: number | null;
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
      <p className="text-base font-black text-slate-900 sm:text-lg">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </div>
    </div>
  );
}

/** The credentials block that turns a card into a full agent profile. */
export function AgentDetails({
  profile,
  reviews,
}: {
  profile: AgentProfileData;
  reviews: ReviewScores[];
}) {
  const stats: { label: string; value: string }[] = [];
  const totalSales = agentMoney(profile.currency, profile.totalSalesMinor);
  const avgPrice = agentMoney(profile.currency, profile.avgPriceMinor);

  if (totalSales) stats.push({ label: "Total sales", value: totalSales });
  if (profile.yearsExperience !== null) {
    stats.push({ label: "Years of experience", value: String(profile.yearsExperience) });
  }
  if (profile.transactions !== null) {
    stats.push({ label: "Transactions", value: String(profile.transactions) });
  }
  if (avgPrice) stats.push({ label: "Average price", value: avgPrice });

  const criteria = criteriaAverages(reviews).filter((item) => item.average !== null);

  return (
    <>
      {stats.length ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map((stat) => (
            <Stat key={stat.label} {...stat} />
          ))}
        </div>
      ) : null}

      <Card>
        <h2 className="text-lg font-bold">Agent credentials</h2>
        <div className="mt-3 space-y-4">
          {profile.brokerage ? (
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Brokerage:</span> {profile.brokerage}
              {profile.brokerageAddress ? ` · ${profile.brokerageAddress}` : ""}
              {profile.brokerageWebsite ? (
                <>
                  {" · "}
                  <a
                    href={profile.brokerageWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    website
                  </a>
                </>
              ) : null}
            </p>
          ) : null}

          {profile.licenseNumber || profile.licenseState || profile.licenseType ? (
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Licence:</span>{" "}
              {[profile.licenseNumber, profile.licenseType, profile.licenseState]
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : null}

          {profile.mlsId || profile.mlsBoard ? (
            <p className="text-sm text-slate-700">
              <span className="font-semibold">MLS:</span>{" "}
              {[profile.mlsId, profile.mlsBoard].filter(Boolean).join(" · ")}
            </p>
          ) : null}

          <List title="Certifications" items={splitList(profile.certifications)} />
          <List title="Languages spoken" items={splitList(profile.languages)} />

          <List title="Service areas" items={splitList(profile.serviceAreas)} />
          <List title="Specialties" items={splitList(profile.specialties)} />
          <List title="Designations" items={splitList(profile.designations)} />
          <List title="Awards" items={splitList(profile.awards)} />
        </div>
      </Card>

      {criteria.length ? (
        <Card>
          <h2 className="text-lg font-bold">What clients rate highly</h2>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            {REVIEW_CRITERIA.map((criterion) => {
              const row = criteria.find((item) => item.id === criterion.id);
              if (!row || row.average === null) return null;

              return (
                <div
                  key={criterion.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                >
                  <dt className="text-slate-600">{criterion.label}</dt>
                  <dd className="font-bold text-slate-900">
                    {row.average.toFixed(1)} / 5
                  </dd>
                </div>
              );
            })}
          </dl>
        </Card>
      ) : null}

      {profile.sales.length ? (
        <Card>
          <h2 className="text-lg font-bold">Recent sales</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-2">Closed</th>
                  <th className="py-2">Address</th>
                  <th className="py-2">Price</th>
                  <th className="py-2">Represented</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profile.sales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="py-2 text-slate-500">
                      {sale.soldOn.toLocaleDateString("en-US")}
                    </td>
                    <td className="py-2 font-medium text-slate-800">{sale.address}</td>
                    <td className="py-2">{agentMoney(profile.currency, sale.priceMinor)}</td>
                    <td className="py-2 text-slate-500">{SALE_SIDE_LABELS[sale.side]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </>
  );
}

/** Other agents working the same city, so a visitor always has a next step. */
export async function SimilarAgents({
  businessId,
  city,
  subcategorySlug,
}: {
  businessId: string;
  city: string;
  subcategorySlug: string;
}) {
  const agents = await db.business.findMany({
    where: {
      id: { not: businessId },
      status: "APPROVED",
      subcategorySlug,
      city,
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 6,
    select: { id: true, slug: true, name: true, city: true, state: true },
  });

  if (!agents.length) return null;

  return (
    <Card>
      <h2 className="text-lg font-bold">More agents near you</h2>
      <ul className="mt-2 divide-y divide-slate-100 text-sm">
        {agents.map((agent) => (
          <li key={agent.id} className="py-2">
            <Link href={`/b/${agent.slug}`} className="font-semibold text-indigo-600">
              {agent.name}
            </Link>
            <p className="text-xs text-slate-500">
              <PlaceLink city={agent.city} state={agent.state} />
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
