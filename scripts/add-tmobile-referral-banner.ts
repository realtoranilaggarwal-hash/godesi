import { PrismaClient } from "@prisma/client";

/**
 * Anil's T-Mobile "Get $100" referral banners: a 900x300 in the WALL slot (rotates in
 * every small-banner stack) and a 320x100 in the MOBILE slot (also on the sister sites
 * via /api/banners/network). They stop showing after March 31, 2027 (ET). Re-runnable.
 *
 *   npx tsx scripts/add-tmobile-referral-banner.ts
 */
const db = new PrismaClient();
const LINK = "https://referral.t-mobile.com/Ua56d8z";
const ENDS = new Date("2027-04-01T03:59:59Z");
const TITLE =
  "Get $100 from T-Mobile: bring your number from another qualifying postpaid carrier and activate a T-Mobile postpaid monthly phone plan";

const BANNERS = [
  { slot: "WALL" as const, imageUrl: "/images/ads/tmobile-100-referral.png" },
  { slot: "MOBILE" as const, imageUrl: "/images/ads/tmobile-100-referral-320x100.png" },
];

async function main() {
  for (const banner of BANNERS) {
    const data = { ...banner, title: TITLE, linkUrl: LINK, endsAt: ENDS };
    const existing = await db.banner.findFirst({ where: { imageUrl: banner.imageUrl }, select: { id: true } });
    if (existing) {
      await db.banner.update({ where: { id: existing.id }, data: { ...data, active: true, status: "ACTIVE" } });
      console.log("updated", banner.imageUrl);
      continue;
    }
    const last = await db.banner.aggregate({ where: { slot: banner.slot }, _max: { position: true } });
    await db.banner.create({ data: { ...data, position: (last._max.position ?? 0) + 1 } });
    console.log("added", banner.imageUrl);
  }
}

main().finally(() => db.$disconnect());
