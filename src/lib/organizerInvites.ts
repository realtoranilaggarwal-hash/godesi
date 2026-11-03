import { db } from "@/lib/db";
import { sendEmail, shell, emailEnabled } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { canonicalEmail, inviteOptOutUrl } from "@/lib/invites";
import { SITE } from "@/lib/site";

/** Trades whose businesses run desi events — planners, venues, places of worship, officiants. */
const ORGANIZER_TRADE =
  /planner|banquet|ballroom|hall|temple|mandir|masjid|mosque|gurudwara|gurdwara|auditorium|convention|officiant|priest|pandit/i;

/** Resend's free tier is ~100/day and the morning email already uses most of it. */
const DAILY_LIMIT = 35;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inviteFor(p: {
  name: string;
  trade: string;
  city: string | null;
  email: string;
}) {
  const where = p.city ? ` in ${p.city}` : "";
  return shell(
    "Your events belong on GoDesi 🎪",
    `<p style="margin:0 0 12px">Namaste ${escapeHtml(p.name)},</p>
     <p style="margin:0 0 12px">We found ${escapeHtml(p.trade)}${escapeHtml(where)} while building
     <b>GoDesi.com</b> — the desi community directory for the USA. If you organise or host desi
     events — garba, Diwali melas, satsangs, weddings, community dinners — your events can be listed
     there <b>free</b>, with RSVP tracking and a shareable page for every event.</p>
     <p style="margin:0 0 12px"><a href="${siteUrl()}/events/new" style="color:#4f46e5;font-weight:700">Post your next event free →</a>
     It takes about two minutes, and it also reaches the desi families who check GoDesi every morning.</p>
     <p style="margin:0 0 12px">A free business card for ${escapeHtml(p.name)} takes another four minutes:
     <a href="${siteUrl()}/post?type=business" style="color:#4f46e5;font-weight:700">list your ${escapeHtml(p.trade.toLowerCase())} free →</a></p>
     <p style="margin:14px 0 0;font-size:12px;color:#94a3b8">We mailed you once because your ${escapeHtml(p.trade.toLowerCase())} was listed in a public desi directory.
     <a href="${inviteOptOutUrl(p.email)}" style="color:#94a3b8">Never email me again</a>, or write to ${SITE.supportEmail}.</p>`,
  );
}

export function vendorInviteFor(p: {
  name: string;
  trade: string;
  city: string | null;
  email: string;
}) {
  const where = p.city ? ` in ${p.city}` : "";
  const trade = escapeHtml(p.trade.toLowerCase());
  return shell(
    "List your business free on GoDesi",
    `<p style="margin:0 0 12px">Namaste ${escapeHtml(p.name)},</p>
     <p style="margin:0 0 12px">We found your ${trade}${escapeHtml(where)} while building
     <b>GoDesi.com</b>, the free directory for the desi community in the USA. Desi families use it
     to find businesses, wedding vendors, events, classifieds and deals.</p>
     <p style="margin:0 0 12px">Your listing on GoDesi is <b>free</b>: your own page with photos,
     what you offer, a WhatsApp button so customers message you directly, and a QR code for your
     visiting card. There is no card to enter.</p>
     <p style="margin:0 0 12px"><a href="${siteUrl()}/post?type=business" style="color:#4f46e5;font-weight:700">List ${escapeHtml(p.name)} free →</a>
     It takes about four minutes.</p>
     <p style="margin:14px 0 0;font-size:12px;color:#94a3b8">We emailed you once because your ${trade} was listed in a public desi directory.
     <a href="${inviteOptOutUrl(p.email)}" style="color:#94a3b8">Never email me again</a>, or write to ${SITE.supportEmail}.</p>`,
  );
}

type Prospect = {
  id: string;
  name: string;
  trade: string;
  city: string | null;
  email: string | null;
};

const PROSPECT_SELECT = {
  id: true,
  name: true,
  trade: true,
  city: true,
  email: true,
} as const;

/** Sources the owner asked to reach first; everyone else follows oldest-first. */
const PRIORITY_SOURCES = ["deshvidesh.com"];

/**
 * One invite per prospect address, ever: organizers get "post your events
 * free", every other business gets "list your business free". Daily-capped,
 * honours the shared invite opt-out list, and an address shared by several
 * rows is mailed once and then marked on all of them.
 */
export async function sendOrganizerInvites() {
  if (!emailEnabled()) return { sent: 0, skipped: "email not configured" };

  const fresh = {
    email: { not: null },
    invitedAt: null,
    status: "NEW",
  } as const;
  const priority = await db.prospect.findMany({
    where: { ...fresh, source: { in: PRIORITY_SOURCES } },
    select: PROSPECT_SELECT,
    orderBy: { createdAt: "asc" },
    take: DAILY_LIMIT * 4,
  });
  const rest =
    priority.length >= DAILY_LIMIT * 4
      ? []
      : await db.prospect.findMany({
          where: { ...fresh, source: { notIn: PRIORITY_SOURCES } },
          select: PROSPECT_SELECT,
          orderBy: { createdAt: "asc" },
          take: DAILY_LIMIT * 4 - priority.length,
        });
  const prospects: Prospect[] = [...priority, ...rest];

  const optedOut = new Set(
    (
      await db.inviteOptOut.findMany({
        where: {
          emailCanonical: {
            in: prospects.map((p) => canonicalEmail(p.email!)),
          },
        },
        select: { emailCanonical: true },
      })
    ).map((row) => row.emailCanonical),
  );

  const seen = new Set<string>();
  const targets: (Prospect & { email: string })[] = [];
  for (const p of prospects) {
    if (!p.email) continue;
    const canonical = canonicalEmail(p.email);
    if (optedOut.has(canonical) || seen.has(canonical)) continue;
    seen.add(canonical);
    targets.push({ ...p, email: p.email });
    if (targets.length >= DAILY_LIMIT) break;
  }

  let sent = 0;
  for (const target of targets) {
    const claimed = await db.prospect.updateMany({
      where: { id: target.id, invitedAt: null },
      data: { invitedAt: new Date() },
    });
    if (!claimed.count) continue;
    await db.prospect.updateMany({
      where: {
        email: { equals: target.email, mode: "insensitive" },
        invitedAt: null,
      },
      data: { invitedAt: new Date() },
    });
    const organizer = ORGANIZER_TRADE.test(target.trade);
    const ok = await sendEmail({
      to: target.email,
      subject: organizer
        ? `${target.name} — post your desi events free on GoDesi`
        : `${target.name} — list your business free on GoDesi`,
      html: organizer ? inviteFor(target) : vendorInviteFor(target),
    });
    if (ok) sent += 1;
  }
  return { sent, considered: targets.length };
}
