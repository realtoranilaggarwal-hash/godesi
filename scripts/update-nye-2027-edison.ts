/**
 * Brings the NYE 2027 Edison listing in line with the organiser's flyer: 8 PM start,
 * flyer image, early (till Nov 15) / late (from Dec 20) ticket prices plus balcony
 * seats, and guest reviews typed out from the WhatsApp review album (first names only).
 * Safe to re-run: tiers are matched by name, reviews are replaced.
 *
 *   DATABASE_URL=... npx tsx scripts/update-nye-2027-edison.ts
 */
import { db } from "@/lib/db";

const SLUG = "new-year-eves-party-2027-edison";
const FLYER = "https://godesi.com/flyers/nye-2027-royal-albert-palace.jpg";
const REVIEWS_ALBUM = "https://photos.app.goo.gl/nQrusW5e5pojmj7P7";

/** Windows are in New York time; salesEnd is exclusive, so early tickets sell through Nov 15. */
const EARLY_END = new Date("2026-11-16T00:00:00-05:00");
const LATE_START = new Date("2026-12-20T00:00:00-05:00");

const DESCRIPTION = [
  "Grand New Year's Eve Party 2027 in the Big Ball Room at Royal Albert Palace — Thursday, December 31st, 8:00 PM to 1:00 AM. Hosted by NewYearEvesParty.com, celebrating since 2018.",
  "DJ Sandy of M&D Events keeps the dance floor packed all night, and famous belly dancer Aamra performs her fire dance. The Big Ball Room is lit by 22 head spot lights.",
  "Food is served in the exclusive Plaza Hall with live stations — dosa, jalebi, golgappa and many more — plus premium drinks. Valet parking and a lot more.",
  "Early tickets (till Nov 15th) include table seating: Adult (10+) $85, Kids (0–9) $65, Couple $160. From Dec 20th: Adult $150, Kids $100, Couple $250. Special chair-only balcony seats (no table) $75.",
  "Sponsors welcome — call 732-877-8585.",
].join("\n\n");

/**
 * The hall holds 400 people, so seats across all tiers add up to 400, counting a couple as 2:
 * early 120 + 50 + 40×2 = 250, balcony 50, late 60 + 20 + 10×2 = 100.
 * `match` lists the old names so the existing late tiers (and their bookings) are kept.
 */
const TIERS = [
  { name: "Adult (10+) — Early bird", note: "Table seating included", price: 85, seats: 120, salesEnd: EARLY_END },
  { name: "Kids (0–9) — Early bird", note: "Table seating included", price: 65, seats: 50, salesEnd: EARLY_END },
  { name: "Couple — Early bird", note: "Table seating included", price: 160, seats: 40, salesEnd: EARLY_END },
  { name: "Special balcony seat", note: "Chair only, no table", price: 75, seats: 50 },
  { name: "Adult (10+)", match: ["General"], price: 150, seats: 60, salesStart: LATE_START },
  { name: "Kids (0–9)", match: ["Teen"], price: 100, seats: 20, salesStart: LATE_START },
  { name: "Couple", match: ["Couple"], price: 250, seats: 10, salesStart: LATE_START },
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

  for (let index = 0; index < TIERS.length; index += 1) {
    const spec = TIERS[index];
    const names = [spec.name, ...(spec.match ?? [])];
    const existing = event.tiers.find((tier) => names.includes(tier.name));
    const data = {
      name: spec.name,
      note: spec.note ?? null,
      price: spec.price,
      seatsTotal: Math.max(spec.seats, existing?.seatsBooked ?? 0),
      sortOrder: index,
      salesStart: spec.salesStart ?? null,
      salesEnd: spec.salesEnd ?? null,
    };
    if (existing) await db.ticketTier.update({ where: { id: existing.id }, data });
    else await db.ticketTier.create({ data: { ...data, eventId: event.id } });
  }

  const tiers = await db.ticketTier.findMany({ where: { eventId: event.id } });
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
      seatsTotal: tiers.reduce((sum, tier) => sum + tier.seatsTotal, 0),
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

  console.log(`Updated ${SLUG}: ${tiers.length} tiers, ${REVIEWS.length} reviews`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
