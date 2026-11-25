import { db } from "@/lib/db";
import { escapeHtml, sendEmail, shell } from "@/lib/email";
import { SITE } from "@/lib/site";

/** "Pay what you want" local-support feature: one year of Featured placement for a New Jersey desi business. */
export const LOCAL_FEATURE_MIN_USD = 25;
export const LOCAL_FEATURE_PRESETS_USD = [25, 51, 101, 251];
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export function localFeaturePath(slug: string) {
  return `/bazaar/feature/${encodeURIComponent(slug)}`;
}

/** Only New Jersey listings qualify — the offer is for local businesses around Iselin. */
export async function findLocalFeatureBusiness(slug: string) {
  const business = await db.business.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      city: true,
      state: true,
      status: true,
      featuredUntil: true,
      publicEmail: true,
    },
  });
  if (!business || business.status !== "APPROVED") return null;
  if ((business.state ?? "").toUpperCase() !== "NJ") return null;
  return business;
}

/**
 * Stripe confirmed the payment: feature the card for a year from today (or
 * from the end of a term it already has), stop the claim emails for it, and
 * tell the team and the payer.
 */
export async function confirmLocalFeature(session: {
  id: string;
  amount_total: number | null;
  customer_email?: string | null;
  customer_details?: { email?: string | null } | null;
  metadata?: Record<string, string> | null;
}) {
  const businessId = session.metadata?.businessId;
  if (!businessId) return;
  const business = await db.business.findUnique({
    where: { id: businessId },
    select: { id: true, name: true, slug: true, featuredRank: true, featuredUntil: true },
  });
  if (!business) return;

  const now = Date.now();
  const from = Math.max(now, business.featuredUntil?.getTime() ?? 0);
  const until = new Date(from + YEAR_MS);
  await db.business.update({
    where: { id: business.id },
    data: {
      featured: true,
      featuredRank: Math.max(business.featuredRank, 2),
      featuredUntil: until,
    },
  });
  await db.localOutreach.updateMany({
    where: { businessIds: { has: business.id }, stoppedAt: null },
    data: { stoppedAt: new Date(), stopReason: "paid" },
  });

  const paid = `$${((session.amount_total ?? 0) / 100).toFixed(2)}`;
  const email = session.customer_details?.email ?? session.customer_email ?? "";
  const untilLabel = until.toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  await sendEmail({
    to: SITE.supportEmail,
    subject: `Local support ${paid}: ${business.name} featured until ${untilLabel}`,
    html: shell(
      "Local support payment",
      `<p><b>${escapeHtml(business.name)}</b> paid <b>${paid}</b> and is now Featured until ${untilLabel}.</p>
      <p>Email: ${escapeHtml(email || "—")}<br/>Stripe: ${escapeHtml(session.id)}</p>
      <p>Next: arrange the "As seen on GoDesi.com" QR sticker visit.</p>`,
    ),
    ...(email ? { replyTo: email } : {}),
  });
  if (email) {
    await sendEmail({
      to: email,
      subject: `Thank you — ${business.name} is featured on GoDesi until ${untilLabel}`,
      html: shell(
        "Thank you for supporting local!",
        `<p>We received your <b>${paid}</b> local-support payment. <b>${escapeHtml(business.name)}</b> is now a
        Featured business on GoDesi until <b>${untilLabel}</b>.</p>
        <p>Anil or the GoDesi team will contact you to put up your "As seen on GoDesi.com" QR sticker.
        Questions? Call or WhatsApp Anil at (732) 983-7958, or reply to this email.</p>`,
      ),
      replyTo: SITE.alertsEmail,
    });
  }
}
