/**
 * Creates (or refreshes) the "Singles Mingle" listing for NYE 2027: the same night and
 * hall as the main party, but its own page and its own 50 chair-only balcony seats, sold
 * only to members with a Connect profile marked Single (see lib/singles). The main event
 * keeps its separate 50 balcony seats, so the balcony holds 100 in total.
 * Safe to re-run: the event is matched by slug and its single tier by name.
 *
 *   DATABASE_URL=... npx tsx scripts/create-nye-2027-singles.ts
 */
import { db } from "@/lib/db";
import { SINGLES_ONLY_TAG } from "@/lib/singles";

const MAIN_SLUG = "new-year-eves-party-2027-edison";
const SLUG = "singles-mingle-new-years-eve-party-2027-nj";
const FLYER = "https://godesi.com/flyers/nye-2027-singles-mingle.jpg";
const TIER = { name: "Singles balcony seat", note: "Chair only, no table · singles band included", price: 75, seats: 50 };

const TITLE = "Singles Mingle New Year's Eve Party 2027 in NJ";

const DESCRIPTION = [
  "Single? Don't spend New Year's Eve alone! GoDesi Singles Mingle is a singles-only New Year's Eve party inside the Grand New Year's Eve Party 2027 at Royal Albert Palace, Fords NJ (near Edison) — Thursday, December 31st, 8:00 PM to 1:00 AM.",
  "Singles get their own chair-only balcony in the Big Ball Room: no tables, more of a club feel, so it's easy to move around, meet new people and make friends. Every singles guest gets a special singles band, so you know who else is there to mingle.",
  "You get everything the main party has: delicious food from live stations (dosa, jalebi, golgappa and more), premium drinks and liquor, DJ Sandy on the dance floor and belly dancer Aamra's fire dance. The only thing you don't get is a table.",
  "Tickets are $75 and only 50 singles seats are available. To keep it singles-only, you need a free GoDesi Connect profile marked Single before you buy — create it in a minute and come straight back to book.",
  "Questions or group bookings: Rachna 908-421-1685 · Anil 732-877-8585 · Ashok 732-921-5606 · Office 732-661-1070.",
].join("\n\n");

const TAGS = [SINGLES_ONLY_TAG, "singles", "singles-party", "singles-mingle", "desi-singles", "new-years-eve", "nye-2027", "new-jersey"];

async function main() {
  const main = await db.event.findUnique({ where: { slug: MAIN_SLUG } });
  if (!main) throw new Error(`No event ${MAIN_SLUG}`);

  const data = {
    title: TITLE,
    description: DESCRIPTION,
    startsAt: new Date("2026-12-31T20:00:00-05:00"),
    endsAt: new Date("2027-01-01T01:00:00-05:00"),
    timeZone: "America/New_York",
    venue: "Royal Albert Palace",
    hallName: "Big Ball Room — singles balcony",
    address: "1050 King Georges Post Rd, Fords, NJ 08863",
    city: "Fords",
    state: "NJ",
    country: main.country,
    venueUrl: main.venueUrl,
    venueRefId: main.venueRefId,
    mapsUrl: main.mapsUrl,
    features: main.features,
    eventType: main.eventType,
    genres: main.genres,
    languages: main.languages,
    mode: main.mode,
    categorySlug: main.categorySlug,
    categorySlugs: main.categorySlugs,
    organizerId: main.organizerId,
    businessId: main.businessId,
    payoutTermsAt: main.payoutTermsAt,
    askReferredBy: main.askReferredBy,
    reviewsAlbumUrl: main.reviewsAlbumUrl,
    currency: main.currency,
    imageUrl: FLYER,
    tags: TAGS,
    featured: true,
    status: "APPROVED" as const,
    price: TIER.price,
  };

  const existing = await db.event.findUnique({ where: { slug: SLUG }, include: { tiers: true } });
  const event = existing
    ? await db.event.update({ where: { id: existing.id }, data })
    : await db.event.create({ data: { ...data, slug: SLUG, seatsTotal: TIER.seats } });

  const tier = existing?.tiers.find((row) => row.name === TIER.name);
  const tierData = {
    name: TIER.name,
    note: TIER.note,
    price: TIER.price,
    seatsTotal: Math.max(TIER.seats, tier?.seatsBooked ?? 0),
    sortOrder: 0,
    kind: "TICKET",
    admits: 1,
  };
  if (tier) await db.ticketTier.update({ where: { id: tier.id }, data: tierData });
  else await db.ticketTier.create({ data: { ...tierData, eventId: event.id } });

  await db.event.update({ where: { id: event.id }, data: { seatsTotal: tierData.seatsTotal } });
  console.log(`${existing ? "Updated" : "Created"} ${SLUG} (${event.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
