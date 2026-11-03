/**
 * Adds the Saily eSIM partner link next to Yesim in guides that already carry
 * the travel box from add-travel-affiliate-box.ts. Re-runnable.
 *
 *   DATABASE_URL=... npx tsx scripts/add-saily-link.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const OLD = "A [Yesim travel eSIM](https://yesim.tpo.li/F5AhylOr)";
const NEW =
  "A [Yesim](https://yesim.tpo.li/F5AhylOr) or [Saily](https://saily.tpo.li/8ve5z4Sy) travel eSIM";

async function main() {
  const posts = await db.blogPost.findMany({
    where: { body: { contains: OLD } },
    select: { slug: true, body: true },
  });
  for (const p of posts) {
    await db.blogPost.update({
      where: { slug: p.slug },
      data: { body: p.body.split(OLD).join(NEW) },
    });
    console.log(`https://godesi.com/blog/${p.slug}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
