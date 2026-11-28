/**
 * Pins Anil's Black Friday CJ travel links (plus an Amazon massage-equipment link) to the top of /deals and /shop (source
 * "PINNED", which the CJ sync never retires) and rotates the LEVEL8 450x75 banner in
 * the FULLBANNER slot. These links are not in the CJ deals feed, so advertiser details
 * come from CJ Link Search. Re-runnable; re-runs never touch "hidden".
 *
 *   DATABASE_URL=... npx tsx scripts/add-black-friday-travel-offers.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const SOURCE = "PINNED";
/** End of Cyber Monday, Dec 1 2026 (ET). */
const LEVEL8_ENDS = new Date("2026-12-02T04:59:59Z");

const OFFERS = [
  {
    externalId: "17376653",
    advertiserId: "6087891",
    advertiserName: "LEVEL8 Luggage",
    title: "LEVEL8 Black Friday sale: 20% off luggage and travel essentials",
    description: "Carry-ons, checked luggage and travel accessories, 20% off for Black Friday. T&Cs apply.",
    category: "Luggage",
    promotionType: "sale",
    clickUrl: "https://www.tkqlhce.com/click-101917857-17376653",
    endsAt: LEVEL8_ENDS,
  },
  {
    externalId: "14456479",
    advertiserId: "4861280",
    advertiserName: "Orbitz",
    title: "Orbitz weekly deals: last-minute hotels, flights, vacations and car rentals",
    description: "Fresh travel deals every week on Orbitz. T&Cs apply.",
    category: "Travel",
    promotionType: "sale",
    clickUrl: "https://www.tkqlhce.com/click-101917857-14456479",
    endsAt: null,
  },
  {
    externalId: "17061683",
    advertiserId: "4368684",
    advertiserName: "Trip.com",
    title: "Trip.com deals of the week (Spain site, prices in euros)",
    description: "Weekly hotel and flight deals on Trip.com's Spanish site. T&Cs apply.",
    category: "Travel",
    promotionType: "sale",
    clickUrl: "https://www.anrdoezrs.net/click-101917857-17061683",
    endsAt: null,
  },
  {
    externalId: "amazon-massage-equipment",
    advertiserId: "amazon",
    advertiserName: "Amazon",
    title: "Professional massage equipment on Amazon, lowest prices first",
    description: "Massage tables, chairs, guns and spa tools for therapists and salons. As an Amazon Associate GoDesi earns from qualifying purchases.",
    category: "Beauty",
    promotionType: "sale",
    clickUrl: "https://link.amazon/B0dNLfbWM",
    endsAt: null,
  },
];

const BANNER = {
  slot: "FULLBANNER" as const,
  title: "LEVEL8 Black Friday 2026 sale: 20% off luggage and travel essentials",
  imageUrl: "https://www.awltovhc.com/image-101917857-17376653",
  linkUrl: "https://www.tkqlhce.com/click-101917857-17376653",
  endsAt: LEVEL8_ENDS,
};

async function main() {
  for (const offer of OFFERS) {
    const where = { source_externalId: { source: SOURCE, externalId: offer.externalId } };
    const data = { ...offer, code: null, active: true, syncedAt: new Date() };
    const row = await db.storeOffer.upsert({
      where,
      update: data,
      create: { source: SOURCE, ...data },
      select: { advertiserName: true, endsAt: true, hidden: true },
    });
    console.log(offer.externalId, row.advertiserName, "ends", row.endsAt?.toISOString() ?? "never", row.hidden ? "(hidden)" : "");
  }

  const existing = await db.banner.findFirst({ where: { imageUrl: BANNER.imageUrl }, select: { id: true } });
  if (existing) {
    await db.banner.update({ where: { id: existing.id }, data: { ...BANNER, active: true, status: "ACTIVE" } });
    console.log("updated banner", BANNER.slot);
  } else {
    const last = await db.banner.aggregate({ where: { slot: BANNER.slot }, _max: { position: true } });
    await db.banner.create({ data: { ...BANNER, position: (last._max.position ?? 0) + 1 } });
    console.log("added banner", BANNER.slot);
  }
}

main().finally(() => db.$disconnect());
