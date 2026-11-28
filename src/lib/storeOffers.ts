import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { CONTENT_TTL, cachedQuery } from "@/lib/cache";

export function liveStoreOfferWhere(
  now = new Date(),
): Prisma.StoreOfferWhereInput {
  return {
    active: true,
    hidden: false,
    AND: [
      { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
    ],
  };
}

export const storeOfferSelect = {
  id: true,
  advertiserName: true,
  title: true,
  description: true,
  code: true,
  endsAt: true,
} satisfies Prisma.StoreOfferSelect;

export type PublicStoreOffer = Prisma.StoreOfferGetPayload<{
  select: typeof storeOfferSelect;
}>;

/** Coupons first, then whatever ends soonest, so a page shows the most useful few. */
export async function liveStoreOffers(take = 24): Promise<PublicStoreOffer[]> {
  const query = (source: Prisma.StoreOfferWhereInput["source"]) =>
    db.storeOffer.findMany({
      where: { ...liveStoreOfferWhere(), source },
      select: storeOfferSelect,
      orderBy: [
        { code: { sort: "asc", nulls: "last" } },
        { endsAt: { sort: "asc", nulls: "last" } },
      ],
      take: take * 3,
    });
  // Offers the owner adds by hand (e.g. Temu) come before the CJ feed,
  // which has hundreds of rows and would otherwise crowd them out.
  const [own, feed] = await Promise.all([
    query({ not: "CJ" }),
    query("CJ"),
  ]);
  const offers = [...own, ...feed];
  // One advertiser can post dozens in the feed; spread the space across stores.
  // Hand-picked offers always show, and count toward their store's share.
  const perStore = new Map<string, number>();
  const picked: PublicStoreOffer[] = [];
  for (let index = 0; index < offers.length; index += 1) {
    const offer = offers[index];
    const count = perStore.get(offer.advertiserName) ?? 0;
    if (count >= 3 && index >= own.length) continue;
    perStore.set(offer.advertiserName, count + 1);
    picked.push(offer);
    if (picked.length >= take) break;
  }
  return picked;
}

const cachedOffers = cachedQuery("live-store-offers", CONTENT_TTL, (take: number) =>
  liveStoreOffers(take),
);

/** liveStoreOffers for public pages, read from the database once a minute. */
export async function cachedLiveStoreOffers(take = 24) {
  return (await cachedOffers(take)).map((offer) => ({
    ...offer,
    endsAt: offer.endsAt ? new Date(offer.endsAt) : null,
  }));
}
