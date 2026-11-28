/**
 * Pins hand-picked CJ travel offers (Air India, Cheapflightsfares, CheapOair) to
 * the top of /deals and /shop. The CJ feed already carries them, but its
 * hundreds of rows push them off the page, so these copies (source "PINNED",
 * which the CJ sync never retires) come first, with Anil's own links. End dates
 * come from the matching CJ rows.
 *
 * The first run hides each CJ original so search shows one card per offer, and
 * the copy starts hidden if staff had already hidden the original. Re-runs never
 * touch "hidden", so moderate the pinned copy in /admin/resources. Re-runnable.
 *
 *   DATABASE_URL=... npx tsx scripts/add-pinned-travel-offers.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const SOURCE = "PINNED";

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
  {
    externalId: "15519126",
    title: "Student flights: $10 off per student, up to $40 for 4 students flying together",
    description: "Use code STU40 when you book on Cheapflightsfares. T&Cs apply.",
    code: "STU40",
    clickUrl: "https://www.tkqlhce.com/click-101917857-15519126",
  },
  {
    externalId: "11053440",
    title: "Cheap hotel deals: save up to $20 off CheapOair fees",
    description: "From boutique to beachfront. Use promo code HOTEL20 when you book. T&Cs apply.",
    code: "HOTEL20",
    clickUrl: "https://www.jdoqocy.com/click-101917857-11053440",
  },
];

async function main() {
  for (const offer of OFFERS) {
    const feed = await db.storeOffer.findUnique({
      where: { source_externalId: { source: "CJ", externalId: offer.externalId } },
      select: { id: true, advertiserId: true, advertiserName: true, category: true, endsAt: true, hidden: true },
    });
    if (!feed) {
      console.log(offer.externalId, "not in the CJ feed, skipped");
      continue;
    }
    const data = {
      ...offer,
      advertiserId: feed.advertiserId,
      advertiserName: feed.advertiserName,
      promotionType: "coupon",
      category: feed.category ?? "Travel",
      endsAt: feed.endsAt,
      active: true,
      syncedAt: new Date(),
    };
    const where = { source_externalId: { source: SOURCE, externalId: offer.externalId } };
    const pinned = await db.storeOffer.findUnique({ where, select: { id: true } });
    const row = pinned
      ? await db.storeOffer.update({ where, data, select: { code: true, endsAt: true, hidden: true } })
      : await db.storeOffer.create({
          data: { source: SOURCE, ...data, hidden: feed.hidden },
          select: { code: true, endsAt: true, hidden: true },
        });
    if (!pinned) await db.storeOffer.update({ where: { id: feed.id }, data: { hidden: true } });
    console.log(
      offer.externalId,
      feed.advertiserName,
      row.code,
      "ends",
      row.endsAt?.toISOString() ?? "never",
      row.hidden ? "(hidden)" : "",
    );
  }
}

main().finally(() => db.$disconnect());
