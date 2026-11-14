/**
 * Moves the NYE 2027 main and Singles events under the NewYearEvesParty.com member
 * (user + business profile) and posts their announcement on GoDesi News from that member.
 * Safe to re-run: the news item is keyed by a fixed guid.
 *
 *   DATABASE_URL=... npx tsx scripts/nye-2027-to-newyearevesparty.ts
 */
import { db } from "@/lib/db";
import { newsPath } from "@/lib/newsLinks";

const MEMBER_EMAIL = "newyearevespartycom@gmail.com";
const EVENT_SLUGS = ["new-year-eves-party-2027-edison", "singles-new-years-eve-party-2027-nj"];
const GUID = "report:newyearevesparty-nye-2027";
const MAIN_FLYER = "https://godesi.com/flyers/nye-2027-grand-party.jpg";
const SINGLES_FLYER = "https://godesi.com/flyers/nye-2027-singles.jpg";

const TITLE = "Grand New Year's Eve Party 2027 at Royal Albert Palace, Fords NJ — tickets on sale";

const SUMMARY = [
  "NewYearEvesParty.com is hosting the Grand New Year's Eve Party 2027 on Thursday, December 31st, 2026, 8:00 PM to 1:00 AM, in the Big Ball Room at Royal Albert Palace, 1050 King Georges Post Rd, Fords NJ 08863 (near Edison).",
  "It's a family party: 35 food items, an elegant seated dining experience, an exclusive Plaza Hall with live food stations (dosa, jalebi, golgappa and more), premium drinks until midnight, a midnight champagne toast, live DJ Sandy of M&D Events, a live belly dance performance, the New York ball drop on live TV, multiple photo booths, exciting raffle prizes, Woodbridge Police security and free valet parking.",
  "Till Dec 15: Adults (18+) $95, Kids (9–17) $80, Kids (0–8) $65, Couple $180. From Dec 15: Adults $150, Kids (9–17) $90, Kids (0–8) $75, Couple $250. Book at NewYearEvesParty.com or godesi.com/9227.",
  "Singles get their own first-come-first-served balcony — chair only, no table, all inclusive — for only $75. Limited seats; singles seats on GoDesi are 21+ with photo ID checked at the door. Book at godesi.com/927.",
  "Call for tickets & info: Rachna 908-421-1685 · Anil 732-983-7958 · Ashok 732-921-5606. Sponsors: godesi.com/sponsor2027.",
].join("\n\n");

async function main() {
  const user = await db.user.findUniqueOrThrow({ where: { email: MEMBER_EMAIL } });
  const business = await db.business.findFirstOrThrow({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const moved = await db.event.updateMany({
    where: { slug: { in: EVENT_SLUGS } },
    data: { organizerId: user.id, businessId: business.id },
  });
  console.log(`Moved ${moved.count} events to ${business.name} (${business.slug})`);

  const data = {
    title: TITLE,
    summary: SUMMARY,
    source: business.name,
    submittedById: user.id,
    status: "PUBLISHED" as const,
    topic: "events",
    category: "Events & festivals",
    city: "Fords",
    state: "NJ",
    country: "US",
    sourceType: "Self",
    sourceUrl: "https://www.newyearevesparty.com",
    imageUrl: MAIN_FLYER,
    photoUrls: [MAIN_FLYER, SINGLES_FLYER],
    declaredAt: new Date(),
  };
  const item = await db.newsItem.upsert({
    where: { guid: GUID },
    update: data,
    create: { ...data, guid: GUID, link: "" },
  });
  const link = newsPath(item);
  await db.newsItem.update({ where: { id: item.id }, data: { link } });
  console.log(`News: https://godesi.com${link}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
