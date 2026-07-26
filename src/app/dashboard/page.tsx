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

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="text-center">
      <p className="text-2xl font-black text-indigo-600">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
    </Card>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { saved?: string; posted?: string; upgraded?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/admin");

  const plan = effectivePlan(user);

  const business = await db.business.findUnique({
    where: { ownerId: user.id },
    include: { reviews: { select: { rating: true } } },
  });

  const [views, qrScans, whatsappClicks, unlocks, myLeads] = await Promise.all([
    business
      ? db.event.count({ where: { businessId: business.id, type: "PROFILE_VIEW" } })
      : 0,
    business ? db.event.count({ where: { businessId: business.id, type: "QR_SCAN" } }) : 0,
    business
      ? db.event.count({ where: { businessId: business.id, type: "WHATSAPP_CLICK" } })
      : 0,
    db.leadUnlock.count({ where: { userId: user.id } }),
    db.lead.findMany({ where: { clientId: user.id }, orderBy: { createdAt: "desc" } }),
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
        <div className="flex gap-2">
          <LinkButton href="/pricing" variant="secondary">
            Manage plan
          </LinkButton>
          <LinkButton href="/leads">Browse leads</LinkButton>
        </div>
      </div>

      {searchParams.saved ? <Alert tone="success">Profile saved.</Alert> : null}
      {searchParams.posted ? <Alert tone="success">Requirement posted.</Alert> : null}
      {searchParams.upgraded ? (
        <Alert tone="success">You are now on the {searchParams.upgraded} plan.</Alert>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Profile views" value={views} />
        <Stat label="QR scans" value={qrScans} />
        <Stat label="WhatsApp clicks" value={whatsappClicks} />
        <Stat label="Leads unlocked" value={unlocks} />
      </div>

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
              <LinkButton href="/dashboard/media" variant="secondary">
                Manage gallery
              </LinkButton>
              <LinkButton href="/dashboard/leads" variant="secondary">
                Unlocked leads
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
