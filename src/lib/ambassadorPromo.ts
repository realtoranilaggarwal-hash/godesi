import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/db";

/**
 * Ambassador event promotion: tracked links (godesi.com/r/<code>), click
 * counts and ticket attribution. Event/community marketing only — never used
 * for mortgage, real-estate settlement or insurance referrals. Benefits are
 * non-cash and must be reviewed by compliance personnel before launch.
 */

/** 30 days: long enough for someone to come back and buy later. */
export const PROMO_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function promoCookieName(eventId: string) {
  return `gd_promo_${eventId}`;
}

export function normalizePromoCode(value: unknown) {
  const code = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "");
  return code.length >= 3 && code.length <= 40 ? code : null;
}

export function ambassadorPromoCode(ambassador: {
  id: string;
  certificateNo: number | null;
}) {
  return ambassador.certificateNo !== null
    ? `GD-${ambassador.certificateNo}`
    : `GD-${ambassador.id.slice(-6).toUpperCase()}`;
}

/** A campaign code: the ambassador's code plus four random characters. */
export function newCampaignCode(promoCode: string) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const suffix = Array.from(randomBytes(4), (byte) => alphabet[byte % alphabet.length]).join("");
  return `${promoCode}-${suffix}`;
}

/** Same salted IP + user-agent hash pattern as site votes; raw IPs are never stored. */
export function visitorHash(ip: string, userAgent: string) {
  return createHash("sha256").update(`ambassador-click|${ip}|${userAgent}`).digest("hex");
}

/**
 * The campaign a booking should be credited to, if the code is live for this
 * event and its ambassador is approved. Ambassadors' own bookings don't count.
 */
export async function resolveAmbassadorPromo({
  code,
  eventId,
  buyerId,
}: {
  code: unknown;
  eventId: string;
  buyerId: string;
}) {
  const clean = normalizePromoCode(code);
  if (!clean) return null;
  const campaign = await db.ambassadorPromoEvent.findUnique({
    where: { code: clean },
    select: {
      code: true,
      eventId: true,
      active: true,
      ambassador: { select: { id: true, userId: true, status: true } },
    },
  });
  if (
    !campaign ||
    !campaign.active ||
    campaign.eventId !== eventId ||
    campaign.ambassador.status !== "APPROVED" ||
    campaign.ambassador.userId === buyerId
  )
    return null;
  return { ambassadorId: campaign.ambassador.id, code: campaign.code };
}

export type PromoStats = {
  clicks: number;
  visitors: number;
  /** Ticket rows started through the link (any status but cancelled). */
  bookings: number;
  /** Seats on confirmed tickets — free RSVPs included. */
  verifiedSeats: number;
  /** Confirmed paid tickets. */
  paidSeats: number;
  salesMinor: number;
};

const EMPTY: PromoStats = {
  clicks: 0,
  visitors: 0,
  bookings: 0,
  verifiedSeats: 0,
  paidSeats: 0,
  salesMinor: 0,
};

/** Clicks and attributed ticket totals for each campaign code. */
export async function promoStats(campaigns: { id: string; code: string }[]) {
  const stats = new Map<string, PromoStats>(
    campaigns.map((campaign) => [campaign.code, { ...EMPTY }]),
  );
  if (!campaigns.length) return stats;
  const idToCode = new Map(campaigns.map((campaign) => [campaign.id, campaign.code]));

  const [clicks, tickets] = await Promise.all([
    db.$queryRaw<{ promoEventId: string; clicks: bigint; visitors: bigint }[]>`
      SELECT "promoEventId", COUNT(*) AS clicks, COUNT(DISTINCT "visitorHash") AS visitors
      FROM "AmbassadorClick"
      WHERE "promoEventId" = ANY(${campaigns.map((campaign) => campaign.id)})
      GROUP BY 1`,
    db.ticket.groupBy({
      by: ["promoCode", "status"],
      where: {
        promoCode: { in: campaigns.map((campaign) => campaign.code) },
        status: { not: "CANCELLED" },
      },
      _count: { _all: true },
      _sum: { quantity: true },
    }),
  ]);
  const paid = await db.ticket.groupBy({
    by: ["promoCode"],
    where: {
      promoCode: { in: campaigns.map((campaign) => campaign.code) },
      status: "CONFIRMED",
      amountMinor: { gt: 0 },
    },
    _sum: { quantity: true, amountMinor: true },
  });

  for (const row of clicks) {
    const entry = stats.get(idToCode.get(row.promoEventId) ?? "");
    if (!entry) continue;
    entry.clicks = Number(row.clicks);
    entry.visitors = Number(row.visitors);
  }
  for (const row of tickets) {
    const entry = row.promoCode ? stats.get(row.promoCode) : undefined;
    if (!entry) continue;
    entry.bookings += row._count._all;
    if (row.status === "CONFIRMED") entry.verifiedSeats += row._sum.quantity ?? 0;
  }
  for (const row of paid) {
    const entry = row.promoCode ? stats.get(row.promoCode) : undefined;
    if (!entry) continue;
    entry.paidSeats = row._sum.quantity ?? 0;
    entry.salesMinor = row._sum.amountMinor ?? 0;
  }
  return stats;
}

/** Distinct visitors per ambassador across the given campaign links. */
export async function uniqueVisitorsByAmbassador(promoEventIds: string[]) {
  const result = new Map<string, number>();
  if (!promoEventIds.length) return result;
  const rows = await db.$queryRaw<{ ambassadorId: string; visitors: bigint }[]>`
    SELECT pe."ambassadorId", COUNT(DISTINCT c."visitorHash") AS visitors
    FROM "AmbassadorClick" c
    JOIN "AmbassadorPromoEvent" pe ON pe."id" = c."promoEventId"
    WHERE c."promoEventId" = ANY(${promoEventIds})
    GROUP BY 1`;
  for (const row of rows) result.set(row.ambassadorId, Number(row.visitors));
  return result;
}

/** Totals across campaigns; `visitors` is a per-link sum, so replace it with uniqueVisitorsByAmbassador. */
export function sumStats(list: PromoStats[]): PromoStats {
  return list.reduce(
    (total, item) => ({
      clicks: total.clicks + item.clicks,
      visitors: total.visitors + item.visitors,
      bookings: total.bookings + item.bookings,
      verifiedSeats: total.verifiedSeats + item.verifiedSeats,
      paidSeats: total.paidSeats + item.paidSeats,
      salesMinor: total.salesMinor + item.salesMinor,
    }),
    { ...EMPTY },
  );
}

/** Benefit is earned once verified seats reach the campaign target. */
export function benefitEarned(
  campaign: { benefit: string | null; rewardTickets: number | null },
  stats: PromoStats,
) {
  return Boolean(
    campaign.benefit &&
      campaign.rewardTickets !== null &&
      stats.verifiedSeats >= campaign.rewardTickets,
  );
}
