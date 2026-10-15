import { db } from "../src/lib/db";

/**
 * Files astrologers under the Astrologers subcategory so /astrology and the
 * category page can find them. Call-list rows whose trade is astrology move
 * there, and so do their unclaimed starter cards and any other unclaimed card
 * whose name says astrologer. Claimed cards are the owner's choice and are
 * never touched. Re-runnable.
 *
 *   npx tsx scripts/tag-astrologers.ts          # dry run
 *   APPLY=1 npx tsx scripts/tag-astrologers.ts
 */

const CATEGORY = "religious-services";
const SUBCATEGORY = "religious-services-astrologers";
const NAME_WORDS = ["astrolog", "jyotish", "horoscope", "kundli"];

async function main() {
  const apply = process.env.APPLY === "1";

  const prospects = await db.prospect.findMany({
    where: { trade: { contains: "astrolog", mode: "insensitive" } },
    select: { id: true, sourceUrl: true, subcategorySlug: true },
  });

  const cards = await db.business.findMany({
    where: {
      ownerId: null,
      AND: [
        {
          OR: [
            { subcategorySlug: null },
            { subcategorySlug: { not: SUBCATEGORY } },
          ],
        },
      ],
      OR: [
        { sourceUrl: { in: prospects.map((row) => row.sourceUrl) } },
        ...NAME_WORDS.map((word) => ({
          categorySlug: CATEGORY,
          name: { contains: word, mode: "insensitive" as const },
        })),
      ],
    },
    select: { id: true, name: true, city: true, categorySlug: true },
  });

  const prospectIds = prospects
    .filter((row) => row.subcategorySlug !== SUBCATEGORY)
    .map((row) => row.id);

  for (const card of cards) {
    console.log(`${card.name} | ${card.city ?? "-"} | ${card.categorySlug}`);
  }
  console.log(
    `${prospectIds.length} call-list rows and ${cards.length} unclaimed cards to file under ${SUBCATEGORY}.`,
  );
  if (!apply) {
    console.log("Dry run — set APPLY=1 to save.");
    return;
  }

  await db.prospect.updateMany({
    where: { id: { in: prospectIds } },
    data: { categorySlug: CATEGORY, subcategorySlug: SUBCATEGORY },
  });
  await db.business.updateMany({
    where: { id: { in: cards.map((card) => card.id) } },
    data: {
      category: CATEGORY,
      categorySlug: CATEGORY,
      subcategorySlug: SUBCATEGORY,
    },
  });
  console.log("Saved.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
