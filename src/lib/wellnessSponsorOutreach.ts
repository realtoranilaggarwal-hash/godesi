import { db } from "@/lib/db";
import { emailEnabled, escapeHtml, sendEmail, shell } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { canonicalEmail, inviteOptOutUrl } from "@/lib/invites";
import { SITE } from "@/lib/site";
import { WELLNESS_EBOOK_PATH, WELLNESS_PATH } from "@/lib/wellness";

/** Trades that fit a wellness sponsorship best; they are mailed first. */
const WELLNESS_TRADE =
  /yoga|ayurved|wellness|health|herbal|organic|spa|massage|meditat|naturopath|chiropract|physio|nutrition|diet|grocery|spice|tea|pharmac|fitness|gym/i;

/**
 * Off (0) until WELLNESS_SPONSOR_DAILY_CAP is set: Resend's free tier is about
 * 100/day and the morning email plus organizer invites already use most of it.
 */
function dailyCap() {
  const value = Number(process.env.WELLNESS_SPONSOR_DAILY_CAP);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

export function wellnessSponsorHtml(p: { name: string; trade: string; city: string | null; email: string }) {
  const base = siteUrl();
  const where = p.city ? ` in ${escapeHtml(p.city)}` : "";
  const trade = escapeHtml(p.trade.toLowerCase());
  return shell(
    "Sponsor GoDesi Natural Healing & Wellness 🌿",
    `<p style="margin:0 0 12px">Namaste ${escapeHtml(p.name)},</p>
     <p style="margin:0 0 12px">We found your ${trade}${where} in a public desi directory. GoDesi.com — the
     desi community directory for the USA — has just opened
     <a href="${base}${WELLNESS_PATH}" style="color:#4f46e5;font-weight:700">Natural Healing &amp; Wellness</a>:
     ten educational articles on traditional Indian home wisdom (tamra jal, ginger, haldi, pranayama and more)
     read by desi families every day.</p>
     <p style="margin:0 0 12px">We are taking a small number of sponsors for the section:</p>
     <ul style="margin:0 0 12px;padding-left:18px">
       <li style="margin:0 0 6px"><b>Section sponsor</b> — your name and logo on the wellness landing page and articles.</li>
       <li style="margin:0 0 6px"><b>Product placement</b> — your wellness product in the recommended-products blocks (clearly marked, with click tracking you can see).</li>
     </ul>
     <p style="margin:0 0 12px">Reply to this email or write to ${SITE.supportEmail} and we will send rates.</p>
     <p style="margin:0 0 12px">And a gift for your customers and team: anyone who joins GoDesi free gets our
     <a href="${base}${WELLNESS_EBOOK_PATH}" style="color:#4f46e5;font-weight:700">Natural Healing ebook — Traditional Indian Wisdom for Modern Living</a>.</p>
     <p style="margin:14px 0 0;font-size:12px;color:#94a3b8">We emailed you once because your ${trade} was listed in a public desi directory.
     <a href="${inviteOptOutUrl(p.email)}" style="color:#94a3b8">Never email me again</a>, or write to ${SITE.supportEmail}.</p>`,
  );
}

type Target = { id: string; name: string; trade: string; city: string | null; email: string };

const SELECT = { id: true, name: true, trade: true, city: true, email: true } as const;

/**
 * One wellness-sponsor pitch per never-contacted prospect address, daily-capped,
 * honouring the shared invite opt-out list (same pattern as sendOrganizerInvites).
 * Wellness trades go first. Claiming sets invitedAt, so the address is never
 * cold-mailed again by the other invite senders.
 */
export async function sendWellnessSponsorOutreach() {
  const cap = dailyCap();
  if (!cap) return { sent: 0, skipped: "WELLNESS_SPONSOR_DAILY_CAP not set" };
  if (!emailEnabled()) return { sent: 0, skipped: "email not configured" };

  const fresh = { email: { not: null }, invitedAt: null, status: "NEW" } as const;
  const pool = await db.prospect.findMany({
    where: fresh,
    select: SELECT,
    orderBy: { createdAt: "asc" },
    take: cap * 20,
  });
  const prospects = [
    ...pool.filter((p) => WELLNESS_TRADE.test(p.trade)),
    ...pool.filter((p) => !WELLNESS_TRADE.test(p.trade)),
  ];

  const optedOut = new Set(
    (
      await db.inviteOptOut.findMany({
        where: { emailCanonical: { in: prospects.map((p) => canonicalEmail(p.email!)) } },
        select: { emailCanonical: true },
      })
    ).map((row) => row.emailCanonical),
  );

  const seen = new Set<string>();
  const targets: Target[] = [];
  for (const p of prospects) {
    if (!p.email) continue;
    const canonical = canonicalEmail(p.email);
    if (optedOut.has(canonical) || seen.has(canonical)) continue;
    seen.add(canonical);
    targets.push({ ...p, email: p.email });
    if (targets.length >= cap) break;
  }

  let sent = 0;
  for (const target of targets) {
    const now = new Date();
    const claimed = await db.prospect.updateMany({
      where: { id: target.id, invitedAt: null },
      data: { invitedAt: now, wellnessPitchedAt: now },
    });
    if (!claimed.count) continue;
    await db.prospect.updateMany({
      where: { email: { equals: target.email, mode: "insensitive" }, invitedAt: null },
      data: { invitedAt: now, wellnessPitchedAt: now },
    });
    const ok = await sendEmail({
      to: target.email,
      subject: `${target.name} — sponsor GoDesi Natural Healing & Wellness`,
      html: wellnessSponsorHtml(target),
    });
    if (ok) sent += 1;
  }
  return { sent, considered: targets.length };
}
