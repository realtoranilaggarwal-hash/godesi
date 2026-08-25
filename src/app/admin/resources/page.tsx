import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { can, getCurrentUser, isStaff } from "@/lib/auth";
import {
  deleteResourceLinkAction,
  removeDuplicateResourceLinksAction,
  reviewResourceLinkAction,
  toggleResourceLinkAction,
} from "@/app/actions/resources";
import { duplicateLinkIds } from "@/lib/resources";
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
      include: {
        category: { select: { name: true } },
        submittedBy: { select: { email: true } },
        _count: { select: { orders: true } },
      },
    }),
    getCategoryTree(),
  ]);

  const duplicates = new Set(
    duplicateLinkIds(
      [...resourceLinks]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((link) => ({
          id: link.id,
          url: link.url,
          impressions: link.impressions,
          clicks: link.clicks,
          paid: link._count.orders > 0,
        })),
    ),
  );

  const titleCounts = new Map<string, number>();
  for (const link of resourceLinks) {
    const key = link.title.trim().toLowerCase();
    titleCounts.set(key, (titleCounts.get(key) ?? 0) + 1);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Resources</h1>
      <Card id="resources">
        <h2 className="mb-3 text-lg font-bold">
          Resources — important links ({resourceLinks.length})
        </h2>
        {duplicates.size ? (
          <form
            action={removeDuplicateResourceLinksAction}
            className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm"
          >
            <p className="font-semibold text-amber-900">
              {duplicates.size} link{duplicates.size === 1 ? " is" : "s are"}{" "}
              the same web address as another. The copy someone paid for, or the
              one with the views, is kept.
            </p>
            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-bold text-white hover:bg-amber-700"
            >
              Remove {duplicates.size} duplicate
              {duplicates.size === 1 ? "" : "s"}
            </button>
          </form>
        ) : null}

        <ResourceLinkForm
          categories={categories.map((category) => ({
            slug: category.slug,
            name: category.name,
          }))}
        />

        <ul className="mt-4 divide-y divide-slate-100 text-sm">
          {resourceLinks.map((link) => {
            const sharedTitle =
              titleCounts.get(link.title.trim().toLowerCase()) ?? 1;
            const remaining =
              link.impressionCap === null
                ? null
                : Math.max(0, link.impressionCap - link.impressions);

            return (
              <li
                key={link.id}
                className={`flex flex-wrap items-start justify-between gap-2 py-2 ${
                  duplicates.has(link.id) ? "bg-amber-50" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {link.title}{" "}
                    <span className="text-xs font-normal text-slate-400">
                      {link.kind.toLowerCase()} · {link.status.toLowerCase()}
                      {link.active ? "" : " · inactive"}
                      {duplicates.has(link.id) ? " · duplicate" : ""}
                      {sharedTitle > 1
                        ? ` · ${sharedTitle} links share this title`
                        : ""}
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
