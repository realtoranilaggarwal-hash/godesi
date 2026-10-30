import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const biz = await prisma.business.findUnique({ where: { slug: "india-center-of-westchester-hawthorne" } });
  const slug = "deepavali-karaoke-open-mic-charity-yonkers";
  if (await prisma.event.findUnique({ where: { slug } })) {
    console.log("event exists:", slug);
    return;
  }
  await prisma.event.create({
    data: {
      slug,
      title: "Video Karaoke & Fun Open Mic — Deepavali Charity Night",
      description: [
        "The India Center of Westchester and Anandha Raagam present their annual Deepavali charity event — an evening of video karaoke, open mic, delicious food and community celebration.",
        "",
        "Contribution $15–$25 (includes event admission and dinner).",
        "",
        "Proceeds benefit the Westchester Nepali Community and AWAKE Westchester (Asian Women's Alliance for Kinship & Equality).",
        "",
        "Donation & sponsorship levels: Silver $50 (1 participant free) · Gold $100 (2 free) · Diamond $250 (3 free) · Platinum $500 (4 free).",
        "",
        "Register & RSVP: https://tinyurl.com/ICARaagamKaraoke — questions: Bala 914-912-8320.",
      ].join("\n"),
      startsAt: new Date("2026-11-14T15:30:00-05:00"),
      endsAt: new Date("2026-11-14T20:00:00-05:00"),
      timeZone: "America/New_York",
      venue: "Yonkers Grinton I. Will Public Library",
      address: "1500 Central Park Ave, Yonkers, NY 10710",
      city: "Yonkers",
      state: "NY",
      country: "USA",
      imageUrl: "/events/deepavali-karaoke-charity-yonkers.jpg",
      price: 15,
      currency: "USD",
      seatsTotal: 200,
      status: "APPROVED",
      organizerId: "cms22di8e0000yelb71ajutf0",
      businessId: biz?.id,
      genres: ["karaoke", "open-mic", "festival-mela"],
      eventType: "celebration",
      tags: ["deepavali", "diwali", "karaoke", "charity"],
      features: ["vegetarian", "family-friendly", "charity"],
      websiteUrl: "https://tinyurl.com/ICARaagamKaraoke",
    },
  });
  console.log("event:", slug);
}

main().finally(() => prisma.$disconnect());
