import { PrismaClient } from "@prisma/client";

/**
 * Anil's own sites as house 320x100 banners in the MOBILE slot (right-side
 * stack on computers, between cards on phones). No end date, so they rotate
 * after the paid bookings. Re-runnable.
 *
 *   npx tsx scripts/add-anil-house-banners.ts
 */
const db = new PrismaClient();

const BANNERS = [
  ["njfind", "NJFind.com — Real Estate, Mortgage & Insurance hub", "https://njfind.com/"],
  ["path2india", "Path2India.com — NRI concierge services in India", "https://path2india.com/"],
  ["vylla-in", "Vylla.in — Verified real-estate agents in India", "https://vylla.in/"],
  ["refiyourloans", "RefiYourLoans.com — Compare mortgage & refi options", "https://refiyourloans.com/"],
  ["futurefinanceplanning", "Future Finance Planning — IUL, mortgage protection & retirement", "https://futurefinanceplanning.com/"],
  ["intensivecareindia", "IntensiveCareIndia.com — Top hospitals & surgeons in India", "https://intensivecareindia.com/"],
] as const;

async function main() {
  for (const [slug, title, linkUrl] of BANNERS) {
    const imageUrl = `/images/ads/house-${slug}-320x100.png`;
    const data = { slot: "MOBILE" as const, imageUrl, title, linkUrl };
    const existing = await db.banner.findFirst({
      where: { imageUrl },
      select: { id: true },
    });
    if (existing) {
      await db.banner.update({
        where: { id: existing.id },
        data: { ...data, active: true, status: "ACTIVE" },
      });
      console.log(`updated ${slug}`);
      continue;
    }
    const last = await db.banner.aggregate({
      where: { slot: "MOBILE" },
      _max: { position: true },
    });
    await db.banner.create({
      data: { ...data, position: (last._max.position ?? 0) + 1 },
    });
    console.log(`added ${slug}`);
  }
}

main().finally(() => db.$disconnect());
