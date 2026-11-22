import { PrismaClient } from "@prisma/client";

/**
 * Master Bedina's paid banners, both linking to his GoDesi page:
 * the astrologer rail on the left of every astrology page (ASTRO) and the
 * site-wide sidebar rotation (SIDEBAR). Paid for one year. Re-runnable.
 *
 *   npx tsx scripts/add-master-bedina-banners.ts
 */
const db = new PrismaClient();

const LINK = "/business/master-bedina-astrologer";
const ENDS = new Date("2027-11-23T05:00:00Z"); // end of Nov 22, 2027 ET
const TITLE = "Master Bedina — Famous Astrologer, Psychic & Spiritualist";

const BANNERS = [
  { slot: "ASTRO", imageUrl: "/images/ads/master-bedina-astro.png" },
  { slot: "SIDEBAR", imageUrl: "/images/ads/master-bedina-sidebar.png" },
] as const;

async function main() {
  for (const banner of BANNERS) {
    const data = { ...banner, title: TITLE, linkUrl: LINK, endsAt: ENDS };
    const existing = await db.banner.findFirst({
      where: { imageUrl: banner.imageUrl },
      select: { id: true },
    });
    if (existing) {
      await db.banner.update({
        where: { id: existing.id },
        data: { ...data, active: true, status: "ACTIVE" },
      });
      console.log(`updated ${banner.slot}`);
      continue;
    }
    const last = await db.banner.aggregate({
      where: { slot: banner.slot },
      _max: { position: true },
    });
    await db.banner.create({
      data: { ...data, position: (last._max.position ?? 0) + 1 },
    });
    console.log(`added ${banner.slot}`);
  }
}

main().finally(() => db.$disconnect());
