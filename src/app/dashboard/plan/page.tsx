import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { formatMoney, inrPerUsd, requestCurrency } from "@/lib/currency";
import { effectivePlan, PLANS, planTermPrice } from "@/lib/plans";
import { Badge, Card, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My plan" };

export default async function MyPlanPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/plan");

  const planId = effectivePlan(user);
  const plan = PLANS[planId];
  const featured = PLANS.PREMIUM;
  const currency = requestCurrency();
  const rate = await inrPerUsd();
  const yearPrice = planTermPrice(featured, "YEAR", currency, rate);
  const monthPrice = planTermPrice(featured, "MONTH", currency, rate);
  const money = (amount: number) =>
    formatMoney(amount, currency).replace(/\.00$/, "");

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">My plan</h1>

      <Card className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">
            You are on{" "}
            <Badge tone={planId === "FREE" ? "slate" : "indigo"}>
              {plan.name}
            </Badge>
          </h2>
          {user.planExpiresAt && planId !== "FREE" ? (
            <span className="text-sm text-slate-600">
              until {user.planExpiresAt.toLocaleDateString("en-US")}
            </span>
          ) : null}
        </div>
        <ul className="grid gap-x-4 gap-y-1 text-sm text-slate-700 sm:grid-cols-2">
          {plan.features.map((feature) => (
            <li key={feature}>✓ {feature}</li>
          ))}
        </ul>
      </Card>

      {planId !== "PREMIUM" ? (
        <Card className="space-y-3 border-2 border-amber-400 bg-amber-50">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
            Recommended for you
          </p>
          <h2 className="text-xl font-black">⭐ Go Featured</h2>
          {yearPrice && monthPrice ? (
            <p className="text-lg">
              <span className="text-slate-400 line-through">
                {money(monthPrice * 12)}
              </span>{" "}
              <b>{money(yearPrice)} for 1 year</b>
              <span className="text-sm text-emerald-700">
                {" "}
                · you save {money(monthPrice * 12 - yearPrice)}
              </span>
            </p>
          ) : null}
          <ul className="grid gap-x-4 gap-y-1 text-sm text-slate-700 sm:grid-cols-2">
            {featured.features.slice(1, 7).map((feature) => (
              <li key={feature}>⭐ {feature}</li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-3">
            <LinkButton href="/upgrade?term=year">
              Upgrade to Featured
            </LinkButton>
            <Link
              href="/upgrade"
              className="text-sm font-semibold text-indigo-700 hover:underline"
            >
              See the 5-year package
            </Link>
          </div>
        </Card>
      ) : null}

      <p className="text-sm text-slate-500">
        Want to see every plan side by side?{" "}
        <Link
          href="/pricing"
          className="font-semibold text-indigo-600 hover:underline"
        >
          Compare all plans
        </Link>
      </p>
    </div>
  );
}
