import { escapeHtml, sendEmail, shell } from "@/lib/email";
import { SITE } from "@/lib/site";
import { getStripe, stripeEnabled } from "@/lib/stripe";

/** A quote paid by card from /pay/<key>. Keys are random so links can't be guessed. */
export type Invoice = {
  key: string;
  client: string;
  email: string;
  title: string;
  description: string;
  amountMinor: number;
};

const NAKULA = {
  client: "Astrologer Nakula",
  email: "mrNakula2@gmail.com",
  description:
    "Website redo of astrologerpsychicnakula.com ($799) + automated daily astrology page, first year ($500). Leads plan ($79/month) waived. Total $1,299, paid in two halves.",
};

export const INVOICES: Invoice[] = [
  {
    key: "nakula-3025fb37f5cf",
    ...NAKULA,
    title: "Website + daily astrology page — 1st half (50%) to start",
    amountMinor: 64950,
  },
  {
    key: "nakula-6abca4d35dd8",
    ...NAKULA,
    title: "Website + daily astrology page — 2nd half (50%) on completion",
    amountMinor: 64950,
  },
  {
    key: "dr-gurudeva-e440776bfb5a",
    client: "Dr. Gurudeva — Indian Vedic Astrologer",
    email: "doctor_deva@yahoo.com",
    title: "GoDesi Premium — 1-year package (Nov 2026 – Nov 2027)",
    description:
      "$500 package for $100: Premium membership, Featured astrologer page, astrology + sidebar banner ads, gemstones classified and GoDesi News Desk story. Renews Nov 25, 2027.",
    amountMinor: 10000,
  },
];

export function findInvoice(key: string | null | undefined) {
  return INVOICES.find((invoice) => invoice.key === key) ?? null;
}

/** Whether this installment already has a succeeded card payment, so a reopened link can't charge it twice. */
export async function invoicePaid(key: string) {
  if (!stripeEnabled()) return false;
  const found = await getStripe().paymentIntents.search({
    query: `metadata['invoiceKey']:'${key}' AND status:'succeeded'`,
    limit: 1,
  });
  return found.data.length > 0;
}

export function usdMinor(amountMinor: number) {
  return `$${(amountMinor / 100).toLocaleString("en-US", { minimumFractionDigits: amountMinor % 100 ? 2 : 0 })}`;
}

/** Stripe holds the payment; this tells the GoDesi team and thanks the client. */
export async function notifyInvoicePaid(session: {
  id: string;
  amount_total: number | null;
  customer_email?: string | null;
  customer_details?: { email?: string | null } | null;
  metadata?: Record<string, string> | null;
}) {
  const invoice = findInvoice(session.metadata?.invoiceKey);
  const title = invoice
    ? `${invoice.client} — ${invoice.title}`
    : (session.metadata?.invoiceKey ?? "invoice");
  const paid = usdMinor(session.amount_total ?? 0);
  const email =
    session.customer_details?.email ??
    session.customer_email ??
    invoice?.email ??
    "";

  await sendEmail({
    to: SITE.supportEmail,
    subject: `Paid ${paid}: ${title}`,
    html: shell(
      "Invoice paid",
      `<p><b>${escapeHtml(title)}</b></p><p>Paid: <b>${paid}</b><br/>Email: ${escapeHtml(email || "—")}<br/>Stripe: ${escapeHtml(session.id)}</p>`,
    ),
    ...(email ? { replyTo: email } : {}),
  });
  if (email && invoice) {
    await sendEmail({
      to: email,
      subject: `Thank you — we received your ${paid} payment`,
      html: shell(
        "Thank you for your payment",
        `<p>We received your <b>${paid}</b> payment for: ${escapeHtml(invoice.title)}.</p>
        <p>${escapeHtml(invoice.description)}</p>
        <p>Questions? Call or WhatsApp Anil at (732) 983-7958, or reply to this email.</p>`,
      ),
      replyTo: SITE.alertsEmail,
    });
  }
}
