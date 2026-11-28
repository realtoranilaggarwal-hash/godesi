/**
 * Pins four Air India (CJ) offers to the top of /deals and /shop. The CJ feed
 * already carries them, but its hundreds of rows push them off the page, so
 * these hand-picked copies (source "AIRINDIA", which the CJ sync never retires)
 * come first. End dates are copied from the matching CJ rows. Re-runnable.
 *
 *   DATABASE_URL=... npx tsx scripts/add-air-india-offers.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const SOURCE = "AIRINDIA";

const OFFERS = [
  {
    externalId: "17259539",
    title: "Up to INR 3000 off per passenger on Air India",
    description: "Use promo code BOBAIFLY when you book on airindia.com. T&Cs apply.",
    code: "BOBAIFLY",
    clickUrl: "https://www.dpbolvw.net/click-101917857-17259539",
  },
  {
    externalId: "17276783",
    title: "Air India: INR 500 off per person on domestic, INR 1000 on international flights",
    description: "Use promo code FLYAIR when you book on airindia.com. T&Cs apply.",
    code: "FLYAIR",
    clickUrl: "https://www.jdoqocy.com/click-101917857-17276783",
  },
  {
    externalId: "17176906",
    title: "Air India students: flat 10% off base fare",
    description:
      "Up to Rs 1000 off with code CJAIR, one free date change and an extra 10 kg (22 lb) baggage allowance. T&Cs apply.",
    code: "CJAIR",
    clickUrl: "https://www.dpbolvw.net/click-101917857-17176906",
  },
  {
    externalId: "17189677",
    title: "Air India senior citizens: up to 25% off base fares on domestic flights",
    description: "Use promo code CJAIR when you book on airindia.com. T&Cs apply.",
    code: "CJAIR",
    clickUrl: "https://www.kqzyfj.com/click-101917857-17189677",
  },
];

async function main() {
  for (const offer of OFFERS) {
    const feed = await db.storeOffer.findUnique({
      where: { source_externalId: { source: "CJ", externalId: offer.externalId } },
      select: { advertiserId: true, endsAt: true },
    });
    const data = {
      ...offer,
      advertiserId: feed?.advertiserId ?? "7008093",
      advertiserName: "Air India",
      promotionType: "coupon",
      category: "Travel",
      endsAt: feed?.endsAt ?? null,
      active: true,
      syncedAt: new Date(),
    };
    const row = await db.storeOffer.upsert({
      where: { source_externalId: { source: SOURCE, externalId: offer.externalId } },
      create: { source: SOURCE, ...data },
      update: data,
      select: { code: true, endsAt: true },
    });
    console.log(offer.externalId, row.code, "ends", row.endsAt?.toISOString() ?? "never");
  }
}

main().finally(() => db.$disconnect());
