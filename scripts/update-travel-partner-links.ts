/**
 * Updates the partner links in guides that already carry the travel box from
 * add-travel-affiliate-box.ts: adds Saily next to Yesim, Localrent next to
 * EconomyBookings, and points Yesim, KKday and
 * Klook (India boxes only) at their India pages. Re-runnable.
 *
 *   DATABASE_URL=... npx tsx scripts/update-travel-partner-links.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const SWAPS: [string, string][] = [
  [
    "compare car hire at Indian airports on [EconomyBookings](https://economybookings.tpo.li/TbDdQi6o)",
    "compare car hire at Indian airports on [Localrent](https://localrent.tpo.li/AQQouusf) or [EconomyBookings](https://economybookings.tpo.li/TbDdQi6o)",
  ],
  [
    "A [Yesim travel eSIM](https://yesim.tpo.li/F5AhylOr) works",
    "A [Yesim](https://yesim.tpo.li/HzlXXcYH) or [Saily](https://saily.tpo.li/8ve5z4Sy) travel eSIM works",
  ],
  [
    "A [Yesim travel eSIM](https://yesim.tpo.li/F5AhylOr)",
    "A [Yesim](https://yesim.tpo.li/F5AhylOr) or [Saily](https://saily.tpo.li/8ve5z4Sy) travel eSIM",
  ],
  ["https://kkday.tpo.li/l8T8GeM4", "https://kkday.tpo.li/pkRIrFFW"],
  [
    "India on [Klook](https://klook.tpo.li/Jkdu68C6)",
    "India on [Klook](https://klook.tpo.li/voOMXIKP)",
  ],
];

async function main() {
  const posts = await db.blogPost.findMany({
    where: { OR: SWAPS.map(([from]) => ({ body: { contains: from } })) },
    select: { slug: true, body: true },
  });
  for (const p of posts) {
    const body = SWAPS.reduce(
      (b, [from, to]) => b.split(from).join(to),
      p.body,
    );
    await db.blogPost.update({ where: { slug: p.slug }, data: { body } });
    console.log(`https://godesi.com/blog/${p.slug}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
