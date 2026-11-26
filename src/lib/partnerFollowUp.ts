import { db } from "@/lib/db";
import { escapeHtml, sendEmail, shell } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { PARTNER_PACKAGES } from "@/lib/partnerPackage";

const ANIL_PHONE = "(732) 983-7958";
const ANIL_PHONE_HREF = "tel:+17329837958";
const SCRATCH_CARDS_URL = "https://temu.to/k/pkg2ayupzo8";
const DAY_MS = 24 * 60 * 60 * 1000;

type FollowUp = {
  id: string;
  key: string;
  email: string;
  contactName: string;
  businessName: string;
  deadline: Date;
  clickedAt: Date | null;
};

function deadlineLabel(deadline: Date) {
  return deadline.toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function button(href: string, label: string, color = "#e11d48") {
  return `<a href="${href}" style="display:inline-block;margin:4px 8px 4px 0;padding:12px 20px;border-radius:999px;background:${color};color:#fff;font-weight:700;text-decoration:none">${label}</a>`;
}

/** Tracked link: records the click, then opens the proposal (or its pay form for a tier). */
export function followUpLink(key: string, tier?: string) {
  return `${siteUrl()}/go/partner/${encodeURIComponent(key)}${tier ? `?tier=${tier}` : ""}`;
}

function packagesHtml(key: string) {
  return Object.values(PARTNER_PACKAGES)
    .map(
      (pkg) => `<div style="border:1px solid #e2e8f0;border-radius:12px;padding:12px 16px;margin:8px 0">
        <p style="margin:0;font-weight:800">$${pkg.priceUsd.toLocaleString("en-US")} — ${escapeHtml(pkg.name)}</p>
        <p style="margin:6px 0;font-size:14px;color:#475569">${escapeHtml(pkg.description)}</p>
        ${button(followUpLink(key, pkg.tier), `Pay $${pkg.priceUsd.toLocaleString("en-US")} →`)}
      </div>`,
    )
    .join("");
}

function scratchCardsHtml() {
  return `<p><b>Scratch cards:</b> please order <b>1,000 cards</b> — that's 9 packs of the
    120-pack black scratch-off thank-you cards with stickers ($14.50 a pack, about $130):
    <a href="${SCRATCH_CARDS_URL}">${SCRATCH_CARDS_URL}</a></p>`;
}

function openPixel(key: string) {
  return `<img src="${siteUrl()}/go/partner/${encodeURIComponent(key)}/open" width="1" height="1" alt="" style="display:block;border:0;width:1px;height:1px" />`;
}

/** Asks for a yes today: other businesses want the spot. */
function confirmHtml(key: string) {
  return `<p style="background:#fff7ed;border:1px solid #fdba74;border-radius:12px;padding:12px 16px">
    <b>Please confirm today.</b> We have a lot of business coming up for the holidays and New Year's Eve,
    and other businesses are lining up for your spot. Reply <b>"Yes"</b> to this email or tap the button
    below to confirm, so we can keep it for you.<br />
    ${button(followUpLink(key), "Yes, I confirm →", "#ea580c")}</p>`;
}

/** Subject and body for today's email: invite before a click, "complete payment" after. */
export function followUpEmail(followUp: FollowUp, now = new Date()) {
  const name = escapeHtml(followUp.contactName);
  const business = escapeHtml(followUp.businessName);
  const by = deadlineLabel(followUp.deadline);
  const lastDay = followUp.deadline.getTime() - now.getTime() < DAY_MS;
  const urgency = lastDay
    ? `<p style="color:#be123c"><b>Today is the last day.</b> If payment isn't received by tonight, this partnership offer is off.</p>`
    : `<p><b>This offer is open until ${by}.</b> After that, the deal is off.</p>`;
  const contact = `<p>Questions? Call or WhatsApp Anil at <a href="${ANIL_PHONE_HREF}">${ANIL_PHONE}</a>, or just reply to this email.</p>
    <p>— Anil &amp; Team GoDesi</p>`;

  if (followUp.clickedAt) {
    return {
      subject: lastDay
        ? `Last day: complete your GoDesi partnership, ${followUp.contactName}`
        : `Please confirm: ${followUp.businessName} — complete your GoDesi partnership`,
      html: shell(
        "Please complete your payment",
        `<p>Hi ${name} ji,</p>
        <p>Thank you for looking at the GoDesi partnership proposal. Please pick your package and
        complete the payment so Anil and his team can start promoting ${business} right away.</p>
        ${confirmHtml(followUp.key)}
        ${packagesHtml(followUp.key)}
        ${urgency}
        ${scratchCardsHtml()}
        ${contact}
        ${openPixel(followUp.key)}`,
      ),
    };
  }

  return {
    subject: lastDay
      ? `Last day: ${followUp.businessName} × GoDesi partnership`
      : `Please confirm: ${followUp.businessName} × GoDesi partnership — businesses are lining up`,
    html: shell(
      `${business} × GoDesi partnership`,
      `<p>Hi ${name} ji,</p>
      <p>Thank you for the interview last week and for your interest in becoming a GoDesi.com partner.</p>
      ${confirmHtml(followUp.key)}
      <p><b>Your name is already at the top:</b> "${business} · 22Kt Gold &amp; Diamond Center · Iselin NJ"
      now shows in the top strip on every GoDesi page.</p>
      <p><b>Your partnership:</b> see everything included and choose your package:</p>
      <p>${button(followUpLink(followUp.key), "See your partnership & pay →")}</p>
      <p>Two packages: <b>$${PARTNER_PACKAGES.starter.priceUsd.toLocaleString("en-US")} Starter</b> or
      <b>$${PARTNER_PACKAGES.premium.priceUsd.toLocaleString("en-US")} Premium</b> (adds a VIP New Year's Eve table for 12).</p>
      <p><b>The sooner you pay, the sooner Anil and his team can start promoting you.</b></p>
      ${urgency}
      ${scratchCardsHtml()}
      ${contact}
      ${openPixel(followUp.key)}`,
    ),
  };
}

/** Daily cron: one email per open follow-up until it is paid or past its deadline. */
export async function sendPartnerFollowUps(now = new Date()) {
  const due = await db.partnerFollowUp.findMany({
    where: {
      paidAt: null,
      deadline: { gte: now },
      OR: [{ lastSentAt: null }, { lastSentAt: { lt: new Date(now.getTime() - 20 * 60 * 60 * 1000) } }],
    },
  });
  const results: { key: string; clicked: boolean; sent: boolean }[] = [];
  for (const followUp of due) {
    const { subject, html } = followUpEmail(followUp, now);
    const sent = await sendEmail({ to: followUp.email, subject, html });
    if (sent) {
      await db.partnerFollowUp.update({
        where: { id: followUp.id },
        data: { lastSentAt: now, sentCount: { increment: 1 } },
      });
    }
    results.push({ key: followUp.key, clicked: Boolean(followUp.clickedAt), sent });
  }
  return results;
}

/** Stops the reminders once the prospect pays for a partner package online. */
export async function markPartnerFollowUpPaid(
  email: string | null | undefined,
  business: string | null | undefined,
  key?: string | null,
) {
  const or = [
    ...(key ? [{ key }] : []),
    ...(email ? [{ email: { equals: email.trim(), mode: "insensitive" as const } }] : []),
    ...(business?.trim()
      ? [{ businessName: { equals: business.trim(), mode: "insensitive" as const } }]
      : []),
  ];
  if (!or.length) return;
  await db.partnerFollowUp.updateMany({ where: { paidAt: null, OR: or }, data: { paidAt: new Date() } });
}
