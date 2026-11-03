/**
 * Appends a short "Travelling to India?" box with Travelpayouts partner links
 * (Yesim eSIM, Klook, KKday, Tiqets, EconomyBookings) to the India-travel guides. Re-runnable: a post
 * that already has the box is left alone.
 *
 *   DATABASE_URL=... npx tsx scripts/add-travel-affiliate-box.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const MARK = "Travelling to India?";
const NOTE =
  "Some links above are partner links: GoDesi may earn a small commission if you buy, at no extra cost to you.";

const INDIA_TRIP = `${MARK}
- Phone data: skip the airport SIM queue. A [Yesim](https://yesim.tpo.li/F5AhylOr) or [Saily](https://saily.tpo.li/8ve5z4Sy) travel eSIM works on most newer phones as soon as you land.
- Tours and day trips: book temple visits, city tours and airport transfers in India on [Klook](https://klook.tpo.li/Jkdu68C6) or [KKday](https://kkday.tpo.li/l8T8GeM4).
- Rental car: compare car hire at Indian airports on [EconomyBookings](https://economybookings.tpo.li/TbDdQi6o).

${NOTE}`;

const NYC_DAY = `Making a day of it?
- Driving in from out of town? Compare rental cars on [EconomyBookings](https://economybookings.tpo.li/TbDdQi6o).
- Visiting family from India? A [Yesim](https://yesim.tpo.li/F5AhylOr) or [Saily](https://saily.tpo.li/8ve5z4Sy) travel eSIM gets them US phone data the moment they land.
- Add New York sights and tours to the trip with [Klook](https://klook.tpo.li/Jkdu68C6), or skip the ticket lines at museums and attractions with [Tiqets](https://tiqets.tpo.li/stbzuORH).

${NOTE}`;

const POSTS: { slug: string; box: string; before?: string }[] = [
  {
    slug: "moving-back-to-india-from-the-usa-checklist",
    box: INDIA_TRIP,
    before: "As an Amazon Associate",
  },
  {
    slug: "oci-card-guide-for-us-citizens-of-indian-origin",
    box: INDIA_TRIP,
    before: "As an Amazon Associate",
  },
  {
    slug: "little-india-neighborhoods-new-jersey-new-york",
    box: NYC_DAY,
    before: "Own a shop in one of these",
  },
];

async function main() {
  for (const p of POSTS) {
    const post = await db.blogPost.findUnique({
      where: { slug: p.slug },
      select: { body: true },
    });
    if (!post || post.body.includes("tpo.li")) continue;
    const at = p.before ? post.body.indexOf(p.before) : -1;
    const body =
      at >= 0
        ? `${post.body.slice(0, at)}${p.box}\n\n${post.body.slice(at)}`
        : `${post.body}\n\n${p.box}`;
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
