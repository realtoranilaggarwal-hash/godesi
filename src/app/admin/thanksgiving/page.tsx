import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { deskFallback } from "@/lib/adminSections";
import { Card, EmptyState } from "@/components/ui";
import { THANKSGIVING } from "@/lib/thanksgiving";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thanksgiving 2026" };

const LABELS: Record<string, string> = {
  "click:turkey": "Turkey icon clicks",
  "view:article": "Article views",
  "click:article": "Clicks to the article",
  "click:nye": "TURKEY10 / NYE ticket clicks",
  "click:marketing": "Marketing package clicks",
  "click:website": "Website offer clicks",
  "inquiry:marketing": "Marketing package inquiries",
  "inquiry:website": "Website inquiries",
};

export default async function ThanksgivingAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/thanksgiving");
  if (user.role !== "ADMIN") redirect(deskFallback(user, "Thanksgiving 2026"));

  const where = { campaign: THANKSGIVING.campaign };
  const [groups, turkey, inquiries] = await Promise.all([
    db.promoEvent.groupBy({ by: ["kind", "target"], where, _count: true }),
    db.promoEvent.count({ where: { ...where, kind: "click", source: "turkey" } }),
    db.promoEvent.findMany({
      where: { ...where, kind: "inquiry" },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);
  const counts: Record<string, number> = { "click:turkey": turkey };
  for (const group of groups) counts[`${group.kind}:${group.target}`] = group._count;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">🦃 Thanksgiving 2026</h1>
      <div className="grid gap-2 sm:grid-cols-4">
        {Object.entries(LABELS).map(([key, label]) => (
          <Card key={key}>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-2xl font-black">{counts[key] ?? 0}</p>
          </Card>
        ))}
      </div>
      <h2 className="text-lg font-bold">Inquiries</h2>
      {inquiries.length ? (
        <div className="space-y-2">
          {inquiries.map((lead) => (
            <Card key={lead.id} className="text-sm">
              <p className="font-bold">
                {lead.target === "website" ? "💻 Website" : "📣 Marketing"} · {lead.name}
                {lead.business ? ` · ${lead.business}` : ""}
              </p>
              <p>
                <a href={`tel:${lead.phone}`} className="text-indigo-700">{lead.phone}</a> ·{" "}
                <a href={`mailto:${lead.email}`} className="text-indigo-700">{lead.email}</a>
                {lead.city ? ` · ${lead.city}` : ""} · {lead.createdAt.toLocaleString("en-US", { timeZone: "America/New_York" })}
              </p>
              {lead.message ? <p className="mt-1 text-slate-600">{lead.message}</p> : null}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No inquiries yet" />
      )}
    </div>
  );
}
