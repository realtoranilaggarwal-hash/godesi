/**
 * Fills in the event categories and language for events posted before the
 * vocabulary existed, reading them off each event's own words. Only events
 * with nothing set are touched, so a hand-picked list is never overwritten.
 *
 * Run with: npx tsx scripts/backfill-event-categories.ts
 */
import { PrismaClient } from "@prisma/client";
import {
  guessEventCategories,
  guessEventLanguages,
} from "../src/lib/eventCategories";

const db = new PrismaClient();

async function main() {
  const events = await db.event.findMany({
    where: { genres: { isEmpty: true } },
    select: {
      id: true,
      title: true,
      description: true,
      eventType: true,
      tags: true,
    },
  });

  let filled = 0;
  for (const event of events) {
    const text = [event.title, event.eventType, event.tags.join(" ")].join(" ");
    const genres = guessEventCategories(text, event.description);
    const languages = guessEventLanguages(text, event.description);
    if (!genres.length && !languages.length) continue;

    // eslint-disable-next-line no-await-in-loop
    await db.event.update({
      where: { id: event.id },
      data: { genres, languages },
    });
    filled += 1;
    console.log(`${event.title} → ${genres.join(", ") || "—"}`);
  }
  console.log(`\n${filled} of ${events.length} events categorised.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
