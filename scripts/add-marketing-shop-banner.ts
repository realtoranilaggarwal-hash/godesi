import { PrismaClient } from "@prisma/client";

/**
 * Marketing Shop house 320x100 banners in the MOBILE slot, so it rotates on
 * GoDesi's banner stacks and on the sister sites via /api/banners/network.
 * Re-runnable.
 *
 *   npx tsx scripts/add-marketing-shop-banner.ts
 */
const db = new PrismaClient();
const BANNERS = [
  {
    imageUrl: "/images/ads/house-marketing-shop-320x100.png",
    title: "GoDesi Marketing Shop — your logo on flags, car stickers, banners & flyers",
  },
  {
    imageUrl: "/images/ads/house-marketing-king-320x100.png",
    title: "Do you know? GoDesi is the Marketing King — all your marketing in one place",
  },
];

async function main() {
  for (const banner of BANNERS) {
    const data = { slot: "MOBILE" as const, ...banner, linkUrl: "https://godesi.com/marketing-shop" };
    const existing = await db.banner.findFirst({ where: { imageUrl: banner.imageUrl }, select: { id: true } });
    if (existing) {
      await db.banner.update({ where: { id: existing.id }, data: { ...data, active: true, status: "ACTIVE" } });
      console.log("updated", banner.imageUrl);
      continue;
    }
    const last = await db.banner.aggregate({ where: { slot: "MOBILE" }, _max: { position: true } });
    await db.banner.create({ data: { ...data, position: (last._max.position ?? 0) + 1 } });
    console.log("added", banner.imageUrl);
  }
}

main().finally(() => db.$disconnect());
