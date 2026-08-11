import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canUnlockLeads } from "@/lib/plans";
import {
  unlockLeadAction,
  unlockLeadWithPointsAction,
} from "@/app/actions/leads";
import { UNLOCK_LEAD_POINTS, wallet } from "@/lib/rewards";
import { Alert, Badge, Card, LinkButton } from "@/components/ui";
import { formatInr } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Requirement" };

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const [lead, user] = await Promise.all([
    db.lead.findUnique({ where: { id: params.id } }),
    getCurrentUser(),
  ]);
  if (!lead) notFound();

  const isOwner = user?.id === lead.clientId;
  const premium = user ? canUnlockLeads(user) : false;
  const paidWithPoints =
    user !== null &&
    (await db.leadUnlock.findUnique({
      where: { leadId_userId: { leadId: lead.id, userId: user.id } },
    })) !== null;
  const unlocked = isOwner || paidWithPoints || (premium && paidWithPoints);
  const points = user ? (await wallet(user.id)).balance : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/leads" className="text-sm font-semibold text-indigo-600">
        ← All requirements
      </Link>

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">{lead.title}</h1>
          <Badge tone={lead.status === "OPEN" ? "green" : "slate"}>{lead.status}</Badge>
        </div>
        <p className="text-sm text-slate-500">
          {lead.category} · {lead.city} · posted {lead.createdAt.toLocaleDateString("en-IN")}
        </p>
        {lead.budgetMin !== null || lead.budgetMax !== null ? (
          <p className="text-sm font-medium">
            Budget: {formatInr(lead.budgetMin ?? lead.budgetMax ?? 0)}
            {lead.budgetMin !== null && lead.budgetMax !== null
              ? ` – ${formatInr(lead.budgetMax)}`
              : ""}
          </p>
        ) : null}
        <p className="whitespace-pre-line text-slate-700">{lead.description}</p>

        {lead.serviceOptions.length ? (
          <div>
            <h2 className="text-sm font-bold text-slate-800">Looking for</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {lead.serviceOptions.map((option) => (
                <span
                  key={option}
                  className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
                >
                  {option}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-bold">Contact details</h2>
        {unlocked ? (
          <div className="space-y-1 text-sm">
            <p className="font-medium">{lead.contactName}</p>
            <p>
              <a href={`tel:${lead.contactPhone}`} className="text-indigo-600">
                {lead.contactPhone}
              </a>
            </p>
            {lead.contactEmail ? (
              <p>
                <a href={`mailto:${lead.contactEmail}`} className="text-indigo-600">
                  {lead.contactEmail}
                </a>
              </p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="select-none text-sm text-slate-500 blur-sm">
              Ramesh Kumar · +91 9XXXX XXXXX
            </p>
            {!user ? (
              <LinkButton href="/login">Sign in to unlock</LinkButton>
            ) : premium ? (
              <form action={unlockLeadAction}>
                <input type="hidden" name="leadId" value={lead.id} />
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Unlock contact details
                </button>
              </form>
            ) : (
              <div className="space-y-2">
                <Alert tone="info">
                  Contact details come with the Premium plan.{" "}
                  <Link href="/pricing" className="font-semibold underline">
                    See plans
                  </Link>
                </Alert>
                {points >= UNLOCK_LEAD_POINTS ? (
                  <form action={unlockLeadWithPointsAction}>
                    <input type="hidden" name="leadId" value={lead.id} />
                    <button
                      type="submit"
                      className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Unlock with {UNLOCK_LEAD_POINTS} points ({points}{" "}
                      available)
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-slate-500">
                    Or spend {UNLOCK_LEAD_POINTS} Godesi points — you have{" "}
                    {points}.{" "}
                    <Link
                      href="/dashboard/rewards"
                      className="font-semibold underline"
                    >
                      Earn points →
                    </Link>
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
