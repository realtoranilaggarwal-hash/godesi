import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { dealOfTheDay } from "@/lib/dealOfTheDay";
import { emailEnabled, sendEmail, shell } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { dailySky } from "@/lib/horoscope";
import { RASHIS } from "@/lib/kundliSigns";
import {
  DEFAULT_PANCHANG_CITY,
  computePanchang,
  panchangTime,
} from "@/lib/panchang";

const BATCH = 20;

/**
 * Most a single morning sends. Resend's free plan allows about 100 emails a
 * day in total, and sign-in codes need some of that.
 */
function dailyCap() {
  const value = Number(process.env.MORNING_EMAIL_DAILY_CAP);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 60;
}

export function morningToken(userId: string) {
  const secret = process.env.AUTH_SECRET ?? "";
  return createHmac("sha256", secret).update(`morning:${userId}`).digest("hex");
}

export function morningTokenValid(userId: string, token: string) {
  const expected = Buffer.from(morningToken(userId));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

const escape = (value: string) =>
  value.replace(
    /[&<>"]/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char] ?? char,
  );

/** The shared part of the morning email: panchang, sky, deal of the day, events. */
export async function morningContent(now = new Date()) {
  const base = siteUrl();
  const city = DEFAULT_PANCHANG_CITY;
  const sky = dailySky(now);
  const panchang = computePanchang(city, sky.date);
  const [{ deal, offer }, events] = await Promise.all([
    dealOfTheDay(now),
    db.event.findMany({
      where: { status: "APPROVED", startsAt: { gte: now } },
      orderBy: { startsAt: "asc" },
      take: 3,
      select: { slug: true, title: true, city: true, startsAt: true },
    }),
  ]);

  const tz = city.timeZone;
  const panchangHtml = panchang
    ? `<h2 style="margin:16px 0 6px;font-size:16px">🪔 Panchang · ${city.name}</h2>
      ${panchang.observances.length ? `<p style="margin:0 0 6px;font-weight:700;color:#c2410c">🙏 Today: ${escape(panchang.observances.join(" · "))}</p>` : ""}
      <p style="margin:0;line-height:1.6">
        Tithi: <b>${panchang.tithi.paksha} ${panchang.tithi.name}</b><br>
        Nakshatra: <b>${panchang.nakshatra.name}</b><br>
        Sunrise ${panchangTime(panchang.sunrise, tz)} · Sunset ${panchangTime(panchang.sunset, tz)}<br>
        ⛔ Rahu Kaal: ${panchangTime(panchang.rahuKaal.start, tz)} – ${panchangTime(panchang.rahuKaal.end, tz)}
      </p>
      <p style="margin:6px 0 0"><a href="${base}/astrology/panchang" style="color:#4f46e5">Panchang for your own city →</a></p>`
    : "";

  const skyHtml = `<h2 style="margin:16px 0 6px;font-size:16px">🌙 Today's horoscope</h2>
    <p style="margin:0">The Moon is in <b>${RASHIS[sky.moonSign].name}</b> (${RASHIS[sky.moonSign].english}).
    <a href="${base}/astrology/horoscope" style="color:#4f46e5">Read your rashi's day →</a></p>`;

  const dealRows = [
    deal
      ? `<li style="margin:0 0 8px"><a href="${base}/b/${deal.business.slug}" style="color:#4f46e5;font-weight:700;text-decoration:none">${escape(deal.title)}</a><div style="color:#64748b;font-size:13px">${escape(deal.business.name)} · ${escape(deal.business.city)}${deal.code ? ` · code <b>${escape(deal.code)}</b>` : ""}</div></li>`
      : "",
    offer
      ? `<li style="margin:0 0 8px"><a href="${base}/api/offers/${offer.id}/click" style="color:#4f46e5;font-weight:700;text-decoration:none">${escape(offer.title)}</a><div style="color:#64748b;font-size:13px">${escape(offer.advertiserName)}${offer.code ? ` · code <b>${escape(offer.code)}</b>` : ""} · paid link</div></li>`
      : "",
  ].join("");
  const dealHtml = dealRows
    ? `<h2 style="margin:16px 0 6px;font-size:16px">⏰ Deal of the day</h2><ul style="margin:0;padding-left:18px">${dealRows}</ul>`
    : "";

  const eventHtml = events.length
    ? `<h2 style="margin:16px 0 6px;font-size:16px">🎟️ Coming up</h2><ul style="margin:0;padding-left:18px">${events
        .map(
          (event) =>
            `<li style="margin:0 0 8px"><a href="${base}/events/${event.slug}" style="color:#4f46e5;font-weight:700;text-decoration:none">${escape(event.title)}</a><div style="color:#64748b;font-size:13px">${event.startsAt.toDateString()} · ${escape(event.city)}</div></li>`,
        )
        .join("")}</ul>`
    : "";

  return {
    day: sky.date,
    subject: `${sky.dateLabel.split(",").slice(0, 2).join(",")}: panchang, horoscope & deal of the day`,
    body: panchangHtml + skyHtml + dealHtml + eventHtml,
  };
}

function emailFor(userId: string, name: string, body: string) {
  const base = siteUrl();
  const unsubscribe = `${base}/unsubscribe?m=${userId}&t=${morningToken(userId)}`;
  return shell(
    "Good morning from GoDesi ☀️",
    `<p style="margin:0 0 4px">Hi ${escape(name.split(" ")[0] ?? "")},</p>
     ${body}
     <p style="margin:18px 0 0;font-size:12px;color:#94a3b8">You asked for this morning email on GoDesi. <a href="${unsubscribe}" style="color:#94a3b8">Stop the morning email</a>.</p>`,
  );
}

/** Sends today's morning email to members who switched it on, once per day each. */
export async function sendMorningEmails({ dryRun = false } = {}) {
  if (!emailEnabled()) return { sent: 0, skipped: "email not configured" };

  const { day, subject, body } = await morningContent();
  const members = await db.user.findMany({
    where: {
      morningEmailAt: { not: null },
      bannedAt: null,
      emailVerifiedAt: { not: null },
      OR: [{ morningSentDay: null }, { morningSentDay: { not: day } }],
    },
    orderBy: { morningEmailAt: "asc" },
    take: dailyCap(),
    select: { id: true, email: true, name: true },
  });

  if (dryRun) return { sent: 0, wouldSend: members.length, day };

  let sent = 0;
  for (let start = 0; start < members.length; start += BATCH) {
    const batch = members.slice(start, start + BATCH);
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(
      batch.map(async (member) => {
        const ok = await sendEmail({
          to: member.email,
          subject,
          html: emailFor(member.id, member.name, body),
        });
        if (!ok) return;
        sent += 1;
        await db.user.update({
          where: { id: member.id },
          data: { morningSentDay: day },
        });
      }),
    );
  }
  return { sent, recipients: members.length, day };
}
