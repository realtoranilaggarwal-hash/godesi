import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { requestCurrency } from "@/lib/currency";
import {
  BUNDLE_LINES,
  BUNDLE_MONTHS,
  bundleListPrice,
  bundlePrice,
  bundleSaving,
  formatBundleMoney,
} from "@/lib/bundles";
import { startBundleCheckoutAction } from "@/app/actions/billing";
import { PLANS } from "@/lib/plans";
import { formatPlanPrice } from "@/lib/currency";
import { Alert, Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Everything included — one price",
  description:
    "Featured listing, banner advertising, unlimited enquiries and Premium membership in one yearly Godesi package.",
};

const ERRORS: Record<string, string> = {
  coupon: "That coupon code is not valid for this package.",
  cancelled: "Payment cancelled — nothing has been charged.",
  stripe_unavailable: "Card payments are not available right now.",
  stripe_session: "We could not start the payment. Please try again.",
};

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: { error?: string; posted?: string };
}) {
  const user = await getCurrentUser();
  const currency = requestCurrency();
  const list = bundleListPrice(currency);
  const price = bundlePrice(currency);
  const saving = bundleSaving(currency);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {searchParams.posted ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <h1 className="text-xl font-black text-emerald-900">
            ✅ Your business is saved and live on Godesi
          </h1>
          <p className="mt-1 text-sm text-emerald-800">
            Thank you for posting. People can find you in search, in your city
            and in your category right now — and you can share your card on
            WhatsApp.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/dashboard" className="text-emerald-900 underline">
              See my listing
            </Link>
            <Link
              href="/dashboard/media"
              className="text-emerald-900 underline"
            >
              Add photos
            </Link>
          </div>
        </Card>
      ) : null}

      {searchParams.error ? (
        <Alert>{ERRORS[searchParams.error] ?? "Something went wrong."}</Alert>
      ) : null}

      <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-orange-500 p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-white/80">
          Godesi complete package
        </p>
        <h2 className="mt-1 text-3xl font-black">
          Do you want to upgrade everything at once?
        </h2>
        <p className="mt-2 text-sm text-white/90">
          Featured listing, your own banner on the site, unlimited enquiries
          with contact details unlocked, and Premium membership — one price for
          a whole year instead of paying for each one separately.
        </p>
      </div>

      <Card>
        <h3 className="mb-3 text-lg font-bold">What is in the package</h3>
        <ul className="divide-y divide-slate-100 text-sm">
          {BUNDLE_LINES.map((line) => {
            const amount = currency === "INR" ? line.inr : line.usd;
            return (
              <li
                key={line.label}
                className="flex flex-wrap items-start justify-between gap-2 py-2"
              >
                <div className="min-w-0">
                  <p className="font-semibold">✔ {line.label}</p>
                  <p className="text-xs text-slate-500">{line.blurb}</p>
                </div>
                <span className="whitespace-nowrap text-sm text-slate-500">
                  {amount > 0 ? (
                    <span className="line-through">
                      {formatBundleMoney(amount, currency)}
                    </span>
                  ) : (
                    "included"
                  )}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 space-y-1 rounded-2xl bg-slate-50 p-4 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Bought separately for a year</span>
            <span className="line-through">
              {formatBundleMoney(list, currency)}
            </span>
          </div>
          <div className="flex justify-between text-lg font-black text-slate-900">
            <span>Package price</span>
            <span>{formatBundleMoney(price, currency)}</span>
          </div>
          <div className="flex justify-between font-bold text-emerald-700">
            <span>You save</span>
            <span>
              {formatBundleMoney(saving.amount, currency)} ({saving.percent}%)
            </span>
          </div>
          <p className="pt-1 text-xs text-slate-500">
            {BUNDLE_MONTHS} months from the day you pay. One payment, no
            auto-renewal.
          </p>
        </div>

        {user ? (
          <form action={startBundleCheckoutAction} className="mt-4 space-y-2">
            <label className="block text-sm font-semibold" htmlFor="couponCode">
              Have a code from our team?
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                id="couponCode"
                name="couponCode"
                placeholder="Enter coupon code"
                className="min-w-[180px] flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm uppercase"
              />
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700"
              >
                Upgrade now — {formatBundleMoney(price, currency)}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Some codes cut the price, some add extra years — the total is
              shown on the payment page before you pay.
            </p>
          </form>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/signup?next=/upgrade"
              className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700"
            >
              Sign up free to upgrade
            </Link>
            <Link
              href="/login?next=/upgrade"
              className="rounded-xl border border-slate-300 px-5 py-2 font-bold hover:bg-slate-50"
            >
              I already have an account
            </Link>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-2 text-lg font-bold">Or buy one thing at a time</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/pricing" className="font-semibold text-indigo-600">
              Membership only
            </Link>{" "}
            — Pro {formatPlanPrice(PLANS.PRO, currency)} or Premium{" "}
            {formatPlanPrice(PLANS.PREMIUM, currency)} a month
          </li>
          <li>
            <Link href="/advertise" className="font-semibold text-indigo-600">
              Banner advertising only
            </Link>{" "}
            — pick a placement and the number of months
          </li>
          <li>
            <Link
              href="/resources/new"
              className="font-semibold text-indigo-600"
            >
              Text link only
            </Link>{" "}
            — a link in the resources rail, priced per 1,000 views
          </li>
          <li>
            <Link
              href="/desi-elite/apply"
              className="font-semibold text-indigo-600"
            >
              GoDesi Elite only
            </Link>{" "}
            — recognition listing and awards
          </li>
        </ul>
      </Card>
    </div>
  );
}
