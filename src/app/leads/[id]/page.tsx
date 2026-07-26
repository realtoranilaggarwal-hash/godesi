import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canUnlockLeads } from "@/lib/plans";
import { unlockLeadAction } from "@/app/actions/leads";
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
  const unlocked =
    isOwner ||
    (premium &&
      user !== null &&
      (await db.leadUnlock.findUnique({
        where: { leadId_userId: { leadId: lead.id, userId: user.id } },
      })) !== null);

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
              <Alert tone="info">
                Contact details are available on the Premium plan.{" "}
                <Link href="/pricing" className="font-semibold underline">
                  See plans
                </Link>
              </Alert>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
