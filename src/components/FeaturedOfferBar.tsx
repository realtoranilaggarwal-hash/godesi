import Link from "next/link";
import { PLANS, planTermPrice } from "@/lib/plans";

const OFFER_CODE = "HALF5";

function dollars(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * The five-year Featured special on every page: the HALF5 price against what
 * five years of monthly payments would cost. Opens the five-year plan with the
 * code already in the box.
 */
export function FeaturedOfferBar() {
  const monthly = planTermPrice(PLANS.PREMIUM, "MONTH", "USD");
  const fiveYear = planTermPrice(PLANS.PREMIUM, "FIVE_YEAR", "USD");
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
        🔥 5 years Featured: {dollars(offer)} with {OFFER_CODE}
      </span>
      <span className="hidden sm:inline">
        🔥 Special: 5 years of Featured for just {dollars(offer)} with code{" "}
        {OFFER_CODE}
      </span>
      <span className="hidden sm:inline">
        {" "}
        — that&apos;s{" "}
        <span className="line-through opacity-80">
          {dollars(monthlyTotal)}
        </span>{" "}
        at {dollars(monthly)} a month, you save {dollars(saving)}
      </span>{" "}
      <span className="whitespace-nowrap underline">Get it →</span>
    </Link>
  );
}
