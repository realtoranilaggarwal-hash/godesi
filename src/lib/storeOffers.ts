import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

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
  const offers = await db.storeOffer.findMany({
    where: liveStoreOfferWhere(),
    select: storeOfferSelect,
    orderBy: [
      { code: { sort: "asc", nulls: "last" } },
      { endsAt: { sort: "asc", nulls: "last" } },
    ],
    take: take * 3,
  });
  // One advertiser can post dozens; spread the space across stores.
  const perStore = new Map<string, number>();
  const picked: PublicStoreOffer[] = [];
  for (const offer of offers) {
    const count = perStore.get(offer.advertiserName) ?? 0;
    if (count >= 3) continue;
    perStore.set(offer.advertiserName, count + 1);
    picked.push(offer);
    if (picked.length >= take) break;
  }
  return picked;
}
