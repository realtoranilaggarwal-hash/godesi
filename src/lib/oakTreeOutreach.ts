import { db } from "@/lib/db";
import { escapeHtml, sendEmail, shell, emailEnabled } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { localFeaturePath, LOCAL_FEATURE_MIN_USD } from "@/lib/localFeature";
import { canonicalEmail, inviteOptOutUrl } from "@/lib/invites";
import { NYE_2027_EVENT_SLUG } from "@/lib/nyeSponsorLevels";
import { SITE } from "@/lib/site";

/**
 * Claim-your-listing + NYE local-support emails to the businesses imported
 * from oaktreeroadbazaar.com: email 1, then reminders on day 4 and day 10.
 * An address stops as soon as one of its listings is claimed (or has a claim
 * pending), is paid to be featured, or the address opts out.
 */
export const OAKTREE_CAMPAIGN = "oaktree-nye-2027";
const SOURCE = "oaktreeroadbazaar";
const DAY_MS = 24 * 60 * 60 * 1000;
/** Days after email 1 that each reminder goes out. */
const REMINDER_DAYS = [4, 10];
/** Resend's daily quota is shared with receipts and the morning email. */
const DAILY_LIMIT = 30;

type Listing = { id: string; slug: string; name: string; city: string };

function listingLinks(listings: Listing[]) {
  return listings
    .slice(0, 4)
    .map(
      (b) =>
        `<li style="margin:0 0 6px"><b>${escapeHtml(b.name)}</b> (${escapeHtml(b.city)}) —
        <a href="${siteUrl()}/business/${b.slug}" style="color:#4f46e5;font-weight:700">see &amp; claim</a> ·
        <a href="${siteUrl()}${localFeaturePath(b.slug)}" style="color:#e11d48;font-weight:700">feature it for a year</a></li>`,
    )
    .join("");
}

export function oakTreeInviteEmail(step: number, email: string, listings: Listing[]) {
  const main = listings[0];
  const name = escapeHtml(main.name);
  const party = `${siteUrl()}/events/${NYE_2027_EVENT_SLUG}`;
  const subject =
    step === 0
      ? `${main.name} is now listed on GoDesi.com — claim it free`
      : step === 1
        ? `Reminder: claim ${main.name} on GoDesi (free)`
        : `Last reminder: claim ${main.name} free + our New Year's party`;
  const intro =
    step === 0
      ? `<p style="margin:0 0 12px">Namaste! <b>${name}</b> is now listed on <b>GoDesi.com</b>, the desi community
         directory for Oak Tree Road, Iselin and all of New Jersey. People searching for Oak Tree Road, Iselin
         and Indian markets in the USA now find your business there.</p>`
      : `<p style="margin:0 0 12px">Namaste! A quick reminder that <b>${name}</b>'s listing on <b>GoDesi.com</b>
         is still waiting for you to claim it. It's free and takes about two minutes.</p>`;
  const html = shell(
    step === 0 ? "Your business is live on GoDesi" : "Claim your free GoDesi listing",
    `${intro}
     <p style="margin:0 0 6px"><b>1. Claim it free</b> — add your photos, offers, WhatsApp and hours:</p>
     <ul style="margin:0 0 12px;padding-left:18px">${listingLinks(listings)}</ul>
     <p style="margin:0 0 12px"><b>2. Support our grand New Year's Eve party</b> — GoDesi is throwing a
     <a href="${party}" style="color:#4f46e5;font-weight:700">grand New Year's Eve party</a> for the community,
     and we're asking local vendors to help. Sponsors are welcome at any level.</p>
     <p style="margin:0 0 12px"><b>3. Pay what you want, get featured for a year</b> — it's local support,
     so pay any amount from $${LOCAL_FEATURE_MIN_USD}, and for the first year we will:</p>
     <ul style="margin:0 0 12px;padding-left:18px">
       <li>feature ${name} on GoDesi above the free listings (Indian businesses in Iselin and New Jersey only)</li>
       <li>have Anil or the GoDesi team come by to put an <b>"As seen on GoDesi.com"</b> QR-code sticker on your
       board, so walk-in customers can scan, follow and share your page</li>
     </ul>
     <p style="margin:0 0 16px"><a href="${siteUrl()}${localFeaturePath(main.slug)}"
       style="display:inline-block;background:#e11d48;color:#fff;font-weight:800;padding:12px 18px;border-radius:12px;text-decoration:none">
       Support local &amp; feature ${name} →</a></p>
     <p style="margin:0 0 12px">Want the sticker visit first, or to sponsor the party? Call or WhatsApp Anil at
     <a href="tel:+17329837958">(732) 983-7958</a>, or just reply to this email.</p>
     <p style="margin:14px 0 0;font-size:12px;color:#94a3b8">We emailed you because ${name} is listed with this
     address in a public Oak Tree Road business directory. You'll get at most two reminders, and they stop
     once you claim. <a href="${inviteOptOutUrl(email)}" style="color:#94a3b8">Never email me again</a>, or write to
     ${SITE.supportEmail}.</p>`,
  );
  return { subject, html };
}

/** Adds every unclaimed imported listing with a public email (one row per address). */
async function enroll() {
  const rows = await db.business.findMany({
    where: {
      source: SOURCE,
      status: "APPROVED",
      ownerId: null,
      publicEmail: { not: null },
    },
    select: { id: true, publicEmail: true },
    orderBy: { createdAt: "asc" },
  });
  const byEmail = new Map<string, string[]>();
  for (const row of rows) {
    const email = canonicalEmail(row.publicEmail ?? "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
    byEmail.set(email, [...(byEmail.get(email) ?? []), row.id]);
  }
  const existing = new Set(
    (
      await db.localOutreach.findMany({
        where: { campaign: OAKTREE_CAMPAIGN },
        select: { email: true },
      })
    ).map((r) => r.email),
  );
  const fresh = Array.from(byEmail).filter(([email]) => !existing.has(email));
  if (fresh.length) {
    await db.localOutreach.createMany({
      data: fresh.map(([email, businessIds]) => ({
        campaign: OAKTREE_CAMPAIGN,
        email,
        businessIds,
      })),
      skipDuplicates: true,
    });
  }
  return fresh.length;
}

/** Why this address should get no more emails, or null to keep going. */
async function stopReason(email: string, businessIds: string[]) {
  const optedOut = await db.inviteOptOut.findUnique({ where: { emailCanonical: email } });
  if (optedOut) return "unsubscribed";
  // Already getting a personal partner proposal (e.g. Suhag Jewelers): don't double up.
  const partner = await db.partnerFollowUp.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });
  if (partner) return "partner";
  const listings = await db.business.findMany({
    where: { id: { in: businessIds } },
    select: {
      ownerId: true,
      featuredUntil: true,
      status: true,
      claims: { where: { status: { in: ["PENDING", "APPROVED"] } }, select: { id: true } },
    },
  });
  if (listings.some((b) => b.ownerId || b.claims.length)) return "claimed";
  if (listings.some((b) => b.featuredUntil && b.featuredUntil > new Date())) return "paid";
  if (!listings.some((b) => b.status === "APPROVED")) return "removed";
  return null;
}

/** Daily: reminders that are due first, then new addresses, up to the daily limit. */
export async function sendOakTreeInvites(limit = DAILY_LIMIT) {
  const enrolled = await enroll();
  if (!emailEnabled()) return { enrolled, sent: 0, stopped: 0, skipped: "email disabled" };

  const now = Date.now();
  const open = await db.localOutreach.findMany({
    where: { campaign: OAKTREE_CAMPAIGN, stoppedAt: null },
    orderBy: { createdAt: "asc" },
  });
  const due = open
    .filter((row) => {
      if (row.step === 0) return true;
      const days = REMINDER_DAYS[row.step - 1];
      return days !== undefined && row.firstSentAt && now >= row.firstSentAt.getTime() + days * DAY_MS;
    })
    .sort((a, b) => Number(a.step === 0) - Number(b.step === 0));

  let sent = 0;
  let stopped = 0;
  for (const row of due) {
    if (sent >= limit) break;
    const reason = await stopReason(row.email, row.businessIds);
    if (reason) {
      await db.localOutreach.update({
        where: { id: row.id },
        data: { stoppedAt: new Date(), stopReason: reason },
      });
      stopped += 1;
      continue;
    }
    const listings = await db.business.findMany({
      where: { id: { in: row.businessIds }, status: "APPROVED", ownerId: null },
      select: { id: true, slug: true, name: true, city: true },
      orderBy: { createdAt: "asc" },
    });
    if (!listings.length) continue;
    const { subject, html } = oakTreeInviteEmail(row.step, row.email, listings);
    const ok = await sendEmail({ to: row.email, subject, html, replyTo: SITE.alertsEmail });
    // A failed send is usually the shared daily quota: stop and retry tomorrow.
    if (!ok) break;
    const step = row.step + 1;
    await db.localOutreach.update({
      where: { id: row.id },
      data: {
        step,
        lastSentAt: new Date(),
        ...(row.step === 0 ? { firstSentAt: new Date() } : {}),
        ...(step > REMINDER_DAYS.length ? { stoppedAt: new Date(), stopReason: "done" } : {}),
      },
    });
    sent += 1;
  }
  return { enrolled, sent, stopped, open: open.length - stopped };
}
