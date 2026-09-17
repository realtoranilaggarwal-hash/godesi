import { db } from "@/lib/db";
import { emailEnabled, sendEmail, shell } from "@/lib/email";
import { digestToken } from "@/lib/digest";
import { siteUrl } from "@/lib/format";
import { SITE } from "@/lib/site";

/**
 * Welcome tour on signup, then three follow-ups from a daily cron: day 2 (only
 * while the member has no card), day 5 (post something free) and day 14 (get
 * featured). `onboardingStep` records the last note sent so each goes once;
 * the digest opt-out silences the series too.
 */
const STEPS = [
  { step: 2, afterDays: 2 },
  { step: 3, afterDays: 5 },
  { step: 4, afterDays: 14 },
] as const;
const BATCH = 20;

function p(text: string) {
  return `<p style="margin:0 0 14px;color:#334155;line-height:1.6">${text}</p>`;
}

function button(href: string, label: string) {
  return `<p style="margin:0 0 16px"><a href="${href}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:12px">${label}</a></p>`;
}

function tour(base: string, items: [string, string, string][]) {
  return `<ul style="margin:0 0 16px;padding-left:18px;color:#334155;line-height:1.6">${items
    .map(
      ([emoji, text, path]) =>
        `<li style="margin:0 0 8px">${emoji} <a href="${base}${path}" style="color:#4f46e5;font-weight:700;text-decoration:none">${text.split("—")[0].trim()}</a> —${text.split("—").slice(1).join("—")}</li>`,
    )
    .join("")}</ul>`;
}

function footer(userId: string, base: string) {
  const unsubscribe = `${base}/unsubscribe?u=${userId}&t=${digestToken(userId)}`;
  return `<p style="margin:20px 0 0;color:#334155">Namaste,<br/>${SITE.name} team<br/><a href="mailto:${SITE.supportEmail}" style="color:#4f46e5">${SITE.supportEmail}</a></p>
  <p style="margin:18px 0 0;font-size:12px;color:#94a3b8">You get this because you joined Godesi. <a href="${unsubscribe}" style="color:#94a3b8">Unsubscribe from these emails</a>.</p>`;
}

function first(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

export function welcomeEmail({
  userId,
  name,
  foundingNumber,
}: {
  userId: string;
  name: string;
  foundingNumber: number | null;
}) {
  const base = siteUrl();
  const founding = foundingNumber
    ? p(
        `You are founding member <strong>#${foundingNumber}</strong> — that badge stays on your profile for good, your reward points count double, and you can switch on 90 days of free featured placement from your dashboard.`,
      )
    : "";
  const body =
    p(
      `Namaste ${first(name)}, welcome to Godesi — the desi community's own directory, events board and marketplace. Everything below is free to use:`,
    ) +
    tour(base, [
      [
        "💼",
        "Your business card — a page with photos, timings, WhatsApp button and a QR code you can print. Two minutes to set up.",
        "/dashboard/profile",
      ],
      [
        "🎉",
        "Events & tickets — post your event, sell tickets or take free RSVPs; we share it across the site.",
        "/events/new",
      ],
      [
        "🛠",
        "Gigs — sell a fixed-price service ($5–$100) or hire someone from the community.",
        "/gigs",
      ],
      [
        "🏠",
        "Rooms, property, buy & sell — list a room, a home or anything for sale.",
        "/post",
      ],
      [
        "🕉",
        "Temples, gurdwaras & mosques — find a place of worship near you.",
        "/religious",
      ],
      [
        "📰",
        "News & trending — desi headlines and what the community is talking about.",
        "/news",
      ],
      [
        "🎁",
        "Rewards — earn points for inviting friends and completing your profile; spend them on featured placement.",
        "/rewards",
      ],
    ]) +
    founding +
    button(`${base}/dashboard`, "Open my dashboard") +
    p(`Stuck on anything? Reply to this email — a real person reads it.`) +
    footer(userId, base);
  return {
    subject: `Welcome to Godesi, ${first(name)} — here's what you can do`,
    html: shell("Welcome to Godesi", body),
  };
}

function stepEmail(step: number, userId: string, name: string) {
  const base = siteUrl();
  if (step === 2) {
    return {
      subject: "Your free Godesi business card is waiting",
      html: shell(
        "Finish your card",
        p(
          `Namaste ${first(name)}, you joined Godesi but there is no card yet under your name. A card gives you a public page with your photos, timings, WhatsApp button and a printable QR code — and it stays free.`,
        ) +
          button(`${base}/dashboard/profile`, "Finish my card") +
          p(
            `Own a business that is already listed? Search for it and press "Claim this card" instead.`,
          ) +
          footer(userId, base),
      ),
    };
  }
  if (step === 3) {
    return {
      subject: "Post your first event, room or listing — free",
      html: shell(
        "Post something free",
        p(
          `Namaste ${first(name)}, everything on Godesi is free to post: an event with tickets or RSVPs, a room or property, something to sell, a job, or a gig you offer.`,
        ) +
          button(`${base}/post`, "Post now") +
          p(
            `Each post earns reward points, and events are also added to our RSS feeds and weekly digest so more people see them.`,
          ) +
          footer(userId, base),
      ),
    };
  }
  return {
    subject: "Get seen first on Godesi",
    html: shell(
      "Two weeks in",
      p(
        `Namaste ${first(name)}, you have been on Godesi two weeks. If you want more customers from it, featured placement puts your card at the top of your category and city, on the home page rotation and in a site banner.`,
      ) +
        button(`${base}/upgrade`, "See featured plans") +
        p(
          `Prefer to earn it? Invite friends from your rewards page and spend the points on featured placement instead.`,
        ) +
        footer(userId, base),
    ),
  };
}

/** Sends the welcome tour once, right after an account is created. */
export async function sendWelcomeEmail(userId: string) {
  if (!emailEnabled()) return false;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      name: true,
      foundingNumber: true,
      onboardingStep: true,
    },
  });
  if (!user || user.onboardingStep > 0) return false;
  const ok = await sendEmail({
    to: user.email,
    ...welcomeEmail({
      userId,
      name: user.name,
      foundingNumber: user.foundingNumber,
    }),
  });
  if (ok) {
    await db.user.update({
      where: { id: userId },
      data: { onboardingStep: 1 },
    });
  }
  return ok;
}

/** Daily: moves each member along the series when their day has come. */
export async function sendOnboardingSeries({ dryRun = false } = {}) {
  if (!emailEnabled()) return { sent: 0, skipped: "email not configured" };
  const now = Date.now();
  let sent = 0;
  let candidates = 0;

  for (const { step, afterDays } of STEPS) {
    const joinedBefore = new Date(now - afterDays * 24 * 60 * 60 * 1000);
    // eslint-disable-next-line no-await-in-loop
    const members = await db.user.findMany({
      where: {
        onboardingStep: step - 1,
        createdAt: { lte: joinedBefore },
        digestOptOutAt: null,
        bannedAt: null,
        emailVerifiedAt: { not: null },
      },
      orderBy: { createdAt: "asc" },
      take: 200,
      select: {
        id: true,
        email: true,
        name: true,
        business: { select: { id: true } },
      },
    });
    candidates += members.length;
    if (dryRun) continue;

    for (let start = 0; start < members.length; start += BATCH) {
      const batch = members.slice(start, start + BATCH);
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(
        batch.map(async (member) => {
          // The "finish your card" note only goes to members without a card.
          const skip = step === 2 && member.business !== null;
          const ok =
            skip ||
            (await sendEmail({
              to: member.email,
              ...stepEmail(step, member.id, member.name),
            }));
          if (!ok) return;
          if (!skip) sent += 1;
          await db.user.update({
            where: { id: member.id },
            data: { onboardingStep: step },
          });
        }),
      );
    }
  }

  return dryRun
    ? { sent: 0, wouldConsider: candidates }
    : { sent, considered: candidates };
}
