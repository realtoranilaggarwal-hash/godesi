import { PrismaClient } from "@prisma/client";

/**
 * Anil's Cheapflightsfares "New Year flight deals" CJ banners: the 250x250 rotates in
 * the SIDEBAR slot and the 120x600 in the SKYSCRAPER slot. Both open the New Year
 * travel deals page and stop showing after Jan 1, 2027 (ET). Re-runnable.
 *
 *   DATABASE_URL=... npx tsx scripts/add-new-year-flight-banners.ts
 */
const db = new PrismaClient();
const ENDS = new Date("2027-01-02T04:59:59Z");

const BANNERS = [
  {
    slot: "SIDEBAR" as const,
    title: "New Year flight tickets: Cheapflightsfares New Year travel deals",
    imageUrl: "https://www.lduhtrp.net/image-101917857-15426662",
    linkUrl: "https://www.dpbolvw.net/click-101917857-15426662",
  },
  {
    slot: "SKYSCRAPER" as const,
    title: "New Year flight deals: Cheapflightsfares New Year travel deals",
    imageUrl: "https://www.ftjcfx.com/image-101917857-15426658",
    linkUrl: "https://www.jdoqocy.com/click-101917857-15426658",
  },
];

async function main() {
  for (const banner of BANNERS) {
    const data = { ...banner, endsAt: ENDS };
    const existing = await db.banner.findFirst({ where: { imageUrl: banner.imageUrl }, select: { id: true } });
    if (existing) {
      await db.banner.update({ where: { id: existing.id }, data: { ...data, active: true, status: "ACTIVE" } });
      console.log("updated", banner.slot, banner.linkUrl);
      continue;
    }
    const last = await db.banner.aggregate({ where: { slot: banner.slot }, _max: { position: true } });
    await db.banner.create({ data: { ...data, position: (last._max.position ?? 0) + 1 } });
    console.log("added", banner.slot, banner.linkUrl);
  }
}

main().finally(() => db.$disconnect());
