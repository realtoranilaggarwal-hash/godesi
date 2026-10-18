import Link from "next/link";
import { PLANS, planTermPrice } from "@/lib/plans";
import { formatMoney, inrPerUsd, requestCurrency } from "@/lib/currency";

const OFFER_CODE = "HALF5";

/**
 * The five-year Featured special on every page: the HALF5 price against what
 * five years of monthly payments would cost. Opens the five-year plan with the
 * code already in the box.
 */
export async function FeaturedOfferBar() {
  const currency = requestCurrency();
  const rate = await inrPerUsd();
  const monthly = planTermPrice(PLANS.PREMIUM, "MONTH", currency, rate);
  const fiveYear = planTermPrice(PLANS.PREMIUM, "FIVE_YEAR", currency, rate);
  const money = (value: number) =>
    formatMoney(Math.round(value), currency).replace(/\.00$/, "");
  if (monthly === null || fiveYear === null) return null;

  const offer = fiveYear / 2;
  const monthlyTotal = monthly * 60;
  const saving = monthlyTotal - offer;

  return (
    <Link
      href={`/pricing?term=FIVE_YEAR&coupon=${OFFER_CODE}#plan-PREMIUM`}
      className="block bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-4 py-1.5 text-center text-xs font-semibold text-white hover:brightness-110 sm:text-sm"
    >
      <span className="sm:hidden">
        🔥 5 years Featured: {money(offer)} with {OFFER_CODE}
      </span>
      <span className="hidden sm:inline">
        🔥 Special: 5 years of Featured for just {money(offer)} with code{" "}
        {OFFER_CODE}
      </span>
      <span className="hidden sm:inline">
        {" "}
        — that&apos;s{" "}
        <span className="line-through opacity-80">
          {money(monthlyTotal)}
        </span>{" "}
        at {money(monthly)} a month, you save {money(saving)}
      </span>{" "}
      <span className="whitespace-nowrap underline">Get it →</span>
    </Link>
  );
}
