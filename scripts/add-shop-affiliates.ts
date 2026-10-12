import { PrismaClient } from "@prisma/client";

/** Pins the owner's affiliate stores to the /shop "More stores & offers" rail. */
const db = new PrismaClient();

const STORES = [
  {
    title: "RentRedi — rent collection & tenant screening for landlords",
    url: "https://imp.i325350.net/raBOd5",
    description:
      "Own a rental? Collect rent online, screen tenants and track maintenance from one app. Free to start.",
    tags: ["landlords", "real estate"],
  },
  {
    title: "Udemy — online courses",
    url: "https://trk.udemy.com/0G3MxM",
    description:
      "Learn coding, AI, Excel, business, design and more from affordable video courses you keep for life.",
    tags: ["courses", "learning"],
  },
  {
    title: "Rakuten — cash back at 3,500+ stores",
    url: "https://www.rakuten.com/r/LUCKY7226",
    description:
      "Start your shopping at Rakuten and get cash back from over 3,500 stores. Join free through this invite link.",
    tags: ["cash back", "coupons"],
  },
];

async function main() {
  for (const store of STORES) {
    const existing = await db.resourceLink.findFirst({
      where: { url: store.url },
      select: { id: true },
    });
    if (existing) {
      console.log(`exists ${store.url}`);
      continue;
    }
    await db.resourceLink.create({
      data: {
        ...store,
        kind: "AFFILIATE",
        placement: "shop",
        status: "APPROVED",
        active: true,
      },
    });
    console.log(`added ${store.title}`);
  }
}

main().finally(() => db.$disconnect());
