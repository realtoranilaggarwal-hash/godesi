import { PrismaClient } from "@prisma/client";

/**
 * Marketing Shop as a house 320x100 banner in the MOBILE slot, so it rotates on
 * GoDesi's banner stacks and on the sister sites via /api/banners/network.
 * Re-runnable.
 *
 *   npx tsx scripts/add-marketing-shop-banner.ts
 */
const db = new PrismaClient();
const imageUrl = "/images/ads/house-marketing-shop-320x100.png";
const data = {
  slot: "MOBILE" as const,
  imageUrl,
  title: "GoDesi Marketing Shop — your logo on flags, car stickers, banners & flyers",
  linkUrl: "https://godesi.com/marketing-shop",
};

async function main() {
  const existing = await db.banner.findFirst({ where: { imageUrl }, select: { id: true } });
  if (existing) {
    await db.banner.update({ where: { id: existing.id }, data: { ...data, active: true, status: "ACTIVE" } });
    console.log("updated marketing-shop banner");
    return;
  }
  const last = await db.banner.aggregate({ where: { slot: "MOBILE" }, _max: { position: true } });
  await db.banner.create({ data: { ...data, position: (last._max.position ?? 0) + 1 } });
  console.log("added marketing-shop banner");
}

main().finally(() => db.$disconnect());
