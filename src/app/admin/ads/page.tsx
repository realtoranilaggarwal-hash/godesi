import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { rejectBannerAction } from "@/app/actions/admin";
import { ApproveAdForm } from "@/components/forms/ApproveAdForm";
import { AD_PLACEMENTS } from "@/lib/ads";
import { formatMinor } from "@/lib/format";
import { Badge, Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ad orders" };

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/ads");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [pendingAds, adOrders] = await Promise.all([
    db.banner.findMany({
      where: { status: "PENDING" },
      orderBy: [{ slot: "asc" }, { position: "asc" }],
      include: { advertiser: { select: { email: true, name: true } } },
    }),
    db.adOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: { email: true } } },
    }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Ad orders</h1>
      <Card id="ads-awaiting-approval">
        <h2 className="mb-1 text-lg font-bold">Ads awaiting approval</h2>
        <p className="mb-3 text-sm text-slate-500">
          Paid bookings whose creative needs a check. Approving puts the ad live
          in the placement&apos;s rotation — a placement never runs out of room.
        </p>
        {pendingAds.length ? (
          <ul className="divide-y divide-slate-100">
            {pendingAds.map((banner) => (
              <li
                key={banner.id}
                className="flex flex-wrap items-center gap-3 py-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="h-16 w-28 rounded-lg border border-slate-200 object-cover"
                />
                <div className="min-w-[200px] flex-1">
                  <p className="text-sm font-semibold">{banner.title}</p>
                  <p className="text-xs text-slate-500">
                    {AD_PLACEMENTS[banner.slot].name} ·{" "}
                    {banner.advertiser?.email ?? "unassigned"} ·{" "}
                    {banner.endsAt
                      ? `until ${banner.endsAt.toLocaleDateString("en-IN")}`
                      : "no end date"}
                  </p>
                  <a
                    href={banner.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600"
                  >
                    {banner.linkUrl}
                  </a>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ApproveAdForm id={banner.id} />
                  <form action={rejectBannerAction}>
                    <input type="hidden" name="id" value={banner.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      reject
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Nothing waiting for review.</p>
        )}

        {adOrders.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Date</th>
                  <th>Advertiser</th>
                  <th>Placement</th>
                  <th>Months</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-2">
                      {order.createdAt.toLocaleDateString("en-IN")}
                    </td>
                    <td>{order.user.email}</td>
                    <td>{AD_PLACEMENTS[order.slot].name}</td>
                    <td>{order.months}</td>
                    <td>{formatMinor(order.amountMinor, order.currency)}</td>
                    <td>
                      <Badge tone={order.status === "PAID" ? "green" : "amber"}>
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>

      <p className="text-sm text-slate-500">
        Slots and creatives live on the{" "}
        <Link href="/admin/banners" className="font-semibold text-indigo-600">
          banner desk
        </Link>
        .
      </p>
    </div>
  );
}
