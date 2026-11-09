/**
 * Creates (or refreshes) the "Singles" listing for NYE 2027: the same night and hall as
 * the main party, but its own page and its own 50 first-come-first-served balcony seats
 * (no tables), sold only to members 21+ with a Connect profile marked Single (see
 * lib/singles). The price rises by date; the event's seatsTotal of 50 caps the three
 * price windows together (lib/events pooledSeatsLeft). The main event keeps its separate
 * 50 balcony seats, so the balcony holds 100 in total.
 * Safe to re-run: the event is matched by slug (old slugs are renamed) and tiers by name.
 *
 *   DATABASE_URL=... npx tsx scripts/create-nye-2027-singles.ts
 */
import { db } from "@/lib/db";
import { SINGLES_ONLY_TAG } from "@/lib/singles";

const MAIN_SLUG = "new-year-eves-party-2027-edison";
const SLUG = "singles-new-years-eve-party-2027-nj";
const OLD_SLUGS = ["singles-mingle-new-years-eve-party-2027-nj"];
const FLYER = "https://godesi.com/flyers/nye-2027-singles.jpg";
const SEATS = 50;
const NOTE = "21+ · First come, first served · no table · singles band included";

/** Windows are in New York time; salesEnd is exclusive. */
const NOV_16 = new Date("2026-11-16T00:00:00-05:00");
const DEC_16 = new Date("2026-12-16T00:00:00-05:00");

const TIERS: { name: string; match?: string[]; price: number; salesStart?: Date; salesEnd?: Date }[] = [
  { name: "Singles balcony seat — Early bird", match: ["Singles balcony seat"], price: 75, salesEnd: NOV_16 },
  { name: "Singles balcony seat — Advance", price: 85, salesStart: NOV_16, salesEnd: DEC_16 },
  { name: "Singles balcony seat", price: 100, salesStart: DEC_16 },
];

const TITLE = "Singles New Year's Eve Party 2027 in NJ (21+)";

const DESCRIPTION = [
  "Single? Don't spend New Year's Eve alone! GoDesi Singles is a singles-only New Year's Eve party inside the Grand New Year's Eve Party 2027 at Royal Albert Palace, Fords NJ (near Edison) — Thursday, December 31st, 8:00 PM to 1:00 AM.",
  "Singles get their own balcony in the Big Ball Room: seats only, no tables and no assigned seats — first come, first served. Every singles guest gets a special singles band.",
  "You get everything the main party has: delicious food from live stations (dosa, jalebi, golgappa and more), premium drinks and liquor, DJ Sandy on the dance floor and belly dancer Aamra's fire dance. Meet new people, make friends and welcome 2027 together.",
  "This is a 21+ party because liquor is served: bring a photo ID, which is checked at the door when you pick up your singles band.",
  "Tickets: $75 till Nov 15 · $85 from Nov 16 to Dec 15 · $100 from Dec 16. Only 50 singles seats. To keep it singles-only, you need a free GoDesi Connect profile marked Single, with your age (21 or older), before you buy — create it in a minute and come straight back to book. Short link: godesi.com/927",
  "Questions or group bookings: Rachna 908-421-1685 · Anil 732-877-8585 · Ashok 732-921-5606 · Office 732-661-1070.",
].join("\n\n");

const TAGS = [SINGLES_ONLY_TAG, "singles", "singles-party", "singles-new-years-eve", "desi-singles", "21-plus", "new-years-eve", "nye-2027", "new-jersey"];

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
    slug: SLUG,
    price: Math.min(...TIERS.map((tier) => tier.price)),
  };

  const existing = await db.event.findFirst({
    where: { slug: { in: [SLUG, ...OLD_SLUGS] } },
    include: { tiers: true },
  });
  const event = existing
    ? await db.event.update({ where: { id: existing.id }, data })
    : await db.event.create({ data: { ...data, seatsTotal: SEATS } });

  const used = new Set<string>();
  for (let index = 0; index < TIERS.length; index += 1) {
    const spec = TIERS[index];
    const names = [spec.name, ...(spec.match ?? [])];
    const tier = existing?.tiers.find((row) => !used.has(row.id) && names.includes(row.name));
    const tierData = {
      name: spec.name,
      note: NOTE,
      price: spec.price,
      seatsTotal: Math.max(SEATS, tier?.seatsBooked ?? 0),
      sortOrder: index,
      salesStart: spec.salesStart ?? null,
      salesEnd: spec.salesEnd ?? null,
      kind: "TICKET",
      admits: 1,
    };
    if (tier) {
      used.add(tier.id);
      await db.ticketTier.update({ where: { id: tier.id }, data: tierData });
    } else await db.ticketTier.create({ data: { ...tierData, eventId: event.id } });
  }

  /** One pool of 50 across the three price windows (below the tiers' 150, see pooledSeatsLeft). */
  const booked = await db.ticketTier.aggregate({ where: { eventId: event.id, kind: "TICKET" }, _sum: { seatsBooked: true } });
  const seatsBooked = booked._sum.seatsBooked ?? 0;
  await db.event.update({ where: { id: event.id }, data: { seatsTotal: Math.max(SEATS, seatsBooked), seatsBooked } });
  console.log(`${existing ? "Updated" : "Created"} ${SLUG} (${event.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
