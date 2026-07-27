import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { AD_PLACEMENTS, formatCtr } from "@/lib/ads";
import { formatMinor } from "@/lib/format";
import { requestCurrency } from "@/lib/currency";
import { Alert, Badge, Card, EmptyState, LinkButton } from "@/components/ui";
import { AdCreativeForm } from "@/components/forms/AdCreativeForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My ads" };

const STATUS_TONE = {
  DRAFT: "slate",
  PENDING: "amber",
  ACTIVE: "green",
  REJECTED: "red",
  EXPIRED: "slate",
} as const;

function daysLeft(endsAt: Date | null) {
  if (!endsAt) return null;
  const diff = Math.ceil((endsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  return Math.max(diff, 0);
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: string;
}) {
  return (
    <div className={`rounded-xl p-3 text-center ${tone}`}>
      <p className="text-xl font-black">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
        {label}
      </p>
    </div>
  );
}

export default async function AdvertiserDashboardPage({
  searchParams,
}: {
  searchParams: { paid?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/ads");

  const [banners, orders] = await Promise.all([
    db.banner.findMany({
      where: { advertiserId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    db.adOrder.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalImpressions = banners.reduce((sum, b) => sum + b.impressions, 0);
  const totalClicks = banners.reduce((sum, b) => sum + b.clicks, 0);
  const spend = orders
    .filter((order) => order.status === "PAID")
    .reduce((sum, order) => sum + order.amountMinor, 0);
  const spendCurrency =
    orders.find((o) => o.status === "PAID")?.currency ??
    orders[0]?.currency ??
    requestCurrency();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My ads</h1>
          <p className="text-sm text-slate-600">
            Track performance and manage your banner creatives.
          </p>
        </div>
        <LinkButton href="/advertise">Book another slot</LinkButton>
      </div>

      {searchParams.paid ? (
        <Alert tone="success">
          Payment received. Upload your creative below — we approve ads within a day.
        </Alert>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Impressions"
          value={totalImpressions.toLocaleString("en-IN")}
          tone="bg-indigo-50 text-indigo-700"
        />
        <Stat
          label="Clicks"
          value={totalClicks.toLocaleString("en-IN")}
          tone="bg-emerald-50 text-emerald-700"
        />
        <Stat
          label="CTR"
          value={formatCtr(totalImpressions, totalClicks)}
          tone="bg-amber-50 text-amber-700"
        />
        <Stat
          label="Total spend"
          value={formatMinor(spend, spendCurrency)}
          tone="bg-fuchsia-50 text-fuchsia-700"
        />
      </div>

      {banners.length === 0 ? (
        <EmptyState
          title="No ads yet"
          body="Book a header, sidebar or skyscraper placement to start reaching desi buyers."
          action={<LinkButton href="/advertise">See advertising rates</LinkButton>}
        />
      ) : null}

      {banners.map((banner) => {
        const placement = AD_PLACEMENTS[banner.slot];
        const remaining = daysLeft(banner.endsAt);

        return (
          <Card key={banner.id} className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">{banner.title}</h2>
                <p className="text-sm text-slate-600">
                  {placement.name} · {placement.size.width} × {placement.size.height}
                  {banner.position ? ` · slot #${banner.position}` : ""}
                </p>
              </div>
              <Badge tone={STATUS_TONE[banner.status]}>{banner.status}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat
                label="Impressions"
                value={banner.impressions.toLocaleString("en-IN")}
                tone="bg-slate-50 text-slate-700"
              />
              <Stat
                label="Clicks"
                value={banner.clicks.toLocaleString("en-IN")}
                tone="bg-slate-50 text-slate-700"
              />
              <Stat
                label="CTR"
                value={formatCtr(banner.impressions, banner.clicks)}
                tone="bg-slate-50 text-slate-700"
              />
              <Stat
                label="Days left"
                value={remaining === null ? "—" : remaining}
                tone="bg-slate-50 text-slate-700"
              />
            </div>

            {banner.startsAt && banner.endsAt ? (
              <p className="text-xs text-slate-500">
                Runs {banner.startsAt.toLocaleDateString("en-IN")} –{" "}
                {banner.endsAt.toLocaleDateString("en-IN")}
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Booking starts once payment is confirmed.
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="h-auto w-full rounded-lg object-cover"
                />
              </div>
              <AdCreativeForm
                id={banner.id}
                title={banner.title}
                imageUrl={banner.imageUrl}
                linkUrl={banner.linkUrl}
                size={placement.size}
              />
            </div>
          </Card>
        );
      })}

      {orders.length ? (
        <Card>
          <h2 className="text-lg font-bold">Bookings</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Date</th>
                  <th>Placement</th>
                  <th>Duration</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-2">
                      {order.createdAt.toLocaleDateString("en-IN")}
                    </td>
                    <td>{AD_PLACEMENTS[order.slot].name}</td>
                    <td>
                      {order.months} month{order.months > 1 ? "s" : ""}
                    </td>
                    <td>
                      {formatMinor(order.amountMinor, order.currency)}
                    </td>
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
        </Card>
      ) : null}
    </div>
  );
}
