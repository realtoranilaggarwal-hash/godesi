import { headers } from "next/headers";
import type { PlanInfo } from "@/lib/plans";
import { formatInr, formatUsd } from "@/lib/format";

export type Currency = "INR" | "USD";

/**
 * Buyers in India pay in rupees, everyone else pays in US dollars. Vercel sets
 * `x-vercel-ip-country` on every request; without it (local dev) we fall back to INR.
 */
export function requestCurrency(): Currency {
  const country = headers().get("x-vercel-ip-country");
  return !country || country === "IN" ? "INR" : "USD";
}

export function planPrice(plan: PlanInfo, currency: Currency) {
  return currency === "INR" ? plan.priceInr : plan.priceUsd;
}

export function formatPlanPrice(plan: PlanInfo, currency: Currency) {
  return currency === "INR" ? formatInr(plan.priceInr) : formatUsd(plan.priceUsd);
}

/** Stripe takes the smallest currency unit; both INR and USD have 100 of them. */
export function stripeUnitAmount(plan: PlanInfo, currency: Currency) {
  return Math.round(planPrice(plan, currency) * 100);
}
