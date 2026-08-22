"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  activatePlan,
  downgradeToFree,
  grantBundle,
  planOrThrow,
} from "@/lib/billing";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { paypalEnabled } from "@/lib/paypal";
import { siteUrl, toMinor } from "@/lib/format";
import { requestCurrency } from "@/lib/currency";
import {
  PLAN_TERMS,
  planTermPrice,
  planTerms,
  termOrThrow,
  type PlanInfo,
  type TermId,
} from "@/lib/plans";
import { checkCoupon, couponMetadata } from "@/lib/coupons";
import {
  BUNDLE_MONTHS,
  cartItem,
  describeTerm,
  priceCart,
  toBundleMinor,
} from "@/lib/bundles";

/**
 * Starts a Stripe Checkout session and redirects the buyer to Stripe.
 * The plan is only granted once Stripe confirms payment — either via the
 * webhook or the verified redirect back to /pricing/success.
 */
export async function startStripeCheckoutAction(formData: FormData) {
  const user = await requireUser();
  const plan = planOrThrow(String(formData.get("plan") ?? ""));
  const term = requestedTerm(formData, plan);

  if (!stripeEnabled()) redirect("/pricing?error=stripe_unavailable");

  const currency = requestCurrency();
  const price = planTermPrice(plan, term, currency);
  if (price === null) redirect("/pricing?error=term");
  const listAmount = toMinor(price);

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
      months: String(PLAN_TERMS[term].months),
      ...couponMetadata(check?.ok ? check.coupon : null, discountMinor),
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: unitAmount,
          product_data: {
            name: `Godesi ${plan.name} — ${PLAN_TERMS[term].label}`,
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

/**
 * The upgrade cart. Prices are recomputed here from the item keys, so the
 * browser cannot change what is charged. A caller's coupon can cut the price,
 * add extra years, or both — whatever the code was created with.
 */
export async function startBundleCheckoutAction(formData: FormData) {
  const user = await requireUser();
  const currency = requestCurrency();

  const keys = formData
    .getAll("items")
    .map((value) => String(value))
    .filter((key) => Boolean(cartItem(key)));
  if (!keys.includes("membership")) keys.unshift("membership");

  const cart = priceCart(keys, currency);
  const listAmount = toBundleMinor(cart.total);

  const code = String(formData.get("couponCode") ?? "").trim();
  const check = code
    ? await checkCoupon({
        code,
        scope: "BUNDLE",
        userId: user.id,
        subtotalMinor: listAmount,
        currency,
        requireDiscount: false,
      })
    : null;
  if (check && !check.ok) redirect("/upgrade?error=coupon");

  const coupon = check?.ok ? check.coupon : null;
  const discountMinor = check?.ok ? check.discountMinor : 0;
  const unitAmount = Math.max(0, listAmount - discountMinor);
  const months = BUNDLE_MONTHS + (coupon?.bonusMonths ?? 0);
  const itemKeys = cart.items.map((item) => item.key);

  if (!stripeEnabled()) {
    if (!paypalEnabled()) {
      await grantBundle({
        userId: user.id,
        months,
        itemKeys,
        provider: "mock",
        reference: `mock_bundle_${user.id}_${Date.now()}`,
        amountMinor: unitAmount,
        currency,
      });
      redirect("/dashboard?upgraded=BUNDLE");
    }
    redirect("/upgrade?error=stripe_unavailable");
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: {
      userId: user.id,
      kind: "bundle",
      months: String(months),
      items: itemKeys.join(","),
      ...couponMetadata(coupon, discountMinor),
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: unitAmount,
          product_data: {
            name: `Godesi package — ${describeTerm(months)}`,
            description: cart.items.map((item) => item.label).join(" · "),
          },
        },
      },
    ],
    success_url: `${siteUrl()}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/upgrade?error=cancelled`,
  });

  if (!session.url) redirect("/upgrade?error=stripe_session");
  redirect(session.url);
}

/**
 * The term the buyer picked, refusing anything this plan does not sell (the
 * five-year founding price, for instance, once the offer has closed).
 */
function requestedTerm(formData: FormData, plan: PlanInfo): TermId {
  const term = termOrThrow(String(formData.get("term") ?? "MONTH"));
  if (!planTerms(plan).includes(term)) redirect("/pricing?error=term");
  return term;
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

  if (stripeEnabled() || paypalEnabled())
    redirect("/pricing?error=mock_disabled");

  const mockCurrency = requestCurrency();

  const term = requestedTerm(formData, plan);
  await activatePlan({
    userId: user.id,
    plan: plan.id,
    provider: "mock",
    reference: `mock_${user.id}_${Date.now()}`,
    amountMinor: toMinor(planTermPrice(plan, term, mockCurrency) ?? 0),
    currency: mockCurrency,
    months: PLAN_TERMS[term].months,
  });

  revalidatePath("/dashboard");
  revalidatePath("/pricing");
  redirect(`/dashboard?upgraded=${plan.id}`);
}
