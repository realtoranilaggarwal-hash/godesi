import { db } from "@/lib/db";
import { cachedQuery } from "@/lib/cache";

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

/** US Eastern standard time, where most buyers are. */
const OFFSET_MS = 5 * 3_600_000;

/**
 * This month's half-price five-year code, e.g. HALF5NOV26. It stops working at
 * 23:59:59 Eastern on the last day of the month; the next month has its own.
 */
export function monthlyOfferWindow(now: Date = new Date()) {
  const eastern = new Date(now.getTime() - OFFSET_MS);
  const year = eastern.getUTCFullYear();
  const month = eastern.getUTCMonth();
  return {
    code: `HALF5${MONTHS[month]}${String(year).slice(2)}`,
    endsAt: new Date(Date.UTC(year, month + 1, 1) + OFFSET_MS - 1000),
  };
}

/**
 * Creates the code the first time a page asks for it this month, with the same
 * terms as HALF5: half off five-year Featured and the package, plus the
 * package's bonus years. A code an admin switched off stays off.
 */
const ensureMonthlyCoupon = cachedQuery(
  "monthly-offer",
  3600,
  async (code: string, endsAtIso: string) => {
    const coupon = await db.coupon.upsert({
      where: { code },
      update: {},
      create: {
        code,
        scope: "BUNDLE",
        discountKind: "PERCENT",
        amount: 50,
        bonusMonths: 48,
        publicOffer: true,
        expiresAt: new Date(endsAtIso),
      },
      select: { active: true, expiresAt: true },
    });
    return {
      active: coupon.active,
      expiresAt: coupon.expiresAt?.toISOString() ?? null,
    };
  },
);

export async function monthlyOffer(now: Date = new Date()) {
  const { code, endsAt } = monthlyOfferWindow(now);
  try {
    const coupon = await ensureMonthlyCoupon(code, endsAt.toISOString());
    const expiresAt = coupon.expiresAt ? new Date(coupon.expiresAt) : endsAt;
    if (!coupon.active || expiresAt.getTime() <= now.getTime()) return null;
    return { code, endsAt: expiresAt };
  } catch {
    return null;
  }
}
