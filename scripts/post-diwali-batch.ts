import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(text: string) {
  return text.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

async function unclaimedCard(name: string, slug: string, category: string, city: string, state: string, description: string) {
  const existing = await prisma.business.findUnique({ where: { slug } });
  if (existing) return existing.id;
  const card = await prisma.business.create({
    data: { slug, name, category, city, state, description, status: "APPROVED" },
  });
  return card.id;
}

async function main() {
  // ---------- 1. News: selective framing story ----------
  const guid = `report:${crypto.randomUUID()}`;
  const summary = [
    "One newspaper. One writer. Two religious fasts — described very differently.",
    "",
    "The New Indian Express this week ran “The Hunger Games of Karwa Chauth” by reporter Vernika Awal — a Delhi story about mehndi artists working hungry through the festival rush. Fair enough: workers deserve breaks. But the piece goes further, calling Karwa Chauth “a festival built around hunger” and framing the day itself as the problem.",
    "",
    "The same writer covered Ramzan last year in a piece headlined “Feasts of Faith: The Role of Food in Ramzan” — a warm story about community, sehri and iftar, and food as an expression of faith.",
    "",
    "That contrast is what readers are questioning. Karwa Chauth — a fast millions of women observe with love and devotion — gets a dystopian nickname. Ramzan gets poetry. Criticism of a festival is fair journalism. But when one faith’s practice is framed as a spectacle and another’s as sacred, it reads less like reporting and more like a double standard.",
    "",
    "Journalism should apply the same standards of fairness, context and sensitivity to every faith. Religious practices deserve to be examined critically — but the language used should not create a perception of bias against one community.",
    "",
    "Criticism is fair. Selective framing deserves scrutiny.",
    "",
    "On GoDesi",
    "Karwa Chauth — dates, meaning & events: https://godesi.com/festivals/karwa-chauth",
    "Eid al-Fitr & Ramzan events: https://godesi.com/festivals/eid-al-fitr",
    "All festivals calendar: https://godesi.com/festivals",
    "Vote in today’s question about selective journalism: https://godesi.com",
    "Report your own local story: https://godesi.com/news/report",
  ].join("\n");

  const item = await prisma.newsItem.create({
    data: {
      guid,
      title: "Karwa Chauth called “Hunger Games”, Ramzan called “Feasts of Faith” — same writer, selective framing",
      summary,
      imageUrl: "/news/selective-framing-karwa-chauth-ramzan.jpg",
      link: "pending",
      source: "GoDesi newsroom",
      topic: "faith",
      category: "Opinion",
      sourceType: "News",
      sourceUrl: "https://www.newindianexpress.com",
      photoUrls: ["/news/selective-framing-karwa-chauth-ramzan.jpg"],
      status: "PUBLISHED",
      publishedAt: new Date(),
      happenedAt: new Date(),
      country: "India",
    },
  });
  const link = `/news/${slugify(item.title)}-${item.id}`;
  await prisma.newsItem.update({ where: { id: item.id }, data: { link } });
  console.log("news:", link);

  // ---------- 2. Today's poll -> selective journalism ----------
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const q = await prisma.pollQuestion.findUnique({ where: { day: today } });
  if (q) {
    await prisma.pollVote.deleteMany({ where: { questionId: q.id } });
    await prisma.pollQuestion.update({
      where: { id: q.id },
      data: {
        text: "A paper called Karwa Chauth “Hunger Games” but Ramzan “Feasts of Faith”. How should readers respond to selective framing?",
        options: [
          "Call it out — demand equal standards for every faith",
          "Write to the editor asking for fairness",
          "Share the story so more people see it",
          "Ignore it — media won't change",
        ],
      },
    });
    console.log("poll updated:", q.id);
  }

  // ---------- 3. Cards for organizers/venues ----------
  const ncaiaId = await unclaimedCard(
    "National Council of Asian Indian Associations (NCAIA)",
    "ncaia-manassas",
    "Community organization",
    "Manassas", "VA",
    "National Council of Asian Indian Associations — unity, advocacy, community and service for the Indian-American community, HQ in Virginia.",
  );
  const magnoliaId = await unclaimedCard(
    "Magnolia Grand Conference & Event Center",
    "magnolia-grand-conference-manassas",
    "Banquet hall & event venue",
    "Manassas", "VA",
    "Grand conference and event center on Infantry Ridge Rd, Manassas VA — receptions, banquets and community celebrations.",
  );
  const viaanaId = await unclaimedCard(
    "Viaana & Co.",
    "viaana-and-co-jersey-city",
    "Event production",
    "Jersey City", "NJ",
    "Event production company co-presenting Diwali celebrations in New Jersey.",
  );
  const royalId = await unclaimedCard(
    "Royal Events & Entertainment",
    "royal-events-entertainment-nj",
    "Event organizer",
    "Iselin", "NJ",
    "New Jersey event company behind Dhanteras & Diwali shopping fests and community melas. Booth inquiries: 609-216-2795.",
  );
  const apaId = await unclaimedCard(
    "APA Hotel Woodbridge",
    "apa-hotel-woodbridge-iselin",
    "Hotel & event venue",
    "Iselin", "NJ",
    "Hotel and conference venue at 120 S Wood Avenue, Iselin NJ — banquets, expos and community events.",
  );

  const admin = "cms22di8e0000yelb71ajutf0";

  // ---------- 4. Events ----------
  async function upsertEvent(slug: string, data: Record<string, unknown>) {
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) {
      console.log("event exists:", slug);
      return;
    }
    await prisma.event.create({ data: { slug, ...(data as object) } as never });
    console.log("event:", slug);
  }

  await upsertEvent("ncaia-diwali-reception-manassas", {
    title: "NCAIA Grand Diwali Reception — Welcoming Hon. Satyapriya Singh",
    description: [
      "The National Council of Asian Indian Associations warmly invites you to a grand reception welcoming Ms. Satyapriya Singh, Minister of Community Affairs & Personnel at the Embassy of India, Washington D.C.",
      "",
      "Celebrating new beginnings, strengthening community bonds, and sharing the joy of Diwali — cultural program, lunch and remarks by special dignitaries.",
      "",
      "Tables & tickets (tables seat 10): Platinum $1,000 · Gold $650 · Silver $550 · General $450 · Individual seat $45.",
      "",
      "Coordinators — Avni Srinivas Tatipamula 571-421-5109 · Arvind P. Singh 443-459-6628 · Ramu Mundrathi 248-890-8934. Zelle: NCAIAHQINVA@GMail.Com. Sponsorships welcome — pro-India organizations invited to join.",
    ].join("\n"),
    startsAt: new Date("2026-11-01T12:00:00-05:00"),
    endsAt: new Date("2026-11-01T15:00:00-05:00"),
    timeZone: "America/New_York",
    venue: "Magnolia Grand Conference & Event Center",
    address: "6991 Infantry Ridge Rd, Manassas, VA 20109",
    city: "Manassas",
    state: "VA",
    country: "USA",
    imageUrl: "/events/ncaia-diwali-reception-manassas.jpg",
    price: 45,
    currency: "USD",
    seatsTotal: 400,
    status: "APPROVED",
    organizerId: admin,
    businessId: ncaiaId,
    genres: ["festival-mela"],
    eventType: "celebration",
    tags: ["diwali", "ncaia", "embassy-of-india"],
    features: ["vegetarian", "free-parking"],
  });
  console.log("magnolia card:", magnoliaId);

  await upsertEvent("diwali-together-waterfront-exchange-place", {
    title: "Diwali Together — Diwali on the Waterfront",
    description: [
      "Indo American Festivals Inc. and Viaana & Co. present Diwali on the Waterfront — where Diwali feels like home, with the Manhattan skyline as the backdrop.",
      "",
      "Lakshmi Ganesh Aarti & signature diya moment · Ramleela by Navrang Dance Academy · Bollywood jamming by KissaMusic · Kids techno DJ by DJ Shivga · Dhol Tasha & Punjabi dhol dance by Siddhivinayak Dhol Tasha & Dhol Diligence.",
      "",
      "FREE event, open to all — registration required (free sweets for all!). Register via @diwalitogether on Instagram.",
      "Media partners: Radio Zindagi, The Indian Eye News Group, Global Punjab, India Life TV, TV Asia.",
    ].join("\n"),
    startsAt: new Date("2026-11-07T15:00:00-05:00"),
    endsAt: new Date("2026-11-07T19:00:00-05:00"),
    timeZone: "America/New_York",
    venue: "Exchange Place waterfront",
    address: "Montgomery Street (between Greene & Hudson Streets), Jersey City, NJ",
    city: "Jersey City",
    state: "NJ",
    country: "USA",
    imageUrl: "/events/diwali-together-exchange-place.jpg",
    price: 0,
    currency: "USD",
    seatsTotal: 2000,
    status: "APPROVED",
    organizerId: admin,
    businessId: (await prisma.business.findUnique({ where: { slug: "indo-american-festivals-old-bridge" } }))?.id ?? viaanaId,
    genres: ["festival-mela", "garba-dandiya"],
    eventType: "celebration",
    tags: ["diwali", "jersey-city", "free"],
    features: ["free-entry", "family-friendly", "outdoor"],
  });

  await upsertEvent("dhanteras-diwali-shopping-fest-iselin", {
    title: "Dhanteras & Diwali Shopping Fest",
    description: [
      "Royal Events & Entertainment presents a Dhanteras & Diwali Shopping Fest — shopping, food and entertainment under one roof.",
      "",
      "40+ vendors: fashion jewelry, sarees, men's wear, home decor, accessories and more. Last-minute Dhanteras & Diwali shopping!",
      "",
      "FREE entry · FREE parking · Free Diwali gifts for the first 100 guests · Free raffles & giveaways.",
      "",
      "Booth inquiries: 609-216-2795 or 609-937-2806. Instagram: @businessnjevents @royaleventsnj",
    ].join("\n"),
    startsAt: new Date("2026-11-06T15:00:00-05:00"),
    endsAt: new Date("2026-11-06T21:00:00-05:00"),
    timeZone: "America/New_York",
    venue: "APA Hotel Woodbridge",
    address: "120 S Wood Avenue, Iselin, NJ 08830",
    city: "Iselin",
    state: "NJ",
    country: "USA",
    imageUrl: "/events/dhanteras-diwali-shopping-fest-iselin.jpg",
    price: 0,
    currency: "USD",
    seatsTotal: 800,
    status: "APPROVED",
    organizerId: admin,
    businessId: royalId,
    genres: ["festival-mela", "shopping-expo"],
    eventType: "expo",
    tags: ["diwali", "dhanteras", "shopping", "free"],
    features: ["free-entry", "free-parking", "family-friendly"],
  });
  console.log("apa card:", apaId);
}

main().finally(() => prisma.$disconnect());
