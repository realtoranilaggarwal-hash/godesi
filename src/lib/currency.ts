import { headers } from "next/headers";
import type { PlanInfo } from "@/lib/plans";
import { formatInr, formatUsd } from "@/lib/format";
import { getRates } from "@/lib/rates";

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

export function formatMoney(amount: number, currency: Currency) {
  return currency === "INR" ? formatInr(amount) : formatUsd(amount);
}

/** Rupees per dollar today; plan prices in rupees follow the dollar price. */
export async function inrPerUsd() {
  return (await getRates()).INR;
}

export function formatPlanPrice(
  plan: PlanInfo,
  currency: Currency,
  rate?: number,
) {
  if (currency === "USD") return formatUsd(plan.priceUsd);
  return formatInr(rate ? Math.round(plan.priceUsd * rate) : plan.priceInr);
}

/** Stripe takes the smallest currency unit; both INR and USD have 100 of them. */
export function stripeUnitAmount(plan: PlanInfo, currency: Currency) {
  return Math.round(planPrice(plan, currency) * 100);
}

/** Default country for new listings: India for Indian traffic, USA otherwise. */
export function requestCountry(): string {
  const country = headers().get("x-vercel-ip-country");
  return country === "IN" ? "India" : "USA";
}
