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

function inviteFor(p: { name: string; trade: string; city: string | null; email: string }) {
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

/**
 * One gentle "post your events free" invite per organizer-type prospect, ever.
 * Daily-capped and honouring the shared invite opt-out list.
 */
export async function sendOrganizerInvites() {
  if (!emailEnabled()) return { sent: 0, skipped: "email not configured" };

  const prospects = await db.prospect.findMany({
    where: {
      email: { not: null },
      invitedAt: null,
      status: "NEW",
    },
    select: { id: true, name: true, trade: true, city: true, email: true },
    orderBy: { createdAt: "asc" },
    take: DAILY_LIMIT * 4, // over-fetch: trade + opt-out filters drop many
  });

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

  const targets = prospects
    .filter(
      (p) =>
        p.email &&
        ORGANIZER_TRADE.test(p.trade) &&
        !optedOut.has(canonicalEmail(p.email)),
    )
    .slice(0, DAILY_LIMIT);

  let sent = 0;
  for (const target of targets) {
    const claimed = await db.prospect.updateMany({
      where: { id: target.id, invitedAt: null },
      data: { invitedAt: new Date() },
    });
    if (!claimed.count) continue;
    const ok = await sendEmail({
      to: target.email!,
      subject: `${target.name} — post your desi events free on GoDesi`,
      html: inviteFor(target as { name: string; trade: string; city: string | null; email: string }),
    });
    if (ok) sent += 1;
  }
  return { sent, considered: targets.length };
}
