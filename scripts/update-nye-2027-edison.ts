/**
 * Brings the NYE 2027 Edison listing in line with the organiser's flyer: 8 PM start,
 * flyer image, early (till Nov 15) / advance (Nov 16–Dec 15) / late (from Dec 16) ticket
 * prices plus first-come-first-served balcony seats, and guest reviews typed out from the WhatsApp review album (first names only).
 * Safe to re-run: tiers are matched by name, reviews are replaced.
 *
 *   DATABASE_URL=... npx tsx scripts/update-nye-2027-edison.ts
 */
import type { BannerSlot } from "@prisma/client";
import { db } from "@/lib/db";

const SLUG = "new-year-eves-party-2027-edison";
const FLYER = "https://godesi.com/flyers/nye-2027-grand-party.jpg";
const REVIEWS_ALBUM = "https://photos.app.goo.gl/nQrusW5e5pojmj7P7";

/** Windows are in New York time; salesEnd is exclusive, so early tickets sell through Nov 15. */
const EARLY_END = new Date("2026-11-16T00:00:00-05:00");
const LATE_START = new Date("2026-12-16T00:00:00-05:00");

const DESCRIPTION = [
  "Grand New Year's Eve Party 2027 in the Big Ball Room at Royal Albert Palace — Thursday, December 31st, 8:00 PM to 1:00 AM. Hosted by NewYearEvesParty.com, celebrating since 2018.",
  "DJ Sandy of M&D Events keeps the dance floor packed all night, and famous belly dancer Aamra performs her fire dance. The Big Ball Room is lit by 22 head spot lights.",
  "Food is served in the exclusive Plaza Hall with live stations — dosa, jalebi, golgappa and many more — plus premium drinks. Valet parking and a lot more.",
  "Tickets till Nov 15th include table seating: Adult (10+) $85, Kids (0–9) $65, Couple $160. Nov 16th to Dec 15th: Adult $100, Kids $75, Couple $180. From Dec 16th: Adult $150, Kids $100, Couple $250. Balcony seats (no table, first come, first served) $75.",
  "Sponsors welcome: Silver $1,000, Gold $2,500 and Platinum $5,000 packages, plus single add-ons — call 732-877-8585.",
].join("\n\n");

/**
 * The hall holds 400 people, so entry tiers add up to 400, counting a couple as 2:
 * early 120 + 50 + 40×2 = 250, balcony 50, late 60 + 20 + 10×2 = 100. The advance window
 * (Nov 16–Dec 15) repeats the early numbers, since it sells after the early tiers close.
 * `match` lists the old names so the existing late tiers (and their bookings) are kept.
 * Sponsor packages are listed separately; the 2-pass ones add up to 18 more people.
 */
type TierSpec = {
  name: string;
  price: number;
  seats: number;
  note?: string;
  match?: string[];
  salesStart?: Date;
  salesEnd?: Date;
  kind?: "TICKET" | "SPONSOR";
  admits?: number;
  perks?: string[];
  bannerMonths?: number;
  bannerSlot?: BannerSlot;
  wallBricks?: number;
};

const BANNER_YEAR = "320×100 banner on GoDesi.com for 1 year";

/**
 * Tickets the hall can sell across every window. Early and advance tiers sell the same
 * seats at different dates, so the tiers add up to more than this; the event total
 * caps them together (lib/events pooledSeatsLeft).
 */
const HALL_TICKETS = 350;

/** GoDesi business pages listed as sponsors of the party. */
const SPONSOR_BUSINESSES: string[] = [];

const TIERS: TierSpec[] = [
  { name: "Adult (10+) — Early bird", note: "Table seating included", price: 85, seats: 120, salesEnd: EARLY_END },
  { name: "Kids (0–9) — Early bird", note: "Table seating included", price: 65, seats: 50, salesEnd: EARLY_END },
  { name: "Couple — Early bird", note: "Table seating included", price: 160, seats: 40, salesEnd: EARLY_END, admits: 2 },
  { name: "Adult (10+) — Advance", price: 100, seats: 120, salesStart: EARLY_END, salesEnd: LATE_START },
  { name: "Kids (0–9) — Advance", price: 75, seats: 50, salesStart: EARLY_END, salesEnd: LATE_START },
  { name: "Couple — Advance", price: 180, seats: 40, salesStart: EARLY_END, salesEnd: LATE_START, admits: 2 },
  { name: "Balcony seat — first come, first served", match: ["Special balcony seat"], note: "Seat only, no table · first come, first served", price: 75, seats: 50 },
  { name: "Adult (10+)", match: ["General"], price: 150, seats: 60, salesStart: LATE_START },
  { name: "Kids (0–9)", match: ["Teen"], price: 100, seats: 20, salesStart: LATE_START },
  { name: "Couple", match: ["Couple"], price: 250, seats: 10, salesStart: LATE_START, admits: 2 },
  {
    kind: "SPONSOR", name: "Silver sponsor", price: 1000, seats: 10, admits: 2, bannerMonths: 12, bannerSlot: "MOBILE", wallBricks: 25,
    perks: [
      "Your logo on the flyer, the standee and the event pages on GoDesi.com and NewYearEvesParty.com",
      "Linked to your GoDesi business page",
      "Thank-you announcement on stage during the party",
      "Thank-you post on GoDesi News",
      "2 tickets included",
      "320×100 banner on GoDesi.com for 1 year",
      "25 Wall of Fame bricks on GoDesi.com ($250 value)",
    ],
  },
  {
    kind: "SPONSOR", name: "Gold sponsor", price: 2500, seats: 5, admits: 4, bannerMonths: 12, bannerSlot: "SIDEBAR", wallBricks: 75,
    perks: [
      "Everything in Silver",
      "Your banner inside the Big Ball Room",
      "Your logo or 30-second clip on the LED screen",
      "4 tickets included",
      "300×250 side banner on GoDesi.com for 1 year (instead of 320×100)",
      "75 Wall of Fame bricks on GoDesi.com ($750 value)",
    ],
  },
  {
    kind: "SPONSOR", name: "Platinum sponsor", price: 5000, seats: 2, admits: 10, bannerMonths: 12, bannerSlot: "HALFPAGE", wallBricks: 200,
    perks: [
      "Everything in Gold",
      "\"Countdown to 2027 presented by <your business>\" at midnight",
      "Your standee at the entrance and your logo on the photo backdrop",
      "Reserved table for 10 with champagne and a \"Table sponsored by\" marker",
      "Vendor table to show your business at the party",
      "10 tickets included",
      "300×600 large side banner on GoDesi.com for 1 year (instead of 300×250)",
      "200 Wall of Fame bricks on GoDesi.com ($2,000 value)",
    ],
  },
  { kind: "SPONSOR", name: "Standee sponsor", price: 350, seats: 2, admits: 2, bannerMonths: 12, perks: ["Your standee at the entrance", "2 tickets included", BANNER_YEAR] },
  { kind: "SPONSOR", name: "Banner inside the hall", price: 300, seats: 4, admits: 2, bannerMonths: 12, perks: ["Your banner inside the Big Ball Room", "2 tickets included", BANNER_YEAR] },
  { kind: "SPONSOR", name: "LED screen logo or clip", price: 500, seats: 3, admits: 2, bannerMonths: 12, perks: ["Your logo or video clip on the LED screen", "2 tickets included", BANNER_YEAR] },
  { kind: "SPONSOR", name: "Table sponsor", price: 1500, seats: 10, admits: 0, bannerMonths: 12, perks: ["Bottle of champagne on the table", "Table marker: \"Table sponsored by <your business>\"", BANNER_YEAR] },
  { kind: "SPONSOR", name: "Belly dancer sponsor", price: 600, seats: 1, admits: 0, perks: ["Belly dancer Aamra's fire dance presented by your business"] },
  { kind: "SPONSOR", name: "Photo booth sponsor", price: 900, seats: 1, admits: 0, perks: ["Your logo on every photo booth photo"] },
  { kind: "SPONSOR", name: "Dhol sponsor", price: 400, seats: 1, admits: 0, perks: ["Dhol performance with your business name"] },
];

const REVIEWS: { name: string; comment: string; featured?: boolean }[] = [
  { name: "Priya", featured: true, comment: "Thank you for organizing such an incredible New Year's celebration! The event was spectacular. The venue was beautiful, the décor was vibrant, classy and elegant. The food options were great and delicious — the live food stations added a nice variety. The music and DJ was phenomenal, he had a good mix of genres and kept the energy alive on the dance floor. Loved the 360 dance station. Kudos to your team for all the effort that went into making it a memorable night for all of us. You keep raising the bar. Looking forward to the next one!" },
  { name: "Guest", featured: true, comment: "This was the best new year party I have ever attended, both in India and USA combined. Amazing food and dance floor — me and my friends danced our hearts out. You guys really managed the event very well, not too crowded, place to sit and what not. Will surely come to your party again next year." },
  { name: "Prema", featured: true, comment: "We have been attending your party for the past few years and love it. Everything was just perfect — from the warm atmosphere to the delicious food, music and thoughtful details. You truly have a talent for making everyone feel welcome and ensuring the night was unforgettable!" },
  { name: "Ambica", comment: "Thank you for hosting such an incredible New Year's party. From the moment I walked in, I could feel the warmth and love you put into every detail. The food was absolutely amazing — each dish was so delicious, and it truly added to the festive atmosphere. The DJ was fantastic, keeping the energy high and the dance floor alive all night long! But more than anything, it was your warmth and hospitality that made the night so special. It was a celebration we'll always cherish!" },
  { name: "Charul", comment: "Everything, from the warm ambiance to the delicious food and thoughtful details, made the evening truly special. Your effort in bringing everyone together and creating such a memorable experience is deeply appreciated. It was a beautiful way to ring in the new year, surrounded by great company and joy. To many more!" },
  { name: "Manish", comment: "You guys got so many blessings for hosting such an awesome NYE party, giving everyone so many amazing memories for a long time to cherish. Met so many new faces, made new friends. Looking forward to more such great events in future — keep doing what you are doing, you guys ROCK!!!" },
  { name: "Gayatri", comment: "Thank you so much for planning such an amazing New Year's Eve party! Everything was so well organized, the venue was spacious and comfortable, and the food was absolutely delicious. It was truly a fun and memorable way to ring in the new year. Fantastic job!" },
  { name: "Shri", comment: "The DJ rocked the event! Keeping everyone glued to the dance floor! This was the perfect end to 2024 and welcome to 2025! Great event start to finish!" },
  { name: "Smitha", comment: "It was such a joy to celebrate with close friends and make wonderful memories to kick off the new year. Rachna and Anil put in a lot of effort to make the evening special." },
  { name: "Nikita", comment: "As always, it was a well organized and a fun event. We have been coming to their event for a few years now and will continue to do so." },
  { name: "Deepa", comment: "It was great organizing — loved the food options, décor, DJ and music and the fun 360 dance station. Had a wonderful time and a great start to the new year!" },
  { name: "Guest", comment: "It was an amazing event. Live stations did bring variety and made it special. DJ was good and overall event was great. Rachna and Anil are very friendly and were easy to work with. Will look forward to attending events hosted by this amazing couple." },
  { name: "Twinkle", comment: "Thank you Anil & Rachna for hosting such a grand & wonderful NY event celebration — we absolutely loved it! In spite of my injury I'm happy I could join & enjoy with you guys. Thank you for having us!" },
  { name: "Charul", comment: "Exceptional event management! We enjoyed yet another year of fantastic 31st celebration with friends. Thank you Anil & Rachna. You guys are rockstars!" },
  { name: "Priya", comment: "Another great event by your team. Also one of the best DJs we have seen in a while!" },
  { name: "Manish", comment: "Food, gathering & ambience was fantastic. Great party!" },
  { name: "Sonia", comment: "Thank you Rachna ji and Anil ji for a wonderful new year party with yummy food and good DJ." },
  { name: "Shital", comment: "Amazing party… thanks so much Rachna for the last-minute accommodation!" },
  { name: "Vidhi", comment: "Amazing party. Thank you!" },
];

async function main() {
  const event = await db.event.findUnique({ where: { slug: SLUG }, include: { tiers: true } });
  if (!event) throw new Error(`No event ${SLUG}`);

  const used = new Set<string>();
  for (let index = 0; index < TIERS.length; index += 1) {
    const spec = TIERS[index];
    const names = [spec.name, ...(spec.match ?? [])];
    const existing = event.tiers.find((tier) => !used.has(tier.id) && names.includes(tier.name));
    if (existing) used.add(existing.id);
    const data = {
      name: spec.name,
      note: spec.note ?? null,
      price: spec.price,
      seatsTotal: Math.max(spec.seats, existing?.seatsBooked ?? 0),
      sortOrder: index,
      salesStart: spec.salesStart ?? null,
      salesEnd: spec.salesEnd ?? null,
      kind: spec.kind ?? "TICKET",
      admits: spec.admits ?? 1,
      perks: spec.perks ?? [],
      bannerMonths: spec.bannerMonths ?? null,
      bannerSlot: spec.bannerSlot ?? null,
      wallBricks: spec.wallBricks ?? 0,
    };
    if (existing) await db.ticketTier.update({ where: { id: existing.id }, data });
    else await db.ticketTier.create({ data: { ...data, eventId: event.id } });
  }

  const tiers = await db.ticketTier.findMany({ where: { eventId: event.id, kind: "TICKET" } });
  await db.event.update({
    where: { id: event.id },
    data: {
      startsAt: new Date("2026-12-31T20:00:00-05:00"),
      endsAt: new Date("2027-01-01T01:00:00-05:00"),
      timeZone: "America/New_York",
      imageUrl: FLYER,
      description: DESCRIPTION,
      reviewsAlbumUrl: REVIEWS_ALBUM,
      price: Math.min(...tiers.map((tier) => tier.price)),
      seatsTotal: Math.max(HALL_TICKETS, tiers.reduce((sum, tier) => sum + tier.seatsBooked, 0)),
    },
  });

  await db.$transaction([
    db.eventReview.deleteMany({ where: { eventId: event.id } }),
    db.eventReview.createMany({
      data: REVIEWS.map((review, index) => ({
        eventId: event.id,
        authorName: review.name,
        comment: review.comment,
        featured: Boolean(review.featured),
        source: "WhatsApp",
        sortOrder: index,
      })),
    }),
  ]);

  for (const slug of SPONSOR_BUSINESSES) {
    const business = await db.business.findUnique({ where: { slug }, select: { id: true } });
    if (!business) throw new Error(`No business ${slug}`);
    const key = { eventId: event.id, businessId: business.id };
    const existing = await db.eventSponsor.findUnique({ where: { eventId_businessId: key } });
    if (existing?.status !== "APPROVED")
      await db.eventSponsor.upsert({
        where: { eventId_businessId: key },
        create: { ...key, status: "APPROVED", approvedAt: new Date() },
        update: { status: "APPROVED", approvedAt: new Date() },
      });
  }

  console.log(`Updated ${SLUG}: ${tiers.length} tiers, ${REVIEWS.length} reviews, ${SPONSOR_BUSINESSES.length} sponsors linked`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
