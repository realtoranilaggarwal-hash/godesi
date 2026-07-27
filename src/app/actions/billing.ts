"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { activatePlan, downgradeToFree, planOrThrow } from "@/lib/billing";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { paypalEnabled } from "@/lib/paypal";
import { siteUrl, toMinor } from "@/lib/format";
import { planPrice, requestCurrency, stripeUnitAmount } from "@/lib/currency";
import { checkCoupon, couponMetadata } from "@/lib/coupons";

/**
 * Starts a Stripe Checkout session and redirects the buyer to Stripe.
 * The plan is only granted once Stripe confirms payment — either via the
 * webhook or the verified redirect back to /pricing/success.
 */
export async function startStripeCheckoutAction(formData: FormData) {
  const user = await requireUser();
  const plan = planOrThrow(String(formData.get("plan") ?? ""));

  if (!stripeEnabled()) redirect("/pricing?error=stripe_unavailable");

  const currency = requestCurrency();
  const listAmount = stripeUnitAmount(plan, currency);

  const code = String(formData.get("couponCode") ?? "").trim();
  const check = code
    ? await checkCoupon({
        code,
        scope: "PLAN",
        userId: user.id,
        subtotalMinor: listAmount,
        currency,
      })
    : null;
  if (check && !check.ok) redirect("/pricing?error=coupon");

  const discountMinor = check?.ok ? check.discountMinor : 0;
  const unitAmount = Math.max(0, listAmount - discountMinor);

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: {
      userId: user.id,
      plan: plan.id,
      ...couponMetadata(check?.ok ? check.coupon : null, discountMinor),
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: unitAmount,
          product_data: {
            name: `Godesi ${plan.name} — 30 days`,
            description: discountMinor
              ? `${plan.features.join(" · ")} · coupon applied`
              : plan.features.join(" · "),
          },
        },
      },
    ],
    success_url: `${siteUrl()}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/pricing?error=cancelled`,
  });

  if (!session.url) redirect("/pricing?error=stripe_session");
  redirect(session.url);
}

export async function downgradeToFreeAction() {
  const user = await requireUser();
  await downgradeToFree(user.id);
  revalidatePath("/dashboard");
  revalidatePath("/pricing");
  redirect("/dashboard?upgraded=FREE");
}

/**
 * Dev-only instant activation, available when no payment provider is configured
 * so the app stays demoable without live keys.
 */
export async function mockSubscribeAction(formData: FormData) {
  const user = await requireUser();
  const plan = planOrThrow(String(formData.get("plan") ?? ""));

  if (stripeEnabled() || paypalEnabled()) redirect("/pricing?error=mock_disabled");

  const mockCurrency = requestCurrency();

  await activatePlan({
    userId: user.id,
    plan: plan.id,
    provider: "mock",
    reference: `mock_${user.id}_${Date.now()}`,
    amountMinor: toMinor(planPrice(plan, mockCurrency)),
    currency: mockCurrency,
  });

  revalidatePath("/dashboard");
  revalidatePath("/pricing");
  redirect(`/dashboard?upgraded=${plan.id}`);
}
