"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { siteUrl } from "@/lib/format";
import { syncConnectStatus } from "@/lib/connect";
import { canReceiveDirectPayouts } from "@/lib/plans";

/**
 * Sends an organiser to Stripe to connect (or finish connecting) the account
 * their ticket money is paid into. Godesi never holds the funds.
 */
export async function startConnectOnboardingAction() {
  const user = await requireUser();
  if (!stripeEnabled()) redirect("/dashboard/payouts?error=stripe_unavailable");
  if (!canReceiveDirectPayouts(user)) redirect("/dashboard/payouts?error=premium_only");

  let accountId = user.stripeAccountId;
  if (!accountId) {
    const account = await getStripe().accounts.create({
      type: "express",
      email: user.email,
      capabilities: { transfers: { requested: true }, card_payments: { requested: true } },
      business_profile: { product_description: "Event tickets sold on Godesi" },
      metadata: { userId: user.id },
    });
    accountId = account.id;
    await db.user.update({
      where: { id: user.id },
      data: { stripeAccountId: accountId },
    });
  }

  const link = await getStripe().accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    refresh_url: `${siteUrl()}/dashboard/payouts?refresh=1`,
    return_url: `${siteUrl()}/dashboard/payouts?connected=1`,
  });

  redirect(link.url);
}

/** Pulls the latest capability flags from Stripe after onboarding. */
export async function refreshConnectStatusAction() {
  const user = await requireUser();
  if (!user.stripeAccountId || !stripeEnabled()) {
    redirect("/dashboard/payouts?error=not_connected");
  }
  await syncConnectStatus(user.id, user.stripeAccountId);
  redirect("/dashboard/payouts");
}
