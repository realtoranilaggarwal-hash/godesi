import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { siteUrl } from "@/lib/format";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Daily (see vercel.json): each imported calendar that has an organiser email
 * gets a "claim your listings" invite at most once every 30 days, while it
 * still has upcoming unclaimed events on GoDesi.
 */
function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

const RESEND_AFTER_MS = 30 * 24 * 60 * 60 * 1000;

async function run() {
  const cutoff = new Date(Date.now() - RESEND_AFTER_MS);
  const sources = await db.eventSource.findMany({
    where: {
      active: true,
      contactEmail: { not: null },
      OR: [{ claimInviteSentAt: null }, { claimInviteSentAt: { lt: cutoff } }],
    },
    select: { id: true, name: true, contactEmail: true },
  });

  let sent = 0;
  const results: { source: string; events: number; sent: boolean }[] = [];
  for (const source of sources) {
    const events = await db.event.findMany({
      where: {
        sourceId: source.id,
        startsAt: { gt: new Date() },
        claimedAt: null,
      },
      orderBy: { startsAt: "asc" },
      take: 5,
      select: { title: true, slug: true, startsAt: true },
    });
    if (!events.length) continue;

    const list = events
      .map(
        (event) =>
          `<li><a href="${siteUrl()}/events/${event.slug}">${event.title}</a> — ${event.startsAt.toDateString()}</li>`,
      )
      .join("");
    const ok = await sendEmail({
      to: source.contactEmail!,
      subject: `${source.name} — your events are on GoDesi (claim them free)`,
      html: `
        <p>Namaste,</p>
        <p>Your events are listed on <b>GoDesi.com</b>, the desi community
        directory, and visitors can RSVP there — we share the guest list with
        you.</p>
        <p>Upcoming listings:</p><ul>${list}</ul>
        <p><b>Claim your events free</b> to edit details, post updates and take
        bookings or ticket sales directly:</p>
        <ol>
          <li>Create a free account at <a href="${siteUrl()}/join">${siteUrl()}/join</a></li>
          <li>Open any event page above and tap <b>"Is this your event? Claim it"</b></li>
          <li>We verify it is really you, then the page is yours</li>
        </ol>
        <p>Questions? Just reply to this email.</p>
        <p>— Team GoDesi</p>`,
    });
    if (ok) {
      sent += 1;
      await db.eventSource.update({
        where: { id: source.id },
        data: { claimInviteSentAt: new Date() },
      });
    }
    results.push({ source: source.name, events: events.length, sent: ok });
  }
  return NextResponse.json({ ok: true, sent, results });
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return run();
}
