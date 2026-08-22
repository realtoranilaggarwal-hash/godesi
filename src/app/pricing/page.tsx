import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import {
  effectivePlan,
  FOUNDING_OFFER_ENDS_LABEL,
  PLANS,
  PLAN_ORDER,
  PLAN_TERMS,
  planTermPrice,
  planTerms,
  type TermId,
} from "@/lib/plans";
import {
  downgradeToFreeAction,
  mockSubscribeAction,
  startStripeCheckoutAction,
} from "@/app/actions/billing";
import { stripeEnabled } from "@/lib/stripe";
import { paypalEnabled } from "@/lib/paypal";
import { upiEnabled, upiVpa } from "@/lib/upi";
import { startUpiPaymentAction } from "@/app/actions/upi";
import { PayPalCheckout } from "@/components/PayPalCheckout";
import { Alert, Badge, Card } from "@/components/ui";
import { formatMoney, requestCurrency } from "@/lib/currency";
import { formatUsd } from "@/lib/format";
import { WhyGodesi } from "@/components/WhyGodesi";
import {
  bundleListPrice,
  bundlePrice,
  bundleSaving,
  formatBundleMoney,
} from "@/lib/bundles";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Membership plans and pricing",
  description:
    "Compare the free, Pro and Featured plans for businesses on Godesi: digital card and QR code free forever, gold Featured placement, banner ads and unlimited lead unlocks.",
};

const ERRORS: Record<string, string> = {
  cancelled: "Checkout was cancelled — you have not been charged.",
  stripe_unavailable:
    "Card payments are not configured yet. Please try PayPal.",
  stripe_session: "We could not start the card checkout. Please try again.",
  mock_disabled: "Please complete a real payment to upgrade.",
  upi_unavailable: "UPI payments are not configured yet.",
  coupon: "That coupon code is not valid for plan upgrades.",
  term: "That membership length is not on sale — pick another one.",
};

const TERM_TABS: { id: TermId; label: string }[] = [
  { id: "MONTH", label: "Monthly" },
  { id: "YEAR", label: "Yearly" },
  { id: "FIVE_YEAR", label: "5 years — founding price" },
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: { reason?: string; error?: string; term?: string };
}) {
  const user = await getCurrentUser();
  const current = user ? effectivePlan(user) : null;

  const stripeOn = stripeEnabled();
  const paypalOn = paypalEnabled();
  const paypalClientId = process.env.PAYPAL_CLIENT_ID ?? "";
  const upiOn = upiEnabled();
  const providersOn = stripeOn || paypalOn || upiOn;
  const currency = requestCurrency();
  const wanted: TermId = TERM_TABS.some((tab) => tab.id === searchParams.term)
    ? (searchParams.term as TermId)
    : "YEAR";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Membership plans</h1>
        <p className="mt-1 text-slate-600">
          Start free. Upgrade when you want the gold Featured placement and buyer
          contacts.
        </p>
        <div className="mt-4 inline-flex flex-wrap justify-center gap-1 rounded-2xl bg-slate-100 p-1">
          {TERM_TABS.map((tab) => (
            <Link
              key={tab.id}
              href={`/pricing?term=${tab.id}`}
              className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${
                wanted === tab.id
                  ? "bg-white text-indigo-700 shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        {wanted === "FIVE_YEAR" ? (
          <p className="mt-2 text-sm font-semibold text-amber-700">
            Founding price: pay one year, stay five. Ends{" "}
            {FOUNDING_OFFER_ENDS_LABEL}.
          </p>
        ) : null}
      </div>

      <Link
        href="/upgrade"
        className="block rounded-3xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-orange-500 p-5 text-white hover:opacity-95"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-white/80">
          Best value
        </p>
        <p className="text-2xl font-black">
          Complete package — Featured membership + Elite interview, 5 years
        </p>
        <p className="mt-1 text-sm text-white/90">
          Both for five years for{" "}
          {formatBundleMoney(bundlePrice(currency), currency)} instead of{" "}
          {formatBundleMoney(bundleListPrice(currency), currency)} — save{" "}
          {bundleSaving(currency).percent}% →
        </p>
      </Link>

      {searchParams.reason === "leads" ? (
        <Alert tone="info">
          Unlocking lead contact details requires the Featured plan.
        </Alert>
      ) : null}
      {searchParams.reason === "featured" ? (
        <Alert tone="info">
          The ⭐ featured specialisation badge comes with Pro and Featured — pick
          a plan below and the picker unlocks on your card.
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
          const terms = planTerms(plan);
          const term = terms.includes(wanted) ? wanted : terms[terms.length - 1];
          const price = term ? planTermPrice(plan, term, currency) : null;
          const priceInr = term ? planTermPrice(plan, term, "INR") : null;
          const priceUsd = term ? planTermPrice(plan, term, "USD") : null;
          const label = price === null ? "" : formatMoney(price, currency);

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
                  {isFree ? "Free" : label}
                  {isFree || !term ? null : (
                    <span className="text-sm font-medium text-slate-500">
                      {" "}
                      for {PLAN_TERMS[term].label}
                    </span>
                  )}
                </p>
                {!isFree && term === "FIVE_YEAR" ? (
                  <p className="text-xs font-semibold text-amber-700">
                    One year&apos;s price for five years — until{" "}
                    {FOUNDING_OFFER_ENDS_LABEL}
                  </p>
                ) : null}
                {!isFree &&
                paypalOn &&
                currency === "INR" &&
                priceUsd !== null ? (
                  <p className="text-xs text-slate-500">
                    or {formatUsd(priceUsd)} via PayPal
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
                        <input type="hidden" name="term" value={term} />
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
                          Pay by card — {label}
                        </button>
                      </form>
                    ) : null}

                    {paypalOn ? (
                      <PayPalCheckout
                        plan={id}
                        term={term}
                        clientId={paypalClientId}
                      />
                    ) : null}

                    {upiOn ? (
                      <form
                        action={startUpiPaymentAction}
                        className="space-y-2"
                      >
                        <input type="hidden" name="plan" value={id} />
                        <input type="hidden" name="term" value={term} />
                        {stripeOn ? null : (
                          <input
                            name="couponCode"
                            placeholder="Coupon code (optional)"
                            aria-label="Coupon code"
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm uppercase"
                          />
                        )}
                        <button
                          type="submit"
                          className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          Pay by UPI —{" "}
                          {priceInr === null ? "" : formatMoney(priceInr, "INR")}
                        </button>
                        <p className="text-center text-xs text-slate-500">
                          PhonePe · Google Pay · Paytm · any bank app
                        </p>
                      </form>
                    ) : null}

                    {!providersOn ? (
                      <form action={mockSubscribeAction}>
                        <input type="hidden" name="plan" value={id} />
                        <input type="hidden" name="term" value={term} />
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

      <Card className="bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-black text-slate-900">
              Don&apos;t want to pay? Earn it instead 🎁
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-700">
              Share Godesi and collect points — every signup, profile, listing
              and upgrade from your referral link adds up. Spend the points on a
              month of Pro (400), a featured listing for 30 days (300), homepage
              event promotion (250) or a 300 × 250 banner (500). No card needed.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            <Link
              href="/rewards"
              className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-2 text-white hover:opacity-90"
            >
              How refer &amp; earn works
            </Link>
            <Link
              href={user ? "/dashboard/rewards" : "/signup"}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50"
            >
              {user ? "Get my referral link" : "Join free"}
            </Link>
          </div>
        </div>
      </Card>

      <WhyGodesi />

      <p className="text-center text-xs text-slate-500">
        {providersOn
          ? "Card and PayPal payments are processed securely by our providers. Every membership runs for the length you pick above."
          : "No payment provider is configured, so checkout runs in test mode."}
        {upiOn
          ? ` UPI payments go to ${upiVpa()} and are confirmed by our team, so activation is not instant.`
          : ""}
      </p>
    </div>
  );
}
