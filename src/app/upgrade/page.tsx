import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  requestCurrency,
  formatPlanPrice,
  inrPerUsd,
  type Currency,
} from "@/lib/currency";
import { PLANS, planTermPrice } from "@/lib/plans";
import {
  bundleListPrice,
  bundlePrice,
  bundleSaving,
  formatBundleMoney,
} from "@/lib/bundles";
import { wallCreditMinor } from "@/lib/adOrders";
import { formatMinor } from "@/lib/format";
import { UpgradeCart } from "@/components/UpgradeCart";
import { Alert, Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Everything included — one price",
  description:
    "Build your Godesi package: Featured membership and GoDesi Elite for five years, banner advertising and unlimited enquiries, with the savings shown as you go.",
};

const ERRORS: Record<string, string> = {
  coupon: "That coupon code is not valid for this package.",
  cancelled: "Payment cancelled — nothing has been charged.",
  stripe_unavailable: "Card payments are not available right now.",
  stripe_session: "We could not start the payment. Please try again.",
};

/** The newest live package code with uses left, shown as the flash offer. */
async function flashOffer(currency: Currency, percentOnly = false) {
  const coupon = await db.coupon.findFirst({
    where: {
      scope: "BUNDLE",
      active: true,
      publicOffer: true,
      ...(percentOnly ? { discountKind: "PERCENT" as const } : {}),
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
  searchParams: { error?: string; posted?: string; term?: string; offer?: string };
}) {
  const user = await getCurrentUser();
  const currency = requestCurrency();
  const creditMinor = user ? await wallCreditMinor(user.id, currency) : 0;
  // ₹85 or $1 per pixel — matches PIXEL_PRICE_* in actions/ads.ts.
  const creditPixels = Math.floor(
    creditMinor / (currency === "INR" ? 8500 : 100),
  );
  const creditBricks = Math.floor(creditPixels / 4);
  const rate = await inrPerUsd();
  const saving = bundleSaving(currency);
  const flash = await flashOffer(currency, searchParams.offer === "today");
  const yearPrice = planTermPrice(PLANS.PREMIUM, "YEAR", currency, rate) ?? 0;
  const yearListPrice =
    (planTermPrice(PLANS.PREMIUM, "MONTH", currency, rate) ?? 0) * 12;

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
          Featured membership and a GoDesi Elite interview, both held for five
          years, with enquiry contacts unlocked —{" "}
          {formatBundleMoney(bundlePrice(currency), currency)} instead of{" "}
          {formatBundleMoney(bundleListPrice(currency), currency)} bought
          separately.
          You save {formatBundleMoney(saving.amount, currency)} (
          {saving.percent}%).
        </p>
      </div>

      {/* Ad spend converts to lifetime wall bricks — surface the balance so
        * the credit is obvious instead of a hidden checkout discount. */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <h3 className="text-lg font-bold">
          🧱 Wall of Fame — bricks that stay for life
        </h3>
        {user && creditMinor > 0 ? (
          <p className="mt-1 text-sm text-amber-900">
            You&apos;ve earned{" "}
            <span className="font-black">
              {formatMinor(creditMinor, currency)} of wall credit
            </span>
            {creditPixels > 0
              ? ` = ${creditPixels} pixels (${creditBricks} free bricks)`
              : " — it covers part of a brick"}
            . Pick your spot on the wall — book just your earned bricks or
            stretch bigger and pay the difference.
          </p>
        ) : (
          <p className="mt-1 text-sm text-amber-900">
            Every dollar you spend on GoDesi ads earns the same in wall
            bricks — <span className="font-black">$4 gets you one desi brick
            for life</span>. Book a block once and it stays on the wall
            forever; pick only your earned bricks or stretch to as much as
            you want to pay.
          </p>
        )}
        <Link
          href="/walloffame"
          className="mt-3 inline-block rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 px-4 py-2 text-sm font-black text-white shadow hover:opacity-90"
        >
          🧱 Pick my bricks →
        </Link>
      </Card>

      <UpgradeCart
        currency={currency}
        signedIn={Boolean(user)}
        flashCode={flash.code}
        flashLeft={flash.left}
        flashPercent={flash.percent}
        flashFixed={flash.fixed}
        flashBonusMonths={flash.bonusMonths}
        yearPrice={yearPrice}
        yearListPrice={yearListPrice}
        defaultTerm={searchParams.term === "year" ? "YEAR" : "FIVE_YEAR"}
        autoLock={searchParams.offer === "today"}
      />

      <Card>
        <h3 className="mb-2 text-lg font-bold">Or buy one thing at a time</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/pricing" className="font-semibold text-indigo-600">
              Membership only
            </Link>{" "}
            — Pro {formatPlanPrice(PLANS.PRO, currency, rate)} or Featured{" "}
            {formatPlanPrice(PLANS.PREMIUM, currency, rate)} a month, or a year and
            five-year terms
          </li>
          <li>
            <Link href="/walloffame" className="font-semibold text-indigo-600">
              Wall of Fame only
            </Link>{" "}
            — $4 a brick on the million-pixel wall; one payment keeps the
            spot for life, and ad spend converts to free bricks
          </li>
          <li>
            <Link href="/advertise" className="font-semibold text-indigo-600">
              Banner advertising only
            </Link>{" "}
            — pick a placement and the number of months; each one has a{" "}
            <Link
              href="/advertise#placements"
              className="font-semibold text-indigo-600"
            >
              &ldquo;see where this shows&rdquo;
            </Link>{" "}
            page with a map of the page, and every spot rotates, so none is ever
            sold out
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
