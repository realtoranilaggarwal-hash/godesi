import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { effectivePlan, PLANS, PLAN_ORDER } from "@/lib/plans";
import {
  downgradeToFreeAction,
  mockSubscribeAction,
  startStripeCheckoutAction,
} from "@/app/actions/billing";
import { stripeEnabled } from "@/lib/stripe";
import { paypalEnabled } from "@/lib/paypal";
import { PayPalCheckout } from "@/components/PayPalCheckout";
import { Alert, Badge, Card } from "@/components/ui";
import { formatPlanPrice, requestCurrency } from "@/lib/currency";
import { formatUsd } from "@/lib/format";
import { WhyGodesi } from "@/components/WhyGodesi";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Membership plans",
  description: "Free, Pro and Premium plans for businesses on Godesi.",
};

const ERRORS: Record<string, string> = {
  cancelled: "Checkout was cancelled — you have not been charged.",
  stripe_unavailable:
    "Card payments are not configured yet. Please try PayPal.",
  stripe_session: "We could not start the card checkout. Please try again.",
  mock_disabled: "Please complete a real payment to upgrade.",
  coupon: "That coupon code is not valid for plan upgrades.",
};

export default async function PricingPage({
  searchParams,
}: {
  searchParams: { reason?: string; error?: string };
}) {
  const user = await getCurrentUser();
  const current = user ? effectivePlan(user) : null;

  const stripeOn = stripeEnabled();
  const paypalOn = paypalEnabled();
  const paypalClientId = process.env.PAYPAL_CLIENT_ID ?? "";
  const providersOn = stripeOn || paypalOn;
  const currency = requestCurrency();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Membership plans</h1>
        <p className="mt-1 text-slate-600">
          Start free. Upgrade when you want featured placement and buyer
          contacts.
        </p>
      </div>

      {searchParams.reason === "leads" ? (
        <Alert tone="info">
          Unlocking lead contact details requires the Premium plan.
        </Alert>
      ) : null}
      {searchParams.error ? (
        <Alert>
          {ERRORS[searchParams.error] ?? "Something went wrong with checkout."}
        </Alert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const isCurrent = current === id;
          const isFree = id === "FREE";

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
                  {isFree ? "Free" : formatPlanPrice(plan, currency)}
                  {isFree ? null : (
                    <span className="text-sm font-medium text-slate-500">
                      /month
                    </span>
                  )}
                </p>
                {!isFree && paypalOn && currency === "INR" ? (
                  <p className="text-xs text-slate-500">
                    or {formatUsd(plan.priceUsd)} via PayPal
                  </p>
                ) : null}
              </div>

              <ul className="space-y-2 text-sm text-slate-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="text-indigo-600">•</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto space-y-2">
                {!user ? (
                  <Link
                    href="/signup"
                    className="block w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Get started
                  </Link>
                ) : isCurrent ? (
                  <button
                    disabled
                    className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white opacity-50"
                  >
                    Your plan
                  </button>
                ) : isFree ? (
                  <form action={downgradeToFreeAction}>
                    <button
                      type="submit"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                    >
                      Switch to Free
                    </button>
                  </form>
                ) : (
                  <>
                    {stripeOn ? (
                      <form
                        action={startStripeCheckoutAction}
                        className="space-y-2"
                      >
                        <input type="hidden" name="plan" value={id} />
                        <input
                          name="couponCode"
                          placeholder="Coupon code (optional)"
                          aria-label="Coupon code"
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm uppercase"
                        />
                        <button
                          type="submit"
                          className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                          Pay by card — {formatPlanPrice(plan, currency)}
                        </button>
                      </form>
                    ) : null}

                    {paypalOn ? (
                      <PayPalCheckout plan={id} clientId={paypalClientId} />
                    ) : null}

                    {!providersOn ? (
                      <form action={mockSubscribeAction}>
                        <input type="hidden" name="plan" value={id} />
                        <button
                          type="submit"
                          className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                          Get {plan.name} (test mode)
                        </button>
                      </form>
                    ) : null}
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <WhyGodesi />

      <p className="text-center text-xs text-slate-500">
        {providersOn
          ? "Payments are processed securely by Stripe and PayPal. Plans run for 30 days."
          : "No payment provider is configured, so checkout runs in test mode."}
      </p>
    </div>
  );
}
