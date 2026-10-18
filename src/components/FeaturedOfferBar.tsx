import Link from "next/link";
import { PLANS, planTermPrice } from "@/lib/plans";
import { formatMoney, inrPerUsd, requestCurrency } from "@/lib/currency";
import { monthlyOffer } from "@/lib/monthlyOffer";
import { OfferCountdown } from "@/components/OfferCountdown";

/**
 * The five-year Featured special on every page: this month's half-price code
 * against what five years of monthly payments would cost, with the time left
 * before the code stops working. Opens the five-year plan with the code filled in.
 */
export async function FeaturedOfferBar() {
  const currency = requestCurrency();
  const [rate, offer] = await Promise.all([inrPerUsd(), monthlyOffer()]);
  const monthly = planTermPrice(PLANS.PREMIUM, "MONTH", currency, rate);
  const fiveYear = planTermPrice(PLANS.PREMIUM, "FIVE_YEAR", currency, rate);
  if (monthly === null || fiveYear === null || !offer) return null;

  const money = (value: number) =>
    formatMoney(Math.round(value), currency).replace(/\.00$/, "");
  const half = fiveYear / 2;
  const monthlyTotal = monthly * 60;
  const saving = monthlyTotal - half;

  return (
    <Link
      href={`/pricing?term=FIVE_YEAR&coupon=${offer.code}#plan-PREMIUM`}
      className="block bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-4 py-1.5 text-center text-xs font-semibold text-white hover:brightness-110 sm:text-sm"
    >
      <span className="sm:hidden">
        🔥 5 years Featured: {money(half)} with {offer.code}
      </span>
      <span className="hidden sm:inline">
        🔥 Special: 5 years of Featured for just {money(half)} with code{" "}
        {offer.code}
      </span>
      <span className="hidden lg:inline">
        {" "}
        — that&apos;s{" "}
        <span className="line-through opacity-80">
          {money(monthlyTotal)}
        </span>{" "}
        at {money(monthly)} a month, you save {money(saving)}
      </span>
      <span className="whitespace-nowrap">
        {" "}
        · this month&apos;s code ends in{" "}
        <OfferCountdown endsAt={offer.endsAt.toISOString()} />
      </span>{" "}
      <span className="whitespace-nowrap underline">Get it →</span>
    </Link>
  );
}
