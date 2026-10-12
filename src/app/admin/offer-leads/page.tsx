import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { deskFallback } from "@/lib/adminSections";
import { OFFER_INTERESTS, offerInterest } from "@/lib/offerInterests";
import { offerLeadSelect, offerLeadsWhere } from "@/lib/offerLeads";
import { Badge, Card, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Offer leads" };

const PAGE_SIZE = 100;

export default async function OfferLeadsPage({
  searchParams,
}: {
  searchParams: { interest?: string; page?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/offer-leads");
  if (user.role !== "ADMIN") redirect(deskFallback(user, "Offer leads"));

  const interest = offerInterest(searchParams.interest ?? "")?.id ?? null;
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);
  const where = offerLeadsWhere(interest);

  const [counts, total, leads] = await Promise.all([
    db.$queryRaw<{ id: string; count: bigint }[]>`
      SELECT unnest("offerInterests") AS id, COUNT(*) AS count
      FROM "User" WHERE "bannedAt" IS NULL GROUP BY 1`,
    db.user.count({ where }),
    db.user.findMany({
      where,
      select: offerLeadSelect,
      orderBy: [
        { offerInterestsAt: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
      ],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  const countFor = new Map(counts.map((row) => [row.id, Number(row.count)]));
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const exportHref = `/admin/offer-leads/export${interest ? `?interest=${interest}` : ""}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">🎁 Offer leads</h1>
          <p className="text-sm text-slate-600">
            Members who asked for offers at signup or on their dashboard. They
            agreed to be contacted about the topics they ticked only.
          </p>
        </div>
        <a
          href={exportHref}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          ⬇️ Download CSV
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/offer-leads"
          className={`rounded-full border px-3 py-1 text-sm ${
            interest
              ? "border-slate-300 bg-white"
              : "border-indigo-600 bg-indigo-600 text-white"
          }`}
        >
          All topics
        </Link>
        {OFFER_INTERESTS.map((item) => (
          <Link
            key={item.id}
            href={`/admin/offer-leads?interest=${item.id}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              interest === item.id
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-300 bg-white"
            }`}
          >
            {item.icon} {item.label}{" "}
            <span className="font-semibold">{countFor.get(item.id) ?? 0}</span>
          </Link>
        ))}
      </div>

      <Card className="overflow-x-auto p-0">
        {leads.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No leads yet"
              body="Picks made at signup or on /dashboard/offers show up here."
            />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Member</th>
                <th className="px-3 py-2">Contact</th>
                <th className="px-3 py-2">Wants offers on</th>
                <th className="px-3 py-2">Picked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => {
                const phone = lead.offerPhone ?? lead.phone;
                return (
                  <tr key={lead.id} className="align-top">
                    <td className="px-3 py-2">
                      <div className="font-semibold">
                        {lead.username ? (
                          <Link
                            href={`/${lead.username}`}
                            className="hover:underline"
                          >
                            {lead.name}
                          </Link>
                        ) : (
                          lead.name
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {lead.role.toLowerCase()}
                        {lead.location ? ` · ${lead.location}` : ""}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-indigo-700 hover:underline"
                      >
                        {lead.email}
                      </a>
                      {lead.emailVerifiedAt ? null : (
                        <span className="ml-1">
                          <Badge tone="amber">unconfirmed</Badge>
                        </span>
                      )}
                      {phone ? (
                        <div>
                          <a href={`tel:${phone}`} className="hover:underline">
                            {phone}
                          </a>{" "}
                          ·{" "}
                          <a
                            href={`https://wa.me/${phone.replace(/\D/g, "")}`}
                            className="text-emerald-700 hover:underline"
                          >
                            WhatsApp
                          </a>
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {lead.offerInterests.map((id) => {
                          const item = offerInterest(id);
                          return item ? (
                            <Badge
                              key={id}
                              tone={id === interest ? "indigo" : "slate"}
                            >
                              {item.icon} {item.label}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">
                      {(
                        lead.offerInterestsAt ?? lead.createdAt
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {pages > 1 ? (
        <div className="flex items-center gap-3 text-sm">
          {page > 1 ? (
            <Link
              href={`/admin/offer-leads?${new URLSearchParams({ ...(interest ? { interest } : {}), page: String(page - 1) })}`}
            >
              ← Newer
            </Link>
          ) : null}
          <span className="text-slate-500">
            Page {page} of {pages} · {total} members
          </span>
          {page < pages ? (
            <Link
              href={`/admin/offer-leads?${new URLSearchParams({ ...(interest ? { interest } : {}), page: String(page + 1) })}`}
            >
              Older →
            </Link>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-slate-500">{total} members</p>
      )}
    </div>
  );
}
