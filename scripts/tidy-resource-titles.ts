import { PrismaClient } from "@prisma/client";

/**
 * A handful of shops answer a robot with a page that spells their brand
 * differently from the way they write it themselves, so the merchant names the
 * resolver produced are corrected here. DRY=1 prints without touching anything.
 */
const db = new PrismaClient();

const BRANDS: Record<string, string> = {
  primecables: "PrimeCables",
  openskycc: "OpenSky",
  checksonsale: "Checks On Sale",
  healthlabs: "HealthLabs",
  shopperplus: "ShopperPlus",
  "123ink": "123Ink",
  "aiper us store": "Aiper",
  "trip.com official site": "Trip.com",
  selefina: "Selefina Spices",
};

async function main() {
  const dry = process.env.DRY === "1";
  const links = await db.resourceLink.findMany({
    select: { id: true, title: true },
  });

  let fixed = 0;
  for (const link of links) {
    const [merchant, ...rest] = link.title.split(" — ");
    const brand = BRANDS[merchant.trim().toLowerCase()];
    if (!brand) continue;

    const title = [brand, ...rest].join(" — ");
    console.log(`${link.title} → ${title}`);
    if (!dry) {
      await db.resourceLink.update({ where: { id: link.id }, data: { title } });
    }
    fixed += 1;
  }

  console.log(`${fixed} ${dry ? "would be corrected" : "corrected"}.`);
}

main().finally(() => db.$disconnect());
