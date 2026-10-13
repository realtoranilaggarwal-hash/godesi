import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { can, getCurrentUser, isStaff } from "@/lib/auth";
import {
  setClassifiedStatusAction,
  toggleClassifiedFeaturedAction,
} from "@/app/actions/admin";
import { deleteListingAction } from "@/app/actions/listings";
import { Badge, Card } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { KIND_LABELS } from "@/lib/listings";
import { POSTED_BY_LABELS, propertyTypeLabel } from "@/lib/property";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Property desk" };

const FILTERS = [
  { id: "", label: "All property" },
  { id: "PENDING", label: "Pending" },
  { id: "APPROVED", label: "Live" },
  { id: "REJECTED", label: "Rejected" },
] as const;

export default async function PropertyDeskPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/properties");
  if (!isStaff(user) || !can(user, "listings")) redirect("/dashboard");

  const status = FILTERS.some((filter) => filter.id === searchParams.status)
    ? searchParams.status
    : "";

  const [listings, leads, counts] = await Promise.all([
    db.listing.findMany({
      where: {
        kind: { in: ["PROPERTY_SALE", "PROPERTY_RENT"] },
        ...(status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : {}),
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 80,
      include: {
        owner: { select: { name: true, email: true, plan: true } },
        _count: { select: { leads: true } },
      },
    }),
    db.listingLead.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      include: {
        listing: { select: { slug: true, title: true, city: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    db.listing.groupBy({
      by: ["status"],
      where: { kind: { in: ["PROPERTY_SALE", "PROPERTY_RENT"] } },
      _count: { _all: true },
    }),
  ]);

  const total = counts.reduce((sum, row) => sum + row._count._all, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Property desk 🏢</h1>
        <p className="text-sm text-slate-600">
          Approve, reject, feature and de-spam member property. {total} listing
          {total === 1 ? "" : "s"} in total
          {counts.length
            ? ` — ${counts
                .map((row) => `${row._count._all} ${row.status.toLowerCase()}`)
                .join(", ")}`
            : ""}
          .
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm font-semibold">
        {FILTERS.map((filter) => (
          <Link
            key={filter.id}
            href={filter.id ? `/admin/properties?status=${filter.id}` : "/admin/properties"}
            className={`rounded-full px-3 py-1.5 ${
              status === filter.id
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {filter.label}
          </Link>
        ))}
        <Link
          href="/real-estate"
          className="rounded-full border border-slate-300 px-3 py-1.5 hover:bg-white"
        >
          View the public page →
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Property</th>
                <th>Owner</th>
                <th>Price</th>
                <th>Leads</th>
                <th>Status</th>
                <th>Featured</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listings.map((listing) => (
                <tr key={listing.id}>
                  <td className="py-2">
                    <Link
                      href={`/listings/${listing.slug}`}
                      className="font-medium text-indigo-600"
                    >
                      {listing.title}
                    </Link>
                    <div className="text-xs text-slate-500">
                      {KIND_LABELS[listing.kind]}
                      {listing.propertyType
                        ? ` · ${propertyTypeLabel(listing.propertyType)}`
                        : ""}
                      {listing.postedByRole
                        ? ` · ${POSTED_BY_LABELS[listing.postedByRole]}`
                        : ""}
                      {` · ${listing.city}`}
                    </div>
                  </td>
                  <td className="text-xs text-slate-600">
                    {listing.owner.name}
                    <div>{listing.owner.email}</div>
                  </td>
                  <td className="whitespace-nowrap font-semibold">
                    {listing.price
                      ? formatMoney(listing.price, listing.currency)
                      : "On request"}
                  </td>
                  <td className="font-semibold">{listing._count.leads}</td>
                  <td>
                    <Badge
                      tone={
                        listing.status === "APPROVED"
                          ? "green"
                          : listing.status === "PENDING"
                            ? "amber"
                            : "red"
                      }
                    >
                      {listing.status}
                    </Badge>
                  </td>
                  <td>
                    <form action={toggleClassifiedFeaturedAction}>
                      <input type="hidden" name="id" value={listing.id} />
                      <button
                        type="submit"
                        className="text-xs font-semibold text-indigo-600"
                      >
                        {listing.featured ? "⭐ Yes — unset" : "No — set"}
                      </button>
                    </form>
                  </td>
                  <td>
                    <div className="flex flex-wrap justify-end gap-2">
                      {(["APPROVED", "PENDING", "REJECTED"] as const)
                        .filter((next) => next !== listing.status)
                        .map((next) => (
                          <form key={next} action={setClassifiedStatusAction}>
                            <input type="hidden" name="id" value={listing.id} />
                            <input type="hidden" name="status" value={next} />
                            <button
                              type="submit"
                              className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                            >
                              {next.toLowerCase()}
                            </button>
                          </form>
                        ))}
                      <form action={deleteListingAction}>
                        <input type="hidden" name="id" value={listing.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                        >
                          delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-3 text-slate-500">
                    Nothing here yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-bold">Latest leads</h2>
        <p className="mb-3 text-xs text-slate-500">
          Recorded when a visitor taps WhatsApp or reveals a phone or email on a
          listing — the demand signal to show sellers when you pitch featured
          slots.
        </p>
        <ul className="divide-y divide-slate-100 text-sm">
          {leads.map((lead) => (
            <li key={lead.id} className="flex flex-wrap justify-between gap-2 py-2">
              <div>
                <Link
                  href={`/listings/${lead.listing.slug}`}
                  className="font-medium text-indigo-600"
                >
                  {lead.listing.title}
                </Link>
                <p className="text-xs text-slate-500">
                  {lead.listing.city} · {lead.channel} ·{" "}
                  {lead.user ? `${lead.user.name} (${lead.user.email})` : "guest"}
                </p>
              </div>
              <span className="text-xs text-slate-500">
                {lead.createdAt.toLocaleString()}
              </span>
            </li>
          ))}
          {leads.length === 0 ? (
            <li className="py-2 text-slate-500">No enquiries recorded yet.</li>
          ) : null}
        </ul>
      </Card>
    </div>
  );
}
