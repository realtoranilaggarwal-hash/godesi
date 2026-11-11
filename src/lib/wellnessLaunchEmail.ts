import { db } from "@/lib/db";
import { emailEnabled, escapeHtml, sendEmail, shell } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { morningToken } from "@/lib/morningEmail";
import { WELLNESS_EBOOK_PATH, WELLNESS_PATH, activeEbook } from "@/lib/wellness";

const BATCH = 20;

export const WELLNESS_LAUNCH_SUBJECT =
  "Free gift: Natural Healing ebook — Traditional Indian Wisdom for Modern Living";

/**
 * Most a single run sends. Off (0) until WELLNESS_LAUNCH_DAILY_CAP is set, so
 * the campaign never eats into the Resend budget the morning email and
 * sign-in codes rely on before the owner switches it on.
 */
function dailyCap() {
  const value = Number(process.env.WELLNESS_LAUNCH_DAILY_CAP);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

export function wellnessLaunchHtml(userId: string, name: string) {
  const base = siteUrl();
  const unsubscribe = `${base}/unsubscribe?m=${userId}&t=${morningToken(userId)}`;
  const first = name.trim().split(/\s+/)[0] || "there";
  return shell(
    "🎁 A New Year gift for you",
    `<p style="margin:0 0 12px">Namaste ${escapeHtml(first)},</p>
     <p style="margin:0 0 12px">Happy New Year from all of us at GoDesi! As a thank-you for being a member,
     your free ebook <b>Natural Healing — Traditional Indian Wisdom for Modern Living</b> is ready.</p>
     <p style="margin:0 0 12px">It gathers the home habits many of us grew up with — copper water (tamra jal),
     ginger, haldi, honey, a warm compress, a walk after meals, pranayama — and explains each one in plain
     language, with what modern research says and the safety notes to know first.</p>
     <p style="margin:0 0 16px"><a href="${base}${WELLNESS_EBOOK_PATH}" style="display:inline-block;background:#047857;color:#fff;font-weight:700;padding:10px 18px;border-radius:999px;text-decoration:none">Download your free ebook →</a></p>
     <p style="margin:0 0 12px">You can also read all ten articles free in the new
     <a href="${base}${WELLNESS_PATH}" style="color:#4f46e5;font-weight:700">Natural Healing &amp; Wellness</a> section.</p>
     <p style="margin:0 0 12px;font-size:12px;color:#64748b">Educational purposes only — not medical advice.
     Please consult a qualified healthcare professional before trying any new remedy or practice.</p>
     <p style="margin:18px 0 0;font-size:12px;color:#94a3b8">You are getting this because you are a GoDesi member.
     <a href="${unsubscribe}" style="color:#94a3b8">Unsubscribe from GoDesi emails</a>.</p>`,
  );
}

/**
 * The one-time New Year ebook email: every verified, non-banned member who has
 * not opted out of the morning email gets it once, a daily-capped slice per run
 * (same batching and claim-first pattern as sendMorningEmails).
 */
export async function sendWellnessLaunchEmails({ dryRun = false } = {}) {
  const cap = dailyCap();
  if (!cap) return { sent: 0, skipped: "WELLNESS_LAUNCH_DAILY_CAP not set" };
  if (!emailEnabled()) return { sent: 0, skipped: "email not configured" };
  if (!(await activeEbook())) return { sent: 0, skipped: "no active ebook" };

  const where = {
    morningOptOutAt: null,
    bannedAt: null,
    emailVerifiedAt: { not: null },
    wellnessLaunchSentAt: null,
  } as const;
  const members = await db.user.findMany({
    where,
    orderBy: { createdAt: "asc" },
    take: cap,
    select: { id: true, email: true, name: true },
  });

  if (dryRun) return { sent: 0, wouldSend: members.length };

  let sent = 0;
  for (let start = 0; start < members.length; start += BATCH) {
    const batch = members.slice(start, start + BATCH);
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(
      batch.map(async (member) => {
        // Claim first, so an overlapping run skips them.
        const claimed = await db.user.updateMany({
          where: { id: member.id, wellnessLaunchSentAt: null },
          data: { wellnessLaunchSentAt: new Date() },
        });
        if (!claimed.count) return;
        const ok = await sendEmail({
          to: member.email,
          subject: WELLNESS_LAUNCH_SUBJECT,
          html: wellnessLaunchHtml(member.id, member.name),
        });
        if (ok) {
          sent += 1;
          return;
        }
        await db.user.updateMany({
          where: { id: member.id },
          data: { wellnessLaunchSentAt: null },
        });
      }),
    );
  }
  return { sent, recipients: members.length };
}
