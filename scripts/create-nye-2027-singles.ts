/**
 * Creates (or refreshes) the "Singles" listing for NYE 2027: the same night and hall as
 * the main party, but its own page and its own 50 first-come-first-served balcony seats
 * (no tables), sold only to members 21+ with a Connect profile marked Single (see
 * lib/singles). One flat $75 tier, chair only and all inclusive. The main event keeps its
 * separate 50 balcony seats, so the balcony holds 100 in total.
 * Safe to re-run: the event is matched by slug (old slugs are renamed) and tiers by name;
 * old price-window tiers are deleted when unsold, or closed for sale when someone bought one.
 *
 *   DATABASE_URL=... npx tsx scripts/create-nye-2027-singles.ts
 */
import { db } from "@/lib/db";
import { HIDE_SEATS_LEFT_TAG } from "@/lib/events";
import { SINGLES_ONLY_TAG } from "@/lib/singles";

const MAIN_SLUG = "new-year-eves-party-2027-edison";
const SLUG = "singles-new-years-eve-party-2027-nj";
const OLD_SLUGS = ["singles-mingle-new-years-eve-party-2027-nj"];
const FLYER = "https://godesi.com/flyers/nye-2027-grand-party.jpg";
const SEATS = 50;
const NOTE = "21+ · Limited seats · first come, first served · no table · singles band included";

const TIERS: { name: string; match?: string[]; price: number; salesStart?: Date; salesEnd?: Date }[] = [
  {
    name: "Singles — balcony chair, all inclusive",
    match: ["Singles balcony seat — Early bird", "Singles balcony seat"],
    price: 75,
  },
];

const TITLE = "Singles New Year's Eve Party 2027 in NJ (21+)";

const DESCRIPTION = [
  "Single? Don't spend New Year's Eve alone! GoDesi Singles is a singles-only New Year's Eve party inside the Grand New Year's Eve Party 2027 at Royal Albert Palace, Fords NJ (near Edison) — Thursday, December 31st, 2026, 8:00 PM to 1:00 AM.",
  "Singles get their own balcony in the Big Ball Room: chairs only, no tables and no assigned seats — limited seats, first come, first served. Every singles guest gets a special singles band.",
  "It's all inclusive — everything the main party has: 35 food items with live stations in the Plaza Hall (dosa, jalebi, golgappa and more), premium drinks until midnight, a midnight champagne toast, live DJ Sandy of M&D Events, a live belly dance performance and the New York ball drop on live TV. Free valet parking. Meet new people, make friends and welcome 2027 together.",
  "This is a 21+ party because liquor is served: bring a photo ID, which is checked at the door when you pick up your singles band.",
  "Tickets: only $75, all inclusive. Only 50 singles seats. To keep it singles-only, you need a free GoDesi Connect profile marked Single, with your age (21 or older), before you buy — create it in a minute and come straight back to book. Short link: godesi.com/927",
  "Questions or group bookings: Rachna 908-421-1685 · Anil 732-983-7958 · Ashok 732-921-5606.",
].join("\n\n");

const TAGS = [SINGLES_ONLY_TAG, HIDE_SEATS_LEFT_TAG, "singles", "singles-party", "singles-new-years-eve", "desi-singles", "21-plus", "new-years-eve", "nye-2027", "new-jersey"];

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

  for (const old of existing?.tiers.filter((row) => !used.has(row.id) && row.kind === "TICKET") ?? []) {
    const sold = old.seatsBooked > 0 || (await db.ticket.count({ where: { tierId: old.id } })) > 0;
    if (sold) await db.ticketTier.update({ where: { id: old.id }, data: { salesEnd: new Date(), seatsTotal: old.seatsBooked } });
    else await db.ticketTier.delete({ where: { id: old.id } });
  }

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
