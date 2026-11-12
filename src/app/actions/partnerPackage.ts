"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/actions";
import { siteUrl } from "@/lib/format";
import { PARTNER_PACKAGE } from "@/lib/partnerPackage";
import { getStripe, stripeEnabled } from "@/lib/stripe";

const schema = z.object({
  business: z.string().trim().min(2, "Enter your business name").max(100),
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(120),
  phone: z.string().trim().min(7, "Enter a valid phone").max(30),
  website: z.string().trim().max(200).optional(),
});

/** Anyone with the proposal link can pay — no GoDesi account needed. */
export async function startPartnerPackageCheckout(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!stripeEnabled()) {
    return { error: "Card payments are down right now — please call 732-877-8585." };
  }
  const data = parsed.data;

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: data.email,
    metadata: {
      kind: "partner-package",
      business: data.business,
      name: data.name,
      phone: data.phone,
      website: data.website ?? "",
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: PARTNER_PACKAGE.priceUsd * 100,
          product_data: {
            name: `${PARTNER_PACKAGE.name} — ${data.business}`,
            description: PARTNER_PACKAGE.description,
          },
        },
      },
    ],
    success_url: `${siteUrl()}/advertise/proposal?paid=1`,
    cancel_url: `${siteUrl()}/advertise/proposal#pay`,
  });

  if (!session.url) return { error: "Could not start the payment. Please try again." };
  redirect(session.url);
}
