import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";

/**
 * Dr. Gurudeva's $500 package, paid $100 for the first year (renewal is billed
 * Nov 2027): Premium plan, featured astrologer page with the "first call free
 * when you mention GoDesi" offer, astrologer-rail + sidebar banners, a
 * gemstones classified and a GoDesi News Desk write-up. Re-runnable.
 *
 *   npx tsx scripts/add-dr-gurudeva.ts
 */
const db = new PrismaClient();

const EMAIL = "doctor_deva@yahoo.com";
const SLUG = "dr-gurudeva-indian-vedic-astrologer-jyotish-highland-park";
const LINK = `/business/${SLUG}`;
const ENDS = new Date("2027-11-26T05:00:00Z"); // end of Nov 25, 2027 ET
const PAYMENT_REF = "manual:premium:dr-gurudeva:2026";
const ADMIN_ID = "cms24edsq0000t9gk48f24h5h"; // GoDesi News Desk author
const OFFER = "First phone consultation FREE when you mention GoDesi";
const PHONE = "+17324480667";
const TITLE = "Dr. Gurudeva — Indian Vedic Astrologer, Highland Park NJ";
const LISTING_SLUG = "lucky-gemstones-yantras-dr-gurudeva-highland-park-nj";
const NEWS_TITLE =
  "Dr. Gurudeva: 35 Years of Family-Tradition Vedic Astrology in Highland Park, NJ";

const description = [
  "Dr. Gurudeva is an Indian Vedic astrologer in Highland Park, New Jersey, with 35 years of practice in a family tradition of jyotish passed down through generations.",
  "",
  "He specializes in Parashara, Nadi and Bhrigu jyotish, and prepares kundalis and horoscope-matching charts calculated for US time zones.",
  "",
  "Services: horoscope and kundli readings, kundli matching for marriage, career, business and health readings, muhurthams, Manglik (Kuja dosha), Sade Sati, Kaal Sarp and other dosha remedies, lucky gemstones, yantras, pujas, rituals and homas.",
  "",
  "Readings in English, Hindi, Tamil, Telugu, Kannada, Malayalam and Marathi — by phone, video, WhatsApp or in person by appointment (601 Leia Lane, Highland Park, NJ 08904). Available 7 days, 9 AM to 9 PM.",
  "",
  `${OFFER}. Call (732) 448-0667.`,
].join("\n");

const listingDescription = [
  "Lucky gemstones, gem rings and pendants, and yantras chosen by Dr. Gurudeva for your horoscope — the right gem, weight and finger for your planets, worn at an auspicious time.",
  "",
  "Gems are matched to your birth chart, age and weight. Ask about a Lucky Gem Report before you buy.",
  "",
  `Pick up in Highland Park, NJ or have it shipped. ${OFFER} — call or WhatsApp (732) 448-0667.`,
].join("\n");

const newsSummary = [
  "HIGHLAND PARK, NJ – For 35 years, Dr. Gurudeva has guided Indian-American families across New Jersey and the US through one of India's oldest traditions: Vedic astrology, or jyotish.",
  "",
  `Astrology runs in his family, passed down from one generation to the next. He specializes in Parashara, Nadi and Bhrigu jyotish, and he prepares kundalis and horoscope-matching charts calculated for US time zones, a detail that matters for children born in America whose charts are often drawn with Indian time. You can find him on GoDesi as [Dr. Gurudeva, Indian Vedic Astrologer](https://godesi.com${LINK}).`,
  "",
  "Readings for Life's Big Decisions",
  "",
  "Families come to Dr. Gurudeva for kundli matching before a marriage, muhurthams for weddings, griha pravesh and new ventures, and readings on career, business, health and education. He is known for remedies for Manglik (Kuja dosha), Sade Sati and Kaal Sarp dosha, and for recommending gemstones, yantras, pujas, rituals and homas.",
  "",
  "Gems, he explains, are considered a first remedy in Vedic astrology, and only certain gems suit a given person: the stone, its weight and the finger it is worn on depend on the strength of the planets in a person's chart. His gem advice and articles are on his website, [luckygemfinder.com](https://www.luckygemfinder.com/).",
  "",
  "Many Languages, Seven Days a Week",
  "",
  "Dr. Gurudeva reads in English, Hindi, Tamil, Telugu, Kannada, Malayalam and Marathi, by phone, video and WhatsApp, and in person by appointment at 601 Leia Lane, Highland Park. He is available seven days a week, 9 AM to 9 PM.",
  "",
  "A Free First Call for GoDesi Readers",
  "",
  "GoDesi readers get their first phone consultation free: call (732) 448-0667 and mention GoDesi.",
  "",
  "GoDesi News Desk",
  "Connecting the Desi community through stories, people, culture, faith, and events.",
  "",
  "Astrology is a matter of personal faith and belief; readings are not a substitute for medical, legal or financial advice.",
].join("\n");

const BANNERS = [
  { slot: "ASTRO", imageUrl: "/images/ads/dr-gurudeva-astro.png" },
  { slot: "SIDEBAR", imageUrl: "/images/ads/dr-gurudeva-sidebar.png" },
] as const;

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

async function main() {
  const user = await db.user.findFirstOrThrow({ where: { email: EMAIL } });
  const business = await db.business.findFirstOrThrow({
    where: { slug: SLUG, ownerId: user.id },
  });

  await db.user.update({
    where: { id: user.id },
    data: { plan: "PREMIUM", planExpiresAt: ENDS },
  });
  await db.payment.upsert({
    where: { reference: PAYMENT_REF },
    update: {},
    create: {
      userId: user.id,
      plan: "PREMIUM",
      amountMinor: 10_000,
      currency: "USD",
      provider: "manual",
      reference: PAYMENT_REF,
    },
  });

  await db.business.update({
    where: { id: business.id },
    data: {
      name: TITLE,
      description,
      state: "NJ",
      address: "601 Leia Lane, Highland Park, NJ 08904",
      websiteUrl: "https://www.luckygemfinder.com/",
      status: "APPROVED",
      featured: true,
      featuredUntil: ENDS,
      featuredRank: 3,
      yearsExperience: 35,
      referralOffer: OFFER,
      seoTitle: "Dr. Gurudeva — Indian Vedic Astrologer in NJ | Kundli, Horoscope Matching, Gems",
      seoDescription:
        "Indian Vedic astrologer in Highland Park, NJ: kundli and horoscope matching for US time zones, dosha remedies, lucky gemstones, pujas and homas. First call free when you mention GoDesi: (732) 448-0667.",
      specialties: Array.from(
        new Set([
          ...business.specialties,
          "Kundli matching",
          "Gemstone recommendation",
          "Manglik / Kuja dosha remedies",
          "Sade Sati remedies",
          "Kaal Sarp dosha remedies",
          "Muhurtham",
          "Pujas & homas",
        ]),
      ),
    },
  });

  const deal = await db.deal.findFirst({ where: { businessId: business.id, code: "GODESI" } });
  const dealData = {
    title: OFFER,
    details:
      "Call Dr. Gurudeva at (732) 448-0667 and say you found him on GoDesi.com — your first phone consultation is free. Kundli, horoscope matching, gemstones and dosha remedies.",
    code: "GODESI",
    linkUrl: `https://godesi.com${LINK}`,
    expiresAt: new Date(ENDS.getTime() - 1000),
    active: true,
  };
  if (deal) await db.deal.update({ where: { id: deal.id }, data: dealData });
  else await db.deal.create({ data: { ...dealData, businessId: business.id } });

  for (const banner of BANNERS) {
    const data = { ...banner, title: TITLE, linkUrl: LINK, endsAt: ENDS, advertiserId: user.id };
    const existing = await db.banner.findFirst({
      where: { imageUrl: banner.imageUrl },
      select: { id: true },
    });
    if (existing) {
      await db.banner.update({ where: { id: existing.id }, data: { ...data, active: true, status: "ACTIVE" } });
      continue;
    }
    const last = await db.banner.aggregate({ where: { slot: banner.slot }, _max: { position: true } });
    await db.banner.create({ data: { ...data, position: (last._max.position ?? 0) + 1 } });
  }

  const listingData = {
    kind: "MARKETPLACE" as const,
    title: "Lucky gemstones, gem rings & yantras — Dr. Gurudeva, Highland Park NJ",
    description: listingDescription,
    city: "Highland Park",
    state: "NJ",
    country: "USA",
    price: 0,
    currency: "USD",
    categorySlug: "buy-sell-jewellery-and-gold",
    deliveryOption: "either",
    contactName: "Dr. Gurudeva",
    contactPhone: PHONE,
    contactEmail: EMAIL,
    whatsapp: "17324480667",
    status: "APPROVED" as const,
    featured: true,
  };
  const listing = await db.listing.upsert({
    where: { slug: LISTING_SLUG },
    update: listingData,
    create: { ...listingData, slug: LISTING_SLUG, ownerId: user.id },
  });
  if (business.logoUrl && !(await db.listingImage.count({ where: { listingId: listing.id } }))) {
    await db.listingImage.create({ data: { listingId: listing.id, url: business.coverUrl ?? business.logoUrl } });
  }

  const now = new Date();
  const newsData = {
    title: NEWS_TITLE,
    summary: newsSummary,
    imageUrl: "/images/ads/dr-gurudeva-sidebar.png",
    source: "GoDesi News Desk",
    status: "PUBLISHED" as const,
    topic: "faith",
    category: "Local",
    city: "Highland Park",
    state: "NJ",
    country: "USA",
    sourceType: "News",
    sourceUrl: "https://www.luckygemfinder.com/",
    submittedById: ADMIN_ID,
  };
  const story = await db.newsItem.findFirst({ where: { title: NEWS_TITLE } });
  const saved = story
    ? await db.newsItem.update({ where: { id: story.id }, data: newsData })
    : await db.newsItem.create({
        data: { ...newsData, guid: `report:${randomUUID()}`, link: "", publishedAt: now, happenedAt: now },
      });
  const link = `/news/${slugify(NEWS_TITLE).slice(0, 70).replace(/-+$/, "")}-${saved.id}`;
  await db.newsItem.update({ where: { id: saved.id }, data: { link } });

  console.log({ business: LINK, listing: `/listings/${LISTING_SLUG}`, news: link });
}

main().finally(() => db.$disconnect());
