import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatEventDate } from "@/lib/events";
import { siteUrl } from "@/lib/format";
import {
  benefitEarned,
  promoStats,
  sumStats,
  uniqueVisitorsByAmbassador,
} from "@/lib/ambassadorPromo";
import { AMBASSADOR_COMPLIANCE_REVIEW_NOTE } from "@/lib/joinGoals";
import { Alert, Badge, Card, LinkButton } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";
import { AmbassadorBusinessForm } from "@/components/forms/AmbassadorBusinessForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "My ambassador dashboard",
  robots: { index: false },
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-2 text-center">
      <p className="text-lg font-black text-slate-900">{value}</p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  );
}

export default async function AmbassadorDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/ambassador/dashboard");

  const ambassador = await db.ambassador.findUnique({
    where: { userId: user.id },
    include: {
      promoEvents: {
        include: {
          event: {
            select: {
              title: true,
              slug: true,
              startsAt: true,
              timeZone: true,
              city: true,
              currency: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (ambassador?.status !== "APPROVED") {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold">Ambassador dashboard</h1>
        <Alert tone="info">
          {ambassador?.status === "PENDING"
            ? "Your ambassador application is with the GoDesi team. Your dashboard opens once you are approved."
            : "The dashboard is for approved GoDesi Community Ambassadors."}
        </Alert>
        <LinkButton href="/ambassador#apply">
          {ambassador ? "View my application" : "Apply to be an ambassador"}
        </LinkButton>
      </div>
    );
  }

  const [stats, visitors] = await Promise.all([
    promoStats(ambassador.promoEvents),
    uniqueVisitorsByAmbassador(
      ambassador.promoEvents.map((campaign) => campaign.id),
    ),
  ]);
  const all = ambassador.promoEvents.map(
    (campaign) => stats.get(campaign.code)!,
  );
  const totals = {
    ...sumStats(all),
    visitors: visitors.get(ambassador.id) ?? 0,
  };
  const earned = ambassador.promoEvents.filter((campaign) =>
    benefitEarned(campaign, stats.get(campaign.code)!),
  );
  const base = siteUrl();

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">📊 My ambassador dashboard</h1>
          <p className="text-sm text-slate-600">
            {ambassador.city} · your code{" "}
            <span className="font-mono font-bold">{ambassador.promoCode}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton
            href={`/ambassador/certificate/${ambassador.id}`}
            variant="secondary"
          >
            🏅 Certificate
          </LinkButton>
          <LinkButton href="/ambassador/terms" variant="secondary">
            Program terms
          </LinkButton>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Link clicks" value={totals.clicks} />
        <Stat label="Unique visitors" value={totals.visitors} />
        <Stat label="Ticket bookings" value={totals.bookings} />
        <Stat label="Verified tickets" value={totals.verifiedSeats} />
      </div>

      <Card>
        <h2 className="font-bold">🎁 Earned benefits</h2>
        {earned.length || ambassador.businessApprovedAt ? (
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {earned.map((campaign) => (
              <li key={campaign.id}>
                ✅ <b>{campaign.benefit}</b> — {campaign.event.title}
              </li>
            ))}
            {ambassador.businessApprovedAt ? (
              <li>
                🌟 Featured recognition — {ambassador.businessName} is
                spotlighted on{" "}
                <Link href="/ambassador" className="underline">
                  the ambassador page
                </Link>
                .
              </li>
            ) : null}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-slate-500">
            Nothing yet — reach a campaign&apos;s verified-ticket target below
            to earn its benefit.
          </p>
        )}
        <p className="mt-2 text-xs text-slate-500">
          The GoDesi team will contact you to hand over earned invites.
          Benefits have no cash value. {AMBASSADOR_COMPLIANCE_REVIEW_NOTE}
        </p>
      </Card>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">My event promo links</h2>
        {ambassador.promoEvents.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500">
              No events assigned yet. The GoDesi team will add promo links for
              events in {ambassador.city} — you will get a notification.
            </p>
          </Card>
        ) : null}
        {ambassador.promoEvents.map((campaign) => {
          const s = stats.get(campaign.code)!;
          const link = `${base}/r/${campaign.code}`;
          const done = benefitEarned(campaign, s);
          return (
            <Card key={campaign.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/events/${campaign.event.slug}`}
                    className="break-words font-bold hover:underline"
                  >
                    {campaign.event.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {formatEventDate(
                      campaign.event.startsAt,
                      campaign.event.timeZone,
                    )}{" "}
                    · {campaign.event.city}
                  </p>
                </div>
                <Badge tone={campaign.active ? "green" : "slate"}>
                  {campaign.active ? "active" : "paused"}
                </Badge>
              </div>
              <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2 rounded-xl bg-emerald-50 p-2">
                <span className="min-w-0 break-all font-mono text-sm text-emerald-900">
                  {link}
                </span>
                <CopyButton value={link} label="Copy link" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                <Stat label="Clicks" value={s.clicks} />
                <Stat label="Visitors" value={s.visitors} />
                <Stat label="Bookings" value={s.bookings} />
                <Stat label="Verified tickets" value={s.verifiedSeats} />
                <Stat label="Paid tickets" value={s.paidSeats} />
              </div>
              {campaign.benefit ? (
                <div className="mt-3 text-sm">
                  <p>
                    🎁 <b>{campaign.benefit}</b>
                    {campaign.rewardTickets !== null ? (
                      <span className="text-slate-600">
                        {" "}
                        — {Math.min(s.verifiedSeats, campaign.rewardTickets)}/
                        {campaign.rewardTickets} verified tickets
                      </span>
                    ) : null}
                    {done ? (
                      <span className="ml-2 align-middle">
                        <Badge tone="green">earned</Badge>
                      </span>
                    ) : null}
                  </p>
                  {campaign.eligibility ? (
                    <p className="mt-1 text-xs text-slate-500">
                      Eligibility: {campaign.eligibility}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </Card>
          );
        })}
      </section>

      <Card id="business">
        <h2 className="text-xl font-bold">🏪 Promote my business</h2>
        <p className="mt-1 text-sm text-slate-600">
          Submit your business to be spotlighted on the ambassador page.{" "}
          {ambassador.businessName
            ? ambassador.businessApprovedAt
              ? "Status: featured."
              : "Status: waiting for review."
            : null}{" "}
          For paid reach see{" "}
          <Link href="/pricing" className="underline">
            pricing
          </Link>{" "}
          and{" "}
          <Link href="/advertise" className="underline">
            advertising
          </Link>
          .
        </p>
        <p className="mt-1 text-xs text-amber-800">
          Mortgage, real-estate settlement and insurance offers can&apos;t be
          featured through this program.
        </p>
        <div className="mt-3">
          <AmbassadorBusinessForm
            defaults={{
              businessName: ambassador.businessName ?? "",
              socialUrl: ambassador.socialUrl ?? "",
              logoUrl: ambassador.logoUrl ?? "",
              businessInfo: ambassador.businessInfo ?? "",
            }}
          />
        </div>
      </Card>
    </div>
  );
}
