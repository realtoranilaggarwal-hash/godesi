import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { deskFallback } from "@/lib/adminSections";
import { togglePartnerLeadHandled } from "@/app/actions/partnerLeads";
import { Badge, Card, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Network requests" };

export default async function PartnerLeadsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/partner-leads");
  if (user.role !== "ADMIN") redirect(deskFallback(user, "Network requests"));

  const leads = await db.partnerLead.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const open = leads.filter((lead) => !lead.handledAt).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">🏡 Network requests</h1>
        <p className="text-sm text-slate-600">
          Buy/sell agent requests sent from realestateyp.com and
          whyuserealtor.com. The visitor agreed to be contacted; pass each one
          to matching agents and mark it done. {open} open.
        </p>
      </div>
      {leads.length ? (
        <div className="space-y-2">
          {leads.map((lead) => (
            <Card
              key={lead.id}
              className={`flex flex-wrap items-start justify-between gap-3 ${lead.handledAt ? "opacity-60" : ""}`}
            >
              <div className="min-w-0 text-sm">
                <p className="font-bold">
                  {lead.category === "investor" ? "💼 Investor" : lead.category === "course" ? "📚 Course" : lead.intent === "sell" ? "🏷️ Selling" : "🏡 Buying"} ·{" "}
                  {lead.city}{" "}
                  <Badge tone={lead.handledAt ? "green" : "amber"}>
                    {lead.handledAt ? "Done" : "Open"}
                  </Badge>
                </p>
                <p>
                  {lead.name} ·{" "}
                  <a href={`tel:${lead.phone}`} className="text-indigo-700">
                    {lead.phone}
                  </a>
                  {lead.email ? (
                    <>
                      {" "}
                      ·{" "}
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-indigo-700"
                      >
                        {lead.email}
                      </a>
                    </>
                  ) : null}
                </p>
                {lead.message ? (
                  <p className="text-slate-600">{lead.message}</p>
                ) : null}
                <p className="text-xs text-slate-500">
                  {lead.site} · {lead.createdAt.toLocaleString("en-US")}
                </p>
              </div>
              <form action={togglePartnerLeadHandled}>
                <input type="hidden" name="id" value={lead.id} />
                <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
                  {lead.handledAt ? "Reopen" : "Mark done"}
                </button>
              </form>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No requests yet"
          body="They arrive here when a visitor fills in Compare agents on a network site."
        />
      )}
    </div>
  );
}
