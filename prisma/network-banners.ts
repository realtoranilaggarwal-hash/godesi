import { db } from "../src/lib/db";

/**
 * House 320x100 banners for Anil's own sites, rotating in the MOBILE slot
 * (GoDesi right rail, phone feed and the network-site banner feed).
 * Idempotent: a banner whose image is already in the slot is left alone.
 *
 *   npx tsx prisma/network-banners.ts
 */
const SITES: [file: string, title: string, url: string][] = [
  ["anilsellsnj", "AnilSellsNJ: NJ homes, mortgage & insurance", "https://www.anilsellsnj.com"],
  ["refiyourloans", "RefiYourLoans: should you refinance?", "https://refiyourloans.com"],
  ["futurefinanceplanning", "Future Finance Planning: IUL & mortgage protection", "https://futurefinanceplanning.com"],
  ["flippurchase", "FlipPurchase: sell your NJ home fast", "https://flippurchase.com"],
  ["vylla-in", "Vylla.in: verified real estate in India", "https://vylla.in"],
  ["intensivecareindia", "Intensive Care India: treatment in India for less", "https://intensivecareindia.com"],
  ["path2india", "Path2India: NRI concierge in India", "https://path2india.com"],
  ["matchdesi", "MatchDesi: find desi friends near you", "https://matchdesi.com"],
  ["socialdada", "SocialDada: verified web pros", "https://socialdada.com"],
  ["vyllanj", "Vylla Home NJ: Anil Aggarwal, Broker Manager", "https://vyllanj.com"],
];

async function main() {
  let added = 0;
  for (const [file, title, url] of SITES) {
    const imageUrl = `/banners/network/${file}.png`;
    const exists = await db.banner.findFirst({ where: { slot: "MOBILE", imageUrl } });
    if (exists) continue;
    await db.banner.create({
      data: {
        slot: "MOBILE",
        title,
        imageUrl,
        linkUrl: `${url}/?utm_source=godesi&utm_medium=banner&utm_campaign=network`,
        active: true,
        status: "ACTIVE",
      },
    });
    added++;
  }
  console.log(`network banners: ${added} added, ${SITES.length - added} already there`);
}

main().finally(() => db.$disconnect());
