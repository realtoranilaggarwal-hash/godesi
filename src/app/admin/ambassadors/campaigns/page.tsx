import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { formatMinor } from "@/lib/format";
import {
  promoStats,
  sumStats,
  uniqueVisitorsByAmbassador,
} from "@/lib/ambassadorPromo";
import { AMBASSADOR_COMPLIANCE_REVIEW_NOTE } from "@/lib/joinGoals";
import { Badge, Card, inputClass } from "@/components/ui";
import {
  createAmbassadorPromoAction,
  deleteAmbassadorPromoAction,
  updateAmbassadorPromoAction,
} from "@/app/actions/joinGoals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Ambassador event campaigns",
  robots: { index: false },
};

/*
 * Campaign benefits and eligibility text must be reviewed by compliance
 * personnel before launch. Never offer anything for mortgage, real-estate
 * settlement or insurance referrals.
 */
export default async function AmbassadorCampaignsPage() {
  const user = await getCurrentUser();
  if (!user)
    redirect(`/login?next=${encodeURIComponent("/admin/ambassadors/campaigns")}`);
  if (!isStaff(user)) notFound();

  const [ambassadors, events, campaigns] = await Promise.all([
    db.ambassador.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true,
        city: true,
        promoCode: true,
        user: { select: { name: true } },
      },
      orderBy: { approvedAt: "desc" },
    }),
    db.event.findMany({
      where: { status: "APPROVED", startsAt: { gt: new Date() } },
      select: { id: true, title: true, city: true, startsAt: true },
      orderBy: { startsAt: "asc" },
      take: 150,
    }),
    db.ambassadorPromoEvent.findMany({
      include: {
        ambassador: {
          select: { id: true, city: true, user: { select: { name: true } } },
        },
        event: { select: { title: true, slug: true, currency: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
  ]);
  const [stats, visitors] = await Promise.all([
    promoStats(campaigns),
    uniqueVisitorsByAmbassador(
      Array.from(new Set(campaigns.map((campaign) => campaign.ambassador.id))),
    ),
  ]);

  const byAmbassador = new Map<
    string,
    { name: string; city: string; codes: string[]; sales: Map<string, number> }
  >();
  for (const campaign of campaigns) {
    const row = byAmbassador.get(campaign.ambassador.id) ?? {
      name: campaign.ambassador.user.name,
      city: campaign.ambassador.city,
      codes: [],
      sales: new Map<string, number>(),
    };
    row.codes.push(campaign.code);
    const currency = campaign.event.currency;
    row.sales.set(
      currency,
      (row.sales.get(currency) ?? 0) + stats.get(campaign.code)!.salesMinor,
    );
    byAmbassador.set(campaign.ambassador.id, row);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">📣 Ambassador event campaigns</h1>
        <Link
          href="/admin/ambassadors"
          className="text-sm font-semibold text-indigo-600"
        >
          ← Ambassadors desk
        </Link>
      </div>
      <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
        ⚖️ Event &amp; community marketing only — no benefit may be tied to
        mortgage, real-estate settlement or insurance business.{" "}
        {AMBASSADOR_COMPLIANCE_REVIEW_NOTE}
      </p>

      <Card>
        <h2 className="font-bold">Assign a promo link</h2>
        <p className="text-sm text-slate-600">
          Saving again for the same ambassador and event updates its benefit.
        </p>
        <form
          action={createAmbassadorPromoAction}
          className="mt-3 grid gap-2 sm:grid-cols-2"
        >
          <select name="ambassadorId" required className={inputClass}>
            <option value="">Ambassador…</option>
            {ambassadors.map((item) => (
              <option key={item.id} value={item.id}>
                {item.user.name} · {item.city}
                {item.promoCode ? ` · ${item.promoCode}` : ""}
              </option>
            ))}
          </select>
          <select name="eventId" required className={inputClass}>
            <option value="">Upcoming event…</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.startsAt.toISOString().slice(0, 10)} · {event.title} ·{" "}
                {event.city}
              </option>
            ))}
          </select>
          <input
            name="benefit"
            maxLength={300}
            placeholder="Benefit, e.g. 2 complimentary invites + stage mention"
            className={inputClass}
          />
          <input
            name="rewardTickets"
            type="number"
            min={1}
            placeholder="Verified tickets needed (blank = no target)"
            className={inputClass}
          />
          <input
            name="eligibility"
            maxLength={500}
            placeholder="Eligibility, e.g. Verified tickets only; own bookings excluded"
            className={`${inputClass} sm:col-span-2`}
          />
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white sm:col-span-2"
          >
            Create / update campaign
          </button>
        </form>
      </Card>

      <Card>
        <h2 className="font-bold">Performance by ambassador</h2>
        {byAmbassador.size === 0 ? (
          <p className="mt-1 text-sm text-slate-500">No campaigns yet.</p>
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="py-1 pr-3">Ambassador</th>
                  <th className="py-1 pr-3">Campaigns</th>
                  <th className="py-1 pr-3">Clicks</th>
                  <th className="py-1 pr-3">Visitors</th>
                  <th className="py-1 pr-3">Bookings</th>
                  <th className="py-1 pr-3">Verified tickets</th>
                  <th className="py-1 pr-3">Verified sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.from(byAmbassador, ([id, row]) => {
                  const total = sumStats(row.codes.map((code) => stats.get(code)!));
                  return (
                    <tr key={id}>
                      <td className="py-1.5 pr-3 font-semibold">
                        <Link href={`/admin/ambassadors#${id}`} className="hover:underline">
                          {row.name}
                        </Link>{" "}
                        <span className="text-xs font-normal text-slate-500">
                          {row.city}
                        </span>
                      </td>
                      <td className="py-1.5 pr-3">{row.codes.length}</td>
                      <td className="py-1.5 pr-3">{total.clicks}</td>
                      <td className="py-1.5 pr-3">{visitors.get(id) ?? 0}</td>
                      <td className="py-1.5 pr-3">{total.bookings}</td>
                      <td className="py-1.5 pr-3">{total.verifiedSeats}</td>
                      <td className="py-1.5 pr-3">
                        {Array.from(row.sales, ([currency, minor]) =>
                          formatMinor(minor, currency),
                        ).join(" + ")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {campaigns.map((campaign) => {
        const s = stats.get(campaign.code)!;
        return (
          <Card key={campaign.id}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="break-words font-bold">
                  {campaign.ambassador.user.name} →{" "}
                  <Link
                    href={`/events/${campaign.event.slug}`}
                    className="hover:underline"
                  >
                    {campaign.event.title}
                  </Link>
                </p>
                <p className="font-mono text-xs text-slate-600">
                  /r/{campaign.code}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {s.clicks} clicks · {s.visitors} visitors · {s.bookings}{" "}
                  bookings · {s.verifiedSeats} verified tickets ·{" "}
                  {s.paidSeats} paid ·{" "}
                  {formatMinor(s.salesMinor, campaign.event.currency)}
                </p>
              </div>
              <Badge tone={campaign.active ? "green" : "slate"}>
                {campaign.active ? "active" : "paused"}
              </Badge>
            </div>
            <form
              action={updateAmbassadorPromoAction}
              className="mt-3 grid gap-2 sm:grid-cols-6"
            >
              <input type="hidden" name="id" value={campaign.id} />
              <input
                name="benefit"
                defaultValue={campaign.benefit ?? ""}
                placeholder="Benefit"
                maxLength={300}
                className={`${inputClass} sm:col-span-2`}
              />
              <input
                name="eligibility"
                defaultValue={campaign.eligibility ?? ""}
                placeholder="Eligibility"
                maxLength={500}
                className={`${inputClass} sm:col-span-2`}
              />
              <input
                name="rewardTickets"
                type="number"
                min={1}
                defaultValue={campaign.rewardTickets ?? ""}
                placeholder="Target"
                className={inputClass}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={campaign.active}
                  className="h-4 w-4"
                />
                Active
              </label>
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white sm:col-span-5"
              >
                Save
              </button>
              <button
                type="submit"
                formAction={deleteAmbassadorPromoAction}
                className="rounded-xl border border-red-300 px-3 py-2 text-sm font-semibold text-red-700"
              >
                Delete
              </button>
            </form>
          </Card>
        );
      })}
    </div>
  );
}
