import { db } from "@/lib/db";
import { dealSelect, liveDealWhere } from "@/lib/deals";
import { HOROSCOPE_ZONE } from "@/lib/horoscope";
import { todayIn } from "@/lib/panchang";
import { liveStoreOfferWhere, storeOfferSelect } from "@/lib/storeOffers";

/** Steps through the list one per day, so tomorrow never repeats today. */
const pick = <T>(rows: T[], day: string) =>
  rows.length
    ? rows[
        Math.floor(Date.parse(`${day}T00:00:00Z`) / 86_400_000) % rows.length
      ]
    : null;

/**
 * One business deal and one store coupon per GoDesi day (New York date): the
 * same pick for everyone all day, a different one tomorrow.
 */
export async function dealOfTheDay(now = new Date()) {
  const day = todayIn(HOROSCOPE_ZONE, now);
  const [deals, offers] = await Promise.all([
    db.deal.findMany({
      where: { ...liveDealWhere(now), business: { status: "APPROVED" } },
      orderBy: { id: "asc" },
      take: 200,
      select: dealSelect,
    }),
    db.storeOffer.findMany({
      where: { ...liveStoreOfferWhere(now), code: { not: null } },
      orderBy: { id: "asc" },
      take: 200,
      select: storeOfferSelect,
    }),
  ]);
  return { day, deal: pick(deals, day), offer: pick(offers, day) };
}
