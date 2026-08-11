import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { sendEmail, shell, emailEnabled } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { newsPath } from "@/lib/newsLinks";

/** How far back the digest looks, and how many of each kind it carries. */
const WINDOW_DAYS = 7;
const PER_SECTION = 5;
/** Resend accepts a burst, but a slow drip keeps us well inside its limits. */
const BATCH = 20;

/**
 * Unsubscribe links are signed rather than stored: no extra column, and the
 * link cannot be guessed or edited to unsubscribe somebody else.
 */
export function digestToken(userId: string) {
  const secret = process.env.AUTH_SECRET ?? "";
  return createHmac("sha256", secret).update(`digest:${userId}`).digest("hex");
}

export function digestTokenValid(userId: string, token: string) {
  const expected = Buffer.from(digestToken(userId));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

type Item = { title: string; meta: string; url: string };

function section(title: string, items: Item[]) {
  if (!items.length) return "";
  const rows = items
    .map(
      (item) => `<li style="margin:0 0 10px">
        <a href="${item.url}" style="color:#4f46e5;font-weight:700;text-decoration:none">${item.title}</a>
        <div style="color:#64748b;font-size:13px">${item.meta}</div>
      </li>`,
    )
    .join("");
  return `<h2 style="margin:20px 0 8px;font-size:16px">${title}</h2><ul style="margin:0;padding-left:18px">${rows}</ul>`;
}

/** Everything worth telling members about from the last week. */
export async function digestContent() {
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const base = siteUrl();

  const [reports, events, businesses, listings] = await Promise.all([
    db.newsItem.findMany({
      where: {
        status: "PUBLISHED",
        submittedById: { not: null },
        publishedAt: { gte: since },
      },
      orderBy: { publishedAt: "desc" },
      take: PER_SECTION,
      select: { id: true, title: true, city: true, publishedAt: true },
    }),
    db.event.findMany({
      where: { status: "APPROVED", startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: PER_SECTION,
      select: { slug: true, title: true, city: true, startsAt: true },
    }),
    db.business.findMany({
      where: { status: "APPROVED", createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: PER_SECTION,
      select: { slug: true, name: true, city: true },
    }),
    db.listing.findMany({
      where: { status: "APPROVED", createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: PER_SECTION,
      select: { slug: true, title: true, city: true },
    }),
  ]);

  const body =
    section(
      "📰 From the community",
      reports.map((row) => ({
        title: row.title,
        meta: [row.city, row.publishedAt.toDateString()]
          .filter(Boolean)
          .join(" · "),
        url: `${base}${newsPath(row)}`,
      })),
    ) +
    section(
      "🎟️ Coming up",
      events.map((row) => ({
        title: row.title,
        meta: `${row.startsAt.toDateString()} · ${row.city}`,
        url: `${base}/events/${row.slug}`,
      })),
    ) +
    section(
      "🏪 New on Godesi",
      businesses.map((row) => ({
        title: row.name,
        meta: row.city,
        url: `${base}/b/${row.slug}`,
      })),
    ) +
    section(
      "🏠 Property, rooms and buy & sell",
      listings.map((row) => ({
        title: row.title,
        meta: row.city,
        url: `${base}/listings/${row.slug}`,
      })),
    );

  const count =
    reports.length + events.length + businesses.length + listings.length;
  return { body, count, reports, events, businesses, listings };
}

function emailFor(userId: string, name: string, body: string) {
  const base = siteUrl();
  const unsubscribe = `${base}/unsubscribe?u=${userId}&t=${digestToken(userId)}`;
  return shell(
    `Your week on Godesi`,
    `<p style="margin:0 0 4px">Hi ${name.split(" ")[0]},</p>
     <p style="margin:0 0 8px;color:#475569">Here's what the desi community posted this week.</p>
     ${body}
     <p style="margin:20px 0 0"><a href="${base}/post" style="background:#4f46e5;color:#fff;padding:10px 16px;border-radius:10px;text-decoration:none;font-weight:700">Post something yourself</a></p>
     <p style="margin:18px 0 0;font-size:12px;color:#94a3b8">You get this because you have a Godesi account. <a href="${unsubscribe}" style="color:#94a3b8">Unsubscribe from the weekly digest</a>.</p>`,
  );
}

/**
 * Sends the weekly digest to verified members who have not opted out. Nothing
 * is sent when there is no news worth an email.
 */
export async function sendWeeklyDigest({ dryRun = false } = {}) {
  if (!emailEnabled()) return { sent: 0, skipped: "email not configured" };

  const { body, count } = await digestContent();
  if (!count) return { sent: 0, skipped: "nothing new this week" };

  const sentAfter = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  const members = await db.user.findMany({
    where: {
      digestOptOutAt: null,
      bannedAt: null,
      emailVerifiedAt: { not: null },
      OR: [{ digestSentAt: null }, { digestSentAt: { lt: sentAfter } }],
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true },
  });

  if (dryRun) return { sent: 0, wouldSend: members.length, items: count };

  let sent = 0;
  for (let start = 0; start < members.length; start += BATCH) {
    const batch = members.slice(start, start + BATCH);
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(
      batch.map(async (member) => {
        const ok = await sendEmail({
          to: member.email,
          subject: "Your week on Godesi",
          html: emailFor(member.id, member.name, body),
        });
        if (!ok) return;
        sent += 1;
        await db.user.update({
          where: { id: member.id },
          data: { digestSentAt: new Date() },
        });
      }),
    );
  }

  return { sent, recipients: members.length, items: count };
}
