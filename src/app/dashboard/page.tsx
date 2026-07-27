import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { effectivePlan, PLANS } from "@/lib/plans";
import { Alert, Badge, Card, EmptyState, LinkButton, Stars } from "@/components/ui";
import { QrCard } from "@/components/QrCard";
import { siteUrl } from "@/lib/format";
import { closeLeadAction } from "@/app/actions/leads";
import { emailEnabled } from "@/lib/email";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };

function Stat({
  label,
  value,
  icon,
  tone,
  hint,
}: {
  label: string;
  value: number | string;
  icon: string;
  tone: string;
  hint?: string;
}) {
  return (
    <div className={`rounded-2xl p-4 ${tone}`}>
      <p className="text-lg" aria-hidden>
        {icon}
      </p>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
        {label}
      </p>
      {hint ? <p className="mt-1 text-[11px] opacity-70">{hint}</p> : null}
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: {
    saved?: string;
    posted?: string;
    upgraded?: string;
    verified?: string;
  };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/admin");

  const plan = effectivePlan(user);

  const business = await db.business.findUnique({
    where: { ownerId: user.id },
    include: { reviews: { select: { rating: true } } },
  });

  const [views, qrScans, whatsappClicks, unlocks, myLeads, adStats] = await Promise.all([
    business
      ? db.analyticsEvent.count({ where: { businessId: business.id, type: "PROFILE_VIEW" } })
      : 0,
    business ? db.analyticsEvent.count({ where: { businessId: business.id, type: "QR_SCAN" } }) : 0,
    business
      ? db.analyticsEvent.count({ where: { businessId: business.id, type: "WHATSAPP_CLICK" } })
      : 0,
    db.leadUnlock.count({ where: { userId: user.id } }),
    db.lead.findMany({ where: { clientId: user.id }, orderBy: { createdAt: "desc" } }),
    db.banner.aggregate({
      where: { advertiserId: user.id },
      _sum: { impressions: true, clicks: true },
      _count: { _all: true },
    }),
  ]);

  const reviewCount = business?.reviews.length ?? 0;
  const rating = reviewCount
    ? business!.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Hi {user.name.split(" ")[0]}</h1>
          <p className="text-sm text-slate-600">
            Plan: <Badge tone={plan === "FREE" ? "slate" : "indigo"}>{PLANS[plan].name}</Badge>
            {user.planExpiresAt && plan !== "FREE"
              ? ` · renews ${user.planExpiresAt.toLocaleDateString("en-IN")}`
              : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton href="/pricing" variant="secondary">
            Manage plan
          </LinkButton>
          <LinkButton href="/dashboard/listings" variant="secondary">
            My listings
          </LinkButton>
          <LinkButton href="/dashboard/rewards" variant="secondary">
            Rewards
          </LinkButton>
          <LinkButton href="/leads">Browse leads</LinkButton>
        </div>
      </div>

      {searchParams.verified ? <Alert tone="success">Email verified — thanks!</Alert> : null}
      {!user.emailVerifiedAt && emailEnabled() ? (
        <Alert tone="info">
          Your email is not verified yet.{" "}
          <Link href="/verify-email" className="font-semibold underline">
            Verify {user.email}
          </Link>{" "}
          to secure your account and earn referral rewards.
        </Alert>
      ) : null}
      {searchParams.saved ? <Alert tone="success">Profile saved.</Alert> : null}
      {searchParams.posted ? <Alert tone="success">Requirement posted.</Alert> : null}
      {searchParams.upgraded ? (
        <Alert tone="success">You are now on the {searchParams.upgraded} plan.</Alert>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat
          label="Profile views"
          value={views}
          icon="👁️"
          tone="bg-indigo-50 text-indigo-700"
        />
        <Stat label="QR scans" value={qrScans} icon="📱" tone="bg-sky-50 text-sky-700" />
        <Stat
          label="Enquiries"
          value={whatsappClicks}
          icon="💬"
          tone="bg-emerald-50 text-emerald-700"
          hint="WhatsApp chats started"
        />
        <Stat
          label="Reviews"
          value={reviewCount}
          icon="⭐"
          tone="bg-amber-50 text-amber-700"
          hint={reviewCount ? `${rating.toFixed(1)} average` : "No ratings yet"}
        />
        <Stat
          label="Leads unlocked"
          value={unlocks}
          icon="🔓"
          tone="bg-fuchsia-50 text-fuchsia-700"
        />
      </div>

      {adStats._count._all ? (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Your ads</h2>
              <p className="text-sm text-slate-600">
                {(adStats._sum.impressions ?? 0).toLocaleString("en-IN")} impressions ·{" "}
                {(adStats._sum.clicks ?? 0).toLocaleString("en-IN")} clicks across{" "}
                {adStats._count._all} banner{adStats._count._all > 1 ? "s" : ""}
              </p>
            </div>
            <LinkButton href="/dashboard/ads" variant="secondary">
              Ad dashboard
            </LinkButton>
          </div>
        </Card>
      ) : null}

      {business ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold">{business.name}</h2>
                <p className="text-sm text-slate-600">
                  {business.category} · {business.city}
                </p>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                  <Stars rating={rating} />
                  <span>{reviewCount ? `${rating.toFixed(1)} (${reviewCount})` : "No reviews yet"}</span>
                </div>
              </div>
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
            </div>

            <p className="mt-3 text-sm text-slate-600">
              Public link:{" "}
              <Link href={`/b/${business.slug}`} className="font-semibold text-indigo-600">
                /b/{business.slug}
              </Link>
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <LinkButton href="/dashboard/profile" variant="secondary">
                Edit profile
              </LinkButton>
              <LinkButton href="/dashboard/me" variant="secondary">
                My personal profile
              </LinkButton>
              <LinkButton href="/dashboard/media" variant="secondary">
                Manage gallery
              </LinkButton>
              <LinkButton href="/dashboard/packages" variant="secondary">
                Packages & pricing
              </LinkButton>
              <LinkButton href="/dashboard/leads" variant="secondary">
                Unlocked leads
              </LinkButton>
              <LinkButton href="/dashboard/tickets" variant="secondary">
                My tickets
              </LinkButton>
              <LinkButton href="/advertise" variant="secondary">
                Advertise
              </LinkButton>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-bold">Your QR code</h2>
            <QrCard slug={business.slug} shareUrl={`${siteUrl()}/b/${business.slug}`} />
          </Card>
        </div>
      ) : (
        <Card>
          <EmptyState
            title="You have not created your digital card yet"
            body="It takes a minute — add your name, category, city and WhatsApp number."
          />
          <div className="mt-4 text-center">
            <LinkButton href="/dashboard/profile">Create my card</LinkButton>
          </div>
        </Card>
      )}

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Requirements you posted</h2>
          <LinkButton href="/leads/new" variant="secondary">
            Post a requirement
          </LinkButton>
        </div>
        {myLeads.length ? (
          <ul className="divide-y divide-slate-100">
            {myLeads.map((lead) => (
              <li key={lead.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{lead.title}</p>
                  <p className="text-sm text-slate-500">
                    {lead.category} · {lead.city} · {lead.status}
                  </p>
                </div>
                {lead.status === "OPEN" ? (
                  <form action={closeLeadAction}>
                    <input type="hidden" name="leadId" value={lead.id} />
                    <button
                      type="submit"
                      className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
                    >
                      Close
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">You have not posted any requirements.</p>
        )}
      </Card>
    </div>
  );
}
