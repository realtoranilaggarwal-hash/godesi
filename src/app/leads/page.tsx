import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canUnlockLeads } from "@/lib/plans";
import { unlockLeadAction } from "@/app/actions/leads";
import { Alert, Badge, Card, EmptyState, LinkButton, inputClass } from "@/components/ui";
import { formatInr } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Lead marketplace",
  description: "Live buyer requirements. Premium members unlock contact details instantly.",
};

function budgetLabel(min: number | null, max: number | null) {
  if (min === null && max === null) return "Budget not specified";
  if (min !== null && max !== null) return `${formatInr(min)} – ${formatInr(max)}`;
  return formatInr((min ?? max) as number);
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { q?: string; city?: string; category?: string };
}) {
  const user = await getCurrentUser();
  const premium = user ? canUnlockLeads(user) : false;

  const leads = await db.lead.findMany({
    where: {
      status: "OPEN",
      ...(searchParams.city
        ? { city: { contains: searchParams.city, mode: "insensitive" } }
        : {}),
      ...(searchParams.category
        ? { category: { contains: searchParams.category, mode: "insensitive" } }
        : {}),
      ...(searchParams.q
        ? {
            OR: [
              { title: { contains: searchParams.q, mode: "insensitive" } },
              { description: { contains: searchParams.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { unlocks: { where: { userId: user?.id ?? "" } } },
    take: 60,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Lead marketplace</h1>
          <p className="text-sm text-slate-600">
            Buyer requirements posted by clients. Unlock contacts with Premium.
          </p>
        </div>
        <LinkButton href="/leads/new">Post a requirement</LinkButton>
      </div>

      {user && !premium ? (
        <Alert tone="info">
          Contact details are hidden on your current plan.{" "}
          <Link href="/pricing" className="font-semibold underline">
            Upgrade to Premium
          </Link>{" "}
          to unlock leads.
        </Alert>
      ) : null}
      {!user ? (
        <Alert tone="info">
          <Link href="/login" className="font-semibold underline">
            Sign in
          </Link>{" "}
          as a business to unlock lead contact details.
        </Alert>
      ) : null}

      <Card>
        <form className="grid gap-3 sm:grid-cols-4">
          <input
            name="q"
            defaultValue={searchParams.q ?? ""}
            placeholder="Search requirements"
            className={`${inputClass} sm:col-span-2`}
            aria-label="Search leads"
          />
          <input
            name="city"
            defaultValue={searchParams.city ?? ""}
            placeholder="City"
            className={inputClass}
            aria-label="City"
          />
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Filter
          </button>
        </form>
      </Card>

      {leads.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {leads.map((lead) => {
            const unlocked = premium && lead.unlocks.length > 0;
            return (
              <Card key={lead.id} className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="font-semibold hover:text-indigo-600"
                  >
                    {lead.title}
                  </Link>
                  <Badge tone="slate">{lead.category}</Badge>
                </div>
                <p className="text-sm text-slate-500">
                  {lead.city} · {budgetLabel(lead.budgetMin, lead.budgetMax)}
                </p>
                <p className="line-clamp-3 text-sm text-slate-700">{lead.description}</p>

                {unlocked ? (
                  <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
                    <p className="font-medium">{lead.contactName}</p>
                    <p>{lead.contactPhone}</p>
                    {lead.contactEmail ? <p>{lead.contactEmail}</p> : null}
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    <p className="blur-sm select-none">+91 9XXXX XXXXX</p>
                    <p className="mt-1 text-xs">Contact details locked</p>
                  </div>
                )}

                <div className="mt-auto pt-2">
                  {unlocked ? (
                    <Link
                      href={`/leads/${lead.id}`}
                      className="text-sm font-semibold text-indigo-600"
                    >
                      View full requirement →
                    </Link>
                  ) : user ? (
                    <form action={unlockLeadAction}>
                      <input type="hidden" name="leadId" value={lead.id} />
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                      >
                        {premium ? "Unlock contact" : "Unlock with Premium"}
                      </button>
                    </form>
                  ) : (
                    <LinkButton href="/login" className="w-full">
                      Sign in to unlock
                    </LinkButton>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No open requirements right now" body="Check back soon." />
      )}
    </div>
  );
}
