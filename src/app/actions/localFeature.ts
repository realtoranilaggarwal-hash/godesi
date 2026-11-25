"use server";

import { redirect } from "next/navigation";
import { siteUrl } from "@/lib/format";
import {
  LOCAL_FEATURE_MIN_USD,
  findLocalFeatureBusiness,
  localFeaturePath,
} from "@/lib/localFeature";
import { getStripe, stripeEnabled } from "@/lib/stripe";

export async function startLocalFeatureCheckout(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const business = await findLocalFeatureBusiness(slug);
  if (!business) redirect("/bazaar");
  const back = `${siteUrl()}${localFeaturePath(business.slug)}`;
  const amount = Math.round(Number(formData.get("preset") || formData.get("amount")) * 100);
  if (!Number.isFinite(amount) || amount < LOCAL_FEATURE_MIN_USD * 100 || amount > 1_000_000) {
    redirect(`${back}?error=amount`);
  }
  if (!stripeEnabled()) redirect("/venmo");

  const metadata = { kind: "local-feature", businessId: business.id };
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    metadata,
    payment_intent_data: { metadata },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name: `Local support — feature ${business.name} on GoDesi for 1 year`,
            description:
              "Featured placement on GoDesi for 12 months, plus an \"As seen on GoDesi.com\" QR sticker for your shop.",
          },
        },
      },
    ],
    success_url: `${back}?paid=1`,
    cancel_url: back,
  });
  redirect(session.url ?? back);
}
