import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, EmptyState, LinkButton } from "@/components/ui";
import { formatInr } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Unlocked leads" };

export default async function UnlockedLeadsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const unlocks = await db.leadUnlock.findMany({
    where: { userId: user.id },
    include: { lead: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Unlocked leads</h1>
        <LinkButton href="/leads" variant="secondary">
          Browse leads
        </LinkButton>
      </div>

      {unlocks.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {unlocks.map(({ lead, createdAt }) => (
            <Card key={lead.id} className="space-y-2">
              <Link href={`/leads/${lead.id}`} className="font-semibold hover:text-indigo-600">
                {lead.title}
              </Link>
              <p className="text-sm text-slate-600">
                {lead.category} · {lead.city}
                {lead.budgetMin !== null || lead.budgetMax !== null
                  ? ` · ${formatInr(lead.budgetMin ?? 0)} – ${formatInr(lead.budgetMax ?? lead.budgetMin ?? 0)}`
                  : ""}
              </p>
              <div className="rounded-xl bg-slate-50 p-3 text-sm">
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
              <p className="text-xs text-slate-400">
                Unlocked {createdAt.toLocaleDateString("en-IN")}
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No leads unlocked yet"
          body="Premium members can unlock buyer contact details from the lead marketplace."
        />
      )}
    </div>
  );
}
