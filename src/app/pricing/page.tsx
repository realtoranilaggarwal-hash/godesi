import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { effectivePlan, PLANS, PLAN_ORDER } from "@/lib/plans";
import { subscribeAction } from "@/app/actions/billing";
import { Alert, Badge, Card } from "@/components/ui";
import { formatInr } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Membership plans",
  description: "Free, Pro and Premium plans for businesses on Godesi.",
};

export default async function PricingPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  const user = await getCurrentUser();
  const current = user ? effectivePlan(user) : null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Membership plans</h1>
        <p className="mt-1 text-slate-600">
          Start free. Upgrade when you want featured placement and buyer contacts.
        </p>
      </div>

      {searchParams.reason === "leads" ? (
        <Alert tone="info">
          Unlocking lead contact details requires the Premium plan.
        </Alert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const isCurrent = current === id;
          return (
            <Card
              key={id}
              className={`flex flex-col gap-4 ${id === "PREMIUM" ? "ring-2 ring-indigo-500" : ""}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{plan.name}</h2>
                  {isCurrent ? <Badge tone="green">Current</Badge> : null}
                </div>
                <p className="mt-1 text-3xl font-black">
                  {plan.priceInr ? formatInr(plan.priceInr) : "Free"}
                  {plan.priceInr ? (
                    <span className="text-sm font-medium text-slate-500">/month</span>
                  ) : null}
                </p>
              </div>

              <ul className="space-y-2 text-sm text-slate-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="text-indigo-600">•</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {user ? (
                  <form action={subscribeAction}>
                    <input type="hidden" name="plan" value={id} />
                    <button
                      type="submit"
                      disabled={isCurrent}
                      className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isCurrent ? "Your plan" : id === "FREE" ? "Switch to Free" : `Get ${plan.name}`}
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/signup"
                    className="block w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Get started
                  </Link>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-500">
        Checkout runs in mock mode for this MVP — plans activate immediately for 30 days.
      </p>
    </div>
  );
}
