"use server";

import { redirect } from "next/navigation";
import { siteUrl } from "@/lib/format";
import { findInvoice } from "@/lib/invoices";
import { getStripe, stripeEnabled } from "@/lib/stripe";

export async function startInvoiceCheckout(formData: FormData) {
  const invoice = findInvoice(String(formData.get("key") ?? ""));
  if (!invoice || !stripeEnabled()) redirect("/venmo");
  const back = `${siteUrl()}/pay/${invoice.key}`;

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: invoice.email,
    metadata: { kind: "invoice", invoiceKey: invoice.key },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: invoice.amountMinor,
          product_data: {
            name: `${invoice.title} — ${invoice.client}`,
            description: invoice.description,
          },
        },
      },
    ],
    success_url: `${back}?paid=1`,
    cancel_url: back,
  });
  redirect(session.url ?? back);
}
