import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  requestCurrency,
  formatPlanPrice,
  type Currency,
} from "@/lib/currency";
import { PLANS } from "@/lib/plans";
import {
  bundleListPrice,
  bundlePrice,
  bundleSaving,
  formatBundleMoney,
} from "@/lib/bundles";
import { UpgradeCart } from "@/components/UpgradeCart";
import { Alert, Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Everything included — one price",
  description:
    "Build your Godesi package: Premium membership, featured listing, banner advertising and unlimited enquiries, with the savings shown as you go.",
};

const ERRORS: Record<string, string> = {
  coupon: "That coupon code is not valid for this package.",
  cancelled: "Payment cancelled — nothing has been charged.",
  stripe_unavailable: "Card payments are not available right now.",
  stripe_session: "We could not start the payment. Please try again.",
};

/** The newest live package code with uses left, shown as the flash offer. */
async function flashOffer(currency: Currency) {
  const coupon = await db.coupon.findFirst({
    where: {
      scope: "BUNDLE",
      active: true,
      publicOffer: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
    select: {
      code: true,
      maxRedemptions: true,
      timesRedeemed: true,
      discountKind: true,
      amount: true,
      currency: true,
      bonusMonths: true,
    },
  });
  const none = { code: null, left: null, percent: 0, fixed: 0, bonusMonths: 0 };
  if (!coupon) return none;
  const left =
    coupon.maxRedemptions === null
      ? null
      : coupon.maxRedemptions - coupon.timesRedeemed;
  if (left !== null && left <= 0) return none;
  return {
    code: coupon.code,
    left,
    percent: coupon.discountKind === "PERCENT" ? coupon.amount : 0,
    fixed:
      coupon.discountKind === "FIXED" && coupon.currency === currency
        ? coupon.amount
        : 0,
    bonusMonths: coupon.bonusMonths,
  };
}

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: { error?: string; posted?: string };
}) {
  const user = await getCurrentUser();
  const currency = requestCurrency();
  const saving = bundleSaving(currency);
  const flash = await flashOffer(currency);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
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
          Everything you would buy separately, in one price
        </h2>
        <p className="mt-2 text-sm text-white/90">
          Premium membership, featured listing, your own banner on the site and
          unlimited enquiries —{" "}
          {formatBundleMoney(bundlePrice(currency), currency)} for a year
          instead of {formatBundleMoney(bundleListPrice(currency), currency)}.
          You save {formatBundleMoney(saving.amount, currency)} (
          {saving.percent}%).
        </p>
      </div>

      <UpgradeCart
        currency={currency}
        signedIn={Boolean(user)}
        flashCode={flash.code}
        flashLeft={flash.left}
        flashPercent={flash.percent}
        flashFixed={flash.fixed}
        flashBonusMonths={flash.bonusMonths}
      />

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
