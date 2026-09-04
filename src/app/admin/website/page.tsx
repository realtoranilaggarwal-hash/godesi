import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { deskFallback } from "@/lib/adminSections";
import { loadPowerUps } from "@/lib/websiteProjects";
import { savePowerUpPricesAction } from "@/app/actions/adminWebsite";
import { ActionForm } from "@/components/gigs/GigForms";
import { Badge, Card, inputClass } from "@/components/ui";
import { websitePath } from "@/lib/websiteBuilder";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Websites" };

const TONE: Record<string, "slate" | "indigo" | "amber" | "green" | "red"> = {
  DRAFT: "slate",
  PREVIEW: "indigo",
  APPROVED: "amber",
  PAID: "green",
  LIVE: "green",
  CANCELLED: "red",
};

export default async function AdminWebsitePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/website");
  if (!isStaff(user)) redirect(deskFallback(user, "Websites"));

  const [projects, powerUps] = await Promise.all([
    db.websiteProject.findMany({
      orderBy: [{ paidAt: { sort: "desc", nulls: "last" } }, { updatedAt: "desc" }],
      take: 100,
      include: { user: { select: { name: true, email: true } } },
    }),
    loadPowerUps(),
  ]);
  const toLaunch = projects.filter((p) => p.status === "PAID");
  const funnel = projects.filter((p) => p.status !== "PAID" && p.status !== "LIVE" && p.status !== "CANCELLED");
  const live = projects.filter((p) => p.status === "LIVE");

  const row = (project: (typeof projects)[number]) => (
    <li key={project.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
      <div className="min-w-0">
        <Link href={`/admin/website/${project.id}`} className="font-semibold text-indigo-700 hover:underline">
          {project.businessName}
        </Link>
        <span className="text-slate-500">
          {" "}
          · {project.category}, {project.city}
          {project.user ? ` · ${project.user.name ?? project.user.email}` : ""}
          {project.email && !project.user ? ` · ${project.email}` : ""}
        </span>
        <div className="text-xs text-slate-500">
          {project.powerUps.length ? `Power-Ups: ${project.powerUps.join(", ")}` : "No Power-Ups"}
          {project.monthlyMinor ? ` · $${project.monthlyMinor / 100}/mo` : ""}
          {" · "}
          {project.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </div>
      </div>
      <Badge tone={TONE[project.status] ?? "slate"}>{project.status}</Badge>
    </li>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Websites</h1>
        <p className="text-sm text-slate-600">
          {toLaunch.length} paid and waiting to launch · {funnel.length} in the funnel · {live.length} live
        </p>
      </div>

      <Card>
        <h2 className="font-bold">🚀 Paid — launch these</h2>
        {toLaunch.length ? (
          <ul className="divide-y divide-slate-100">{toLaunch.map(row)}</ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500">Nothing waiting.</p>
        )}
      </Card>

      <Card>
        <h2 className="font-bold">In the funnel</h2>
        <p className="text-xs text-slate-500">
          APPROVED means they loved the preview but haven&apos;t paid — worth a call.
        </p>
        {funnel.length ? (
          <ul className="divide-y divide-slate-100">{funnel.map(row)}</ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No one in the funnel yet.</p>
        )}
      </Card>

      {live.length ? (
        <Card>
          <h2 className="font-bold">Live</h2>
          <ul className="divide-y divide-slate-100">{live.map(row)}</ul>
        </Card>
      ) : null}

      {user.role === "ADMIN" ? (
        <Card>
          <h2 className="font-bold">Power-Up prices</h2>
          <p className="mb-3 text-xs text-slate-500">
            Monthly, whole dollars. Blank goes back to the default. Untick to hide a Power-Up
            from the cart (existing subscribers keep it).
          </p>
          <ActionForm action={savePowerUpPricesAction} submitLabel="Save prices">
            <div className="grid gap-2 sm:grid-cols-2">
              {powerUps.map((powerUp) => (
                <label key={powerUp.key} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  <input type="checkbox" name={`active-${powerUp.key}`} defaultChecked={powerUp.active} className="h-4 w-4 accent-indigo-600" />
                  <span className="flex-1">
                    {powerUp.emoji} {powerUp.label}
                  </span>
                  <span className="text-slate-500">$</span>
                  <input
                    name={`price-${powerUp.key}`}
                    type="number"
                    min={0}
                    max={999}
                    step={1}
                    defaultValue={powerUp.monthlyUsd}
                    className={`${inputClass} w-20`}
                  />
                  <span className="text-slate-500">/mo</span>
                </label>
              ))}
            </div>
          </ActionForm>
        </Card>
      ) : null}

      <p className="text-xs text-slate-500">
        Customers start at <Link href="/website" className="underline">/website</Link>; a project&apos;s
        preview is at {websitePath("<id>", "/site")} (staff can open any).
      </p>
    </div>
  );
}
