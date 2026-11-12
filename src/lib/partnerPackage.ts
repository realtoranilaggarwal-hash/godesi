import { escapeHtml, sendEmail, shell } from "@/lib/email";
import { SITE } from "@/lib/site";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";

/** `WebsiteProject.includedIn` for a site that came with the Partner Package. */
export const PARTNER_PACKAGE_KEY = "partner-package";

export const PARTNER_PACKAGE = {
  priceUsd: 500,
  name: "GoDesi Partner Package",
  description:
    "Handmade website, 1-year side banner, 1-year featured listing, GoDesi Elite interview, banner at the New Year's Eve party and 1 party ticket.",
  /** Website hosting is free for the first year, then the normal monthly charge. */
  hostingAfterYearUsd: WEBSITE_OFFER.monthlyUsd,
};

export const PARTNER_HOSTING_NOTE = `Website hosting is included for the first year, then $${PARTNER_PACKAGE.hostingAfterYearUsd}/month.`;

/** Stripe holds the order; this tells the GoDesi team and thanks the client. */
export async function notifyPartnerPackagePaid(session: {
  id: string;
  amount_total: number | null;
  customer_email?: string | null;
  customer_details?: { email?: string | null } | null;
  metadata?: Record<string, string> | null;
}) {
  const meta = session.metadata ?? {};
  const email = session.customer_details?.email ?? session.customer_email ?? "";
  const rows = [
    ["Business", meta.business],
    ["Name", meta.name],
    ["Phone", meta.phone],
    ["Email", email],
    ["Website", meta.website || "—"],
    ["Paid", `$${((session.amount_total ?? 0) / 100).toLocaleString("en-US")}`],
    ["Stripe", session.id],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#64748b">${label}</td><td style="padding:4px 0"><b>${escapeHtml(value ?? "—")}</b></td></tr>`,
    )
    .join("");

  await sendEmail({
    to: SITE.supportEmail,
    subject: `Partner Package paid — ${meta.business ?? "new client"}`,
    html: shell("New Partner Package order", `<table>${rows}</table>`),
    ...(email ? { replyTo: email } : {}),
  });

  if (email) {
    await sendEmail({
      to: email,
      subject: "Welcome to the GoDesi Partner Package",
      html: shell(
        "Thank you — you're a GoDesi partner!",
        `<p>We received your $${PARTNER_PACKAGE.priceUsd} payment for the ${escapeHtml(PARTNER_PACKAGE.name)}.</p>
        <p>${escapeHtml(PARTNER_PACKAGE.description)}</p>
        <p>${escapeHtml(PARTNER_HOSTING_NOTE)}</p>
        <p>Our team will call you within 1–2 business days to collect your logo, photos and details. Questions? Call 732-877-8585 or reply to this email.</p>`,
      ),
      replyTo: SITE.salesEmail,
    });
  }
}
