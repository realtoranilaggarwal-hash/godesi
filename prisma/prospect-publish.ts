import { db } from "../src/lib/db";
import { publishProspectCard } from "../src/lib/prospectCard";

/**
 * Puts call-list rows on the site as unclaimed starter cards, so a caller has a
 * real page to point the owner at.
 *
 *   npm run db:prospect-cards                    # every row with a phone
 *   npm run db:prospect-cards -- food-catering   # one beat only
 *   npm run db:prospect-cards -- all 500         # cap the run
 *
 * Only the facts go up (name, trade, town, street, website); the phone and email
 * are stored hidden until the owner claims the card. Rows without a phone, a
 * town or a beat are left alone: nobody can ring them, a card with no town is no
 * use, and we will not guess a category. Re-running is safe — a row that already
 * has a card is skipped.
 */

async function main() {
  const beat = process.argv[2] && process.argv[2] !== "all" ? process.argv[2] : null;
  const limit = Number(process.argv[3] ?? "0") || 0;

  const rows = await db.prospect.findMany({
    where: {
      phone: { not: null },
      city: { not: null },
      listedSlug: null,
      categorySlug: beat ?? { not: null },
    },
    orderBy: [{ source: "asc" }, { name: "asc" }],
    ...(limit ? { take: limit } : {}),
  });

  console.log(`${rows.length} rows to card${beat ? ` in ${beat}` : ""}.`);

  let created = 0;
  let linked = 0;
  let skipped = 0;

  for (const row of rows) {
    // eslint-disable-next-line no-await-in-loop
    const outcome = await publishProspectCard(row);
    if (!outcome.ok) skipped += 1;
    else if (outcome.created) created += 1;
    else linked += 1;

    if ((created + linked + skipped) % 250 === 0) {
      console.log(`  …${created} cards, ${linked} linked, ${skipped} skipped`);
    }
  }

  console.log(
    `Done: ${created} cards published, ${linked} linked to a card that already existed, ${skipped} skipped (a business of that name is already in that town).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
