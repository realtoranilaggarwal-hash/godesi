import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { can, getCurrentUser, isStaff } from "@/lib/auth";
import {
  deleteResourceLinkAction,
  reviewResourceLinkAction,
  toggleResourceLinkAction,
} from "@/app/actions/resources";
import { ResourceLinkForm } from "@/components/forms/ResourceLinkForm";
import { getCategoryTree } from "@/lib/directory";
import { Card } from "@/components/ui";
import { deskFallback } from "@/lib/adminSections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Resources" };

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/resources");
  if (!isStaff(user)) redirect("/dashboard");
  if (!can(user, "resources")) redirect(deskFallback(user, "Resources"));

  const [resourceLinks, categories] = await Promise.all([
    db.resourceLink.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 100,
      include: {
        category: { select: { name: true } },
        submittedBy: { select: { email: true } },
      },
    }),
    getCategoryTree(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Resources</h1>
      <Card id="resources">
        <h2 className="mb-3 text-lg font-bold">
          Resources — important links ({resourceLinks.length})
        </h2>
        <ResourceLinkForm
          categories={categories.map((category) => ({
            slug: category.slug,
            name: category.name,
          }))}
        />

        <ul className="mt-4 divide-y divide-slate-100 text-sm">
          {resourceLinks.map((link) => {
            const remaining =
              link.impressionCap === null
                ? null
                : Math.max(0, link.impressionCap - link.impressions);

            return (
              <li
                key={link.id}
                className="flex flex-wrap items-start justify-between gap-2 py-2"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {link.title}{" "}
                    <span className="text-xs font-normal text-slate-400">
                      {link.kind.toLowerCase()} · {link.status.toLowerCase()}
                      {link.active ? "" : " · inactive"}
                    </span>
                  </p>
                  <p className="break-all text-xs text-slate-400">{link.url}</p>
                  <p className="text-xs text-slate-500">
                    {link.category?.name ?? "All categories"}
                    {link.tags.length
                      ? ` · ${link.tags.join(", ")}`
                      : ""} · {link.impressions.toLocaleString()} views ·{" "}
                    {link.clicks.toLocaleString()} clicks
                    {remaining === null
                      ? " · unlimited"
                      : ` · ${remaining.toLocaleString()} views left`}
                    {link.submittedBy ? ` · ${link.submittedBy.email}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {link.status === "PENDING"
                    ? (["approve", "reject"] as const).map((decision) => (
                        <form key={decision} action={reviewResourceLinkAction}>
                          <input type="hidden" name="id" value={link.id} />
                          <input
                            type="hidden"
                            name="decision"
                            value={decision}
                          />
                          <button
                            type="submit"
                            className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                          >
                            {decision}
                          </button>
                        </form>
                      ))
                    : null}
                  <form action={toggleResourceLinkAction}>
                    <input type="hidden" name="id" value={link.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                    >
                      {link.active ? "deactivate" : "activate"}
                    </button>
                  </form>
                  <form action={deleteResourceLinkAction}>
                    <input type="hidden" name="id" value={link.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                    >
                      delete
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
          {resourceLinks.length === 0 ? (
            <li className="py-2 text-slate-500">No links yet.</li>
          ) : null}
        </ul>
      </Card>
    </div>
  );
}
