import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Badge, Card, EmptyState, LinkButton } from "@/components/ui";
import { DealForm } from "@/components/forms/DealForm";
import { deleteDealAction, toggleDealAction } from "@/app/actions/deals";
import { expiryLabel, MAX_ACTIVE_DEALS } from "@/lib/deals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Deals & offers" };

export default async function DashboardDealsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/deals");

  const business = await db.business.findUnique({
    where: { ownerId: user.id },
    include: { deals: { orderBy: { createdAt: "desc" } } },
  });
  const now = new Date();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Deals &amp; offers</h1>
        <p className="text-sm text-slate-600">
          Post an offer for GoDesi visitors — it shows on your card, on{" "}
          <a
            href="/deals"
            className="font-semibold text-indigo-700 hover:underline"
          >
            godesi.com/deals
          </a>{" "}
          and on the home page. Up to {MAX_ACTIVE_DEALS} running at once, free.
        </p>
      </div>

      {business ? (
        <>
          <Card>
            <DealForm />
          </Card>

          {business.deals.length ? (
            <Card className="space-y-2">
              {business.deals.map((deal) => {
                const expired = deal.expiresAt ? deal.expiresAt < now : false;
                return (
                  <div
                    key={deal.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">{deal.title}</p>
                      <p className="text-xs text-slate-500">
                        {[
                          deal.code ? `Code ${deal.code}` : null,
                          expiryLabel(deal.expiresAt),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {expired ? (
                        <Badge tone="slate">Ended</Badge>
                      ) : deal.active ? (
                        <Badge tone="green">Live</Badge>
                      ) : (
                        <Badge tone="amber">Paused</Badge>
                      )}
                      {!expired ? (
                        <form action={toggleDealAction}>
                          <input type="hidden" name="id" value={deal.id} />
                          <button
                            type="submit"
                            className="text-xs font-semibold text-indigo-700 hover:underline"
                          >
                            {deal.active ? "Pause" : "Resume"}
                          </button>
                        </form>
                      ) : null}
                      <form action={deleteDealAction}>
                        <input type="hidden" name="id" value={deal.id} />
                        <button
                          type="submit"
                          className="text-xs font-semibold text-rose-600 hover:underline"
                        >
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </Card>
          ) : (
            <EmptyState
              title="No deals yet"
              body="Try a first-visit discount, a festival offer or a free add-on for GoDesi members."
            />
          )}
        </>
      ) : (
        <Card className="space-y-3">
          <p className="text-sm text-slate-600">
            Create your business profile first, then you can post deals.
          </p>
          <LinkButton href="/dashboard/profile">
            Create business profile
          </LinkButton>
        </Card>
      )}
    </div>
  );
}
