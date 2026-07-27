import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  deleteBannerAction,
  deleteNewsAction,
  deleteNewsFeedAction,
  setEventStatusAction,
  setListingStatusAction,
  setNewsStatusAction,
  setUserPlanAction,
  toggleBannerAction,
  toggleFeaturedAction,
  rejectBannerAction,
} from "@/app/actions/admin";
import { BannerForm } from "@/components/forms/BannerForm";
import { ApproveAdForm } from "@/components/forms/ApproveAdForm";
import { AD_PLACEMENTS, formatCtr } from "@/lib/ads";
import { NewsFeedForm } from "@/components/forms/NewsFeedForm";
import { formatEventDate } from "@/lib/events";
import { Badge, Card } from "@/components/ui";
import { PLAN_ORDER } from "@/lib/plans";
import { formatMinor } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [
    businesses,
    users,
    payments,
    leadCount,
    banners,
    events,
    newsItems,
    feeds,
    adOrders,
  ] =
    await Promise.all([
    db.business.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { owner: { select: { email: true, plan: true } } },
    }),
    db.user.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: { email: true } } },
    }),
      db.lead.count(),
      db.banner.findMany({
        orderBy: [{ slot: "asc" }, { position: "asc" }],
        include: { advertiser: { select: { email: true, name: true } } },
      }),
      db.event.findMany({
        orderBy: { startsAt: "desc" },
        take: 30,
        include: {
          organizer: { select: { email: true } },
          _count: { select: { tickets: true } },
        },
      }),
      db.newsItem.findMany({ orderBy: { createdAt: "desc" }, take: 40 }),
      db.newsFeed.findMany({ orderBy: { createdAt: "asc" } }),
      db.adOrder.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { email: true } } },
      }),
    ]);

  const pendingAds = banners.filter((banner) => banner.status === "PENDING");

  const pending = businesses.filter((b) => b.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin panel</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Businesses", businesses.length],
          ["Pending approval", pending],
          ["Users", users.length],
          ["Leads", leadCount],
        ].map(([label, value]) => (
          <Card key={label as string} className="text-center">
            <p className="text-2xl font-black text-indigo-600">{value}</p>
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-bold">Listings</h2>
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
                    <Link href={`/b/${business.slug}`} className="font-medium text-indigo-600">
                      {business.name}
                    </Link>
                    <div className="text-xs text-slate-500">
                      {business.category} · {business.city}
                    </div>
                  </td>
                  <td className="text-xs text-slate-600">{business.owner.email}</td>
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
                      <button type="submit" className="text-xs font-semibold text-indigo-600">
                        {business.featured ? "Yes — unset" : "No — set"}
                      </button>
                    </form>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      {(["APPROVED", "REJECTED", "PENDING"] as const)
                        .filter((status) => status !== business.status)
                        .map((status) => (
                          <form key={status} action={setListingStatusAction}>
                            <input type="hidden" name="id" value={business.id} />
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

      <Card>
        <h2 className="mb-3 text-lg font-bold">Users &amp; subscriptions</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">User</th>
                <th>Role</th>
                <th>Plan</th>
                <th className="text-right">Change plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((row) => (
                <tr key={row.id}>
                  <td className="py-2">
                    <div className="font-medium">{row.name}</div>
                    <div className="text-xs text-slate-500">{row.email}</div>
                  </td>
                  <td className="text-xs">{row.role}</td>
                  <td>
                    <Badge tone={row.plan === "FREE" ? "slate" : "indigo"}>{row.plan}</Badge>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      {PLAN_ORDER.filter((plan) => plan !== row.plan).map((plan) => (
                        <form key={plan} action={setUserPlanAction}>
                          <input type="hidden" name="id" value={row.id} />
                          <input type="hidden" name="plan" value={plan} />
                          <button
                            type="submit"
                            className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                          >
                            {plan}
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

      <Card>
        <h2 className="mb-3 text-lg font-bold">Events</h2>
        {events.length ? (
          <ul className="divide-y divide-slate-100 text-sm">
            {events.map((event) => (
              <li key={event.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <div>
                  <Link href={`/events/${event.slug}`} className="font-medium text-indigo-600">
                    {event.title}
                  </Link>
                  <div className="text-xs text-slate-500">
                    {formatEventDate(event.startsAt)} · {event.city} · {event.organizer.email} ·{" "}
                    {event.seatsBooked}/{event.seatsTotal} seats · {event._count.tickets} bookings
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    tone={
                      event.status === "APPROVED"
                        ? "green"
                        : event.status === "PENDING"
                          ? "amber"
                          : "red"
                    }
                  >
                    {event.status}
                  </Badge>
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="rounded-lg border border-indigo-200 px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                  >
                    edit
                  </Link>
                  {(["APPROVED", "REJECTED"] as const)
                    .filter((status) => status !== event.status)
                    .map((status) => (
                      <form key={status} action={setEventStatusAction}>
                        <input type="hidden" name="id" value={event.id} />
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
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No events posted yet.</p>
        )}
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-bold">Ads awaiting approval</h2>
        <p className="mb-3 text-sm text-slate-500">
          Paid bookings whose creative needs a check. Approving assigns a free slot and puts
          the ad live.
        </p>
        {pendingAds.length ? (
          <ul className="divide-y divide-slate-100">
            {pendingAds.map((banner) => (
              <li key={banner.id} className="flex flex-wrap items-center gap-3 py-3">
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
                  <ApproveAdForm
                    id={banner.id}
                    capacity={AD_PLACEMENTS[banner.slot].slots}
                  />
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

      <Card>
        <h2 className="mb-1 text-lg font-bold">Banners</h2>
        <p className="mb-3 text-sm text-slate-500">
          10 sidebar slots (300×250), 4 skyscrapers (160×600) and 1 header slot. Saving a slot
          replaces whatever is in it.
        </p>
        <BannerForm />

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Slot</th>
                <th>Banner</th>
                <th>Impressions</th>
                <th>Clicks</th>
                <th>CTR</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {banners.map((banner) => (
                <tr key={banner.id}>
                  <td className="py-2 text-xs font-semibold">
                    {banner.slot} {banner.position ? `#${banner.position}` : "(unassigned)"}
                  </td>
                  <td>
                    <a
                      href={banner.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-indigo-600"
                    >
                      {banner.title}
                    </a>
                    <div className="text-xs text-slate-400">
                      {banner.status.toLowerCase()} ·{" "}
                      {banner.active ? "running" : "paused"}
                      {banner.advertiser ? ` · ${banner.advertiser.email}` : ""}
                    </div>
                  </td>
                  <td>{banner.impressions}</td>
                  <td>{banner.clicks}</td>
                  <td className="text-xs text-slate-500">
                    {banner.impressions
                      ? formatCtr(banner.impressions, banner.clicks)
                      : "—"}
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <form action={toggleBannerAction}>
                        <input type="hidden" name="id" value={banner.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                        >
                          {banner.active ? "pause" : "activate"}
                        </button>
                      </form>
                      <form action={deleteBannerAction}>
                        <input type="hidden" name="id" value={banner.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {banners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-3 text-sm text-slate-500">
                    No banners yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-bold">News</h2>
        <p className="mb-3 text-sm text-slate-500">
          The crawler runs every 30 minutes and skips duplicates. Member submissions arrive as
          pending.
        </p>
        <NewsFeedForm />

        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {feeds.map((feed) => (
            <li key={feed.id} className="flex items-center justify-between gap-2 py-2">
              <div>
                <p className="font-medium">{feed.name}</p>
                <p className="text-xs text-slate-400">
                  {feed.url} · last run{" "}
                  {feed.lastFetchedAt ? feed.lastFetchedAt.toLocaleString("en-IN") : "never"}
                </p>
              </div>
              <form action={deleteNewsFeedAction}>
                <input type="hidden" name="id" value={feed.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  remove
                </button>
              </form>
            </li>
          ))}
        </ul>

        <ul className="mt-4 divide-y divide-slate-100 text-sm">
          {newsItems.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <div className="min-w-0">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-indigo-600"
                >
                  {item.title}
                </a>
                <p className="text-xs text-slate-400">
                  {item.source} · {item.publishedAt.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  tone={
                    item.status === "PUBLISHED"
                      ? "green"
                      : item.status === "PENDING"
                        ? "amber"
                        : "red"
                  }
                >
                  {item.status}
                </Badge>
                {(["PUBLISHED", "REJECTED"] as const)
                  .filter((status) => status !== item.status)
                  .map((status) => (
                    <form key={status} action={setNewsStatusAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="status" value={status} />
                      <button
                        type="submit"
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                      >
                        {status.toLowerCase()}
                      </button>
                    </form>
                  ))}
                <form action={deleteNewsAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    delete
                  </button>
                </form>
              </div>
            </li>
          ))}
          {newsItems.length === 0 ? (
            <li className="py-2 text-slate-500">No stories ingested yet.</li>
          ) : null}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-bold">Recent payments</h2>
        {payments.length ? (
          <ul className="divide-y divide-slate-100 text-sm">
            {payments.map((payment) => (
              <li key={payment.id} className="flex justify-between py-2">
                <span>
                  {payment.user.email} · {payment.plan}
                </span>
                <span className="text-slate-500">
                  {formatMinor(payment.amountMinor, payment.currency)}{" "}
                  · {payment.createdAt.toLocaleDateString("en-IN")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No payments recorded yet.</p>
        )}
      </Card>
    </div>
  );
}
