import { escapeHtml, sendEmail, shell } from "@/lib/email";
import { SITE } from "@/lib/site";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";

/** `WebsiteProject.includedIn` for a site that came with the Partner Package. */
export const PARTNER_PACKAGE_KEY = "partner-package";

export const PARTNER_PACKAGE = {
  tier: "starter",
  priceUsd: 500,
  name: "GoDesi Starter Partnership — Elite Marketing + Website",
  description:
    "GoDesi Elite interview and feature, Elite membership with a featured business profile, DesiWho'sWho.com listing, 10-second promotional video, 320×100 side banner for 12 months, AI-enabled SEO-friendly website and 2 complimentary New Year's Eve party tickets.",
  /** Website hosting is free for the first year, then the normal monthly charge. */
  hostingAfterYearUsd: WEBSITE_OFFER.monthlyUsd,
};

export const PREMIUM_PARTNER_PACKAGE = {
  tier: "premium",
  priceUsd: 2000,
  name: "GoDesi Premium Partnership — Complete Elite + VIP Sponsorship",
  description:
    "Everything in the $500 Starter Partnership, plus a VIP table for 12 guests (10 additional VIP seats, 12 total guests including the 2 complimentary tickets), your company logo, picture and website on the New Year's Eve supporters banner, a personalized placard on your table, a personalized 10% ticket discount code for your clients and additional event sponsor recognition.",
  hostingAfterYearUsd: WEBSITE_OFFER.monthlyUsd,
};

export const PARTNER_PACKAGES = {
  starter: PARTNER_PACKAGE,
  premium: PREMIUM_PARTNER_PACKAGE,
} as const;

/** Set by /go/partner/<key> so a checkout from that browser stops that prospect's reminders. */
export const PARTNER_REF_COOKIE = "gd_partner_ref";

export type PartnerTier = keyof typeof PARTNER_PACKAGES;
export const PARTNER_TIERS = Object.keys(PARTNER_PACKAGES) as [PartnerTier, ...PartnerTier[]];

export const PARTNER_HOSTING_NOTE = `Website hosting is included for the first year, then $${PARTNER_PACKAGE.hostingAfterYearUsd}/month.`;

export function partnerPackageFor(tier: string | null | undefined) {
  return PARTNER_PACKAGES[tier as PartnerTier] ?? PARTNER_PACKAGE;
}

/** Stripe holds the order; this tells the GoDesi team and thanks the client. */
export async function notifyPartnerPackagePaid(session: {
  id: string;
  amount_total: number | null;
  customer_email?: string | null;
  customer_details?: { email?: string | null } | null;
  metadata?: Record<string, string> | null;
}) {
  const meta = session.metadata ?? {};
  const pkg = partnerPackageFor(meta.tier);
  const email = session.customer_details?.email ?? session.customer_email ?? "";
  const rows = [
    ["Package", pkg.name],
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
    subject: `${pkg.tier === "premium" ? "Premium" : "Starter"} Partnership paid — ${meta.business ?? "new client"}`,
    html: shell(`New ${pkg.name} order`, `<table>${rows}</table>`),
    ...(email ? { replyTo: email } : {}),
  });

  if (email) {
    await sendEmail({
      to: email,
      subject: `Welcome to the ${pkg.name}`,
      html: shell(
        "Thank you — you're a GoDesi partner!",
        `<p>We received your $${pkg.priceUsd.toLocaleString("en-US")} payment for the ${escapeHtml(pkg.name)}.</p>
        <p>${escapeHtml(pkg.description)}</p>
        <p>${escapeHtml(PARTNER_HOSTING_NOTE)}</p>
        <p>Our team will call you within 1–2 business days to collect your logo, photos and details. Questions? Call 732-877-8585 or reply to this email.</p>`,
      ),
      replyTo: SITE.salesEmail,
    });
  }
}
