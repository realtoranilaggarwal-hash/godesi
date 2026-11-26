import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";

/**
 * Master Lakshman Ji's $200 Premium package (pay link in his welcome email;
 * renews Nov 2027): Premium plan, featured astrologer page with WhatsApp and
 * the "first consultation free when you mention GoDesi" offer, astrologer-rail
 * + sidebar banners, a featured classified, 5 gigs on his profile and a GoDesi
 * News Desk write-up. Facts are from his Google listing and astrolakshmanji.com.
 * Re-runnable.
 *
 *   npx tsx scripts/add-master-lakshman.ts
 */
const db = new PrismaClient();

const EMAIL = "astrologerlakshman9@gmail.com";
const SLUG = "master-lakshman-ji-astrologer-psychic-healer-jersey-city";
const LINK = `/business/${SLUG}`;
const SITE = "https://godesi.com";
const ENDS = new Date("2027-11-27T05:00:00Z"); // end of Nov 26, 2027 ET
const ADMIN_ID = "cms24edsq0000t9gk48f24h5h"; // GoDesi News Desk author
const OFFER = "First consultation FREE when you mention GoDesi";
const PHONE = "+12018843046";
const WHATSAPP = "12018843046";
const WEBSITE = "https://astrolakshmanji.com/";
const ADDRESS = "2984 John F. Kennedy Blvd, Jersey City, NJ 07306";
const TITLE = "Master Lakshman Ji — Astrologer & Psychic Healer, Jersey City NJ";
const LISTING_SLUG = "kundli-palm-tarot-readings-master-lakshman-ji-jersey-city-nj";
const NEWS_TITLE =
  "Master Lakshman Ji: Astrology, Kundli and Psychic Guidance on JFK Boulevard, Jersey City";

const description = [
  "Master Lakshman Ji is an astrologer, psychic reader and spiritual healer in Jersey City, New Jersey.",
  "",
  "Services: birth chart (kundli) analysis, marriage and compatibility readings, love and relationship guidance, career and financial guidance, planetary dosha analysis and personalized remedies, palm reading, tarot card reading, psychic reading, and negative energy removal.",
  "",
  `Consultations in person at ${ADDRESS}, or by phone, WhatsApp and online. Open 9 AM to 11 PM.`,
  "",
  `${OFFER}. Call or WhatsApp (201) 884-3046.`,
].join("\n");

const listingDescription = [
  "Kundli and birth chart readings, palm and tarot readings, love, marriage and career guidance, and dosha remedies with Master Lakshman Ji in Jersey City, NJ.",
  "",
  `Visit in person at ${ADDRESS} or consult by phone, WhatsApp or online, 9 AM to 11 PM.`,
  "",
  `${OFFER} — call or WhatsApp (201) 884-3046.`,
].join("\n");

const newsSummary = [
  "JERSEY CITY, NJ – On John F. Kennedy Boulevard in Jersey City, Master Lakshman Ji offers astrology readings, psychic guidance and spiritual healing to the desi community and anyone looking for direction.",
  "",
  `His readings start from the birth chart. He prepares kundli and birth chart analyses, marriage and compatibility readings, and guidance on love, career and money, and he looks at planetary doshas and suggests personalized remedies. He also reads palms and tarot cards. You can find him on GoDesi as [Master Lakshman Ji, Astrologer & Psychic Healer](https://godesi.com${LINK}).`,
  "",
  "In Person, by Phone or Online",
  "",
  `Clients can visit him at ${ADDRESS}, or consult by phone, WhatsApp or online. He is available from 9 AM to 11 PM, and his Google listing has a 5.0 rating from more than 270 reviews. More about his services is on his website, [astrolakshmanji.com](${WEBSITE}).`,
  "",
  "A Free First Consultation for GoDesi Readers",
  "",
  "GoDesi readers get their first consultation free: call or WhatsApp (201) 884-3046 and mention GoDesi.",
  "",
  "GoDesi News Desk",
  "Connecting the Desi community through stories, people, culture, faith, and events.",
  "",
  "Astrology is a matter of personal faith and belief; readings are not a substitute for medical, legal or financial advice.",
].join("\n");

const BANNERS = [
  { slot: "ASTRO", imageUrl: `${SITE}/images/ads/master-lakshman-astro.png` },
  { slot: "SIDEBAR", imageUrl: `${SITE}/images/ads/master-lakshman-sidebar.png` },
] as const;

type GigSeed = {
  slug: string;
  title: string;
  description: string;
  includes: string;
  price: number;
  minutes: number;
  image: string;
  tags: string[];
};

const GIGS: GigSeed[] = [
  {
    slug: "kundli-birth-chart-reading-master-lakshman-ji",
    title: "Kundli & birth chart reading",
    description:
      "Master Lakshman Ji reads your birth chart (kundli) and explains your planets, strengths and the periods ahead. Send your date, time and place of birth after you order.",
    includes: "Birth chart analysis\nKey planets and current period\nAnswers to your questions",
    price: 31,
    minutes: 30,
    image: "/images/gigs/master-lakshman-logo.jpg",
    tags: ["kundli", "birth chart", "vedic astrology", "horoscope", "jersey city"],
  },
  {
    slug: "love-marriage-compatibility-reading-master-lakshman-ji",
    title: "Love, marriage & compatibility reading",
    description:
      "A reading on love, relationships and marriage, including compatibility between two charts. Send both partners' birth details after you order.",
    includes: "Compatibility of two charts\nRelationship guidance\nAnswers to your questions",
    price: 31,
    minutes: 30,
    image: "/images/gigs/master-lakshman-love.jpg",
    tags: ["love", "marriage", "compatibility", "relationship", "kundli matching"],
  },
  {
    slug: "career-financial-guidance-master-lakshman-ji",
    title: "Career & financial guidance reading",
    description:
      "Guidance on job, career, business and money questions, read from your birth chart. Send your birth details and your questions after you order.",
    includes: "Career and business reading\nMoney and timing guidance\nAnswers to your questions",
    price: 31,
    minutes: 30,
    image: "/images/gigs/master-lakshman-business.jpg",
    tags: ["career", "business", "finance", "job", "astrology"],
  },
  {
    slug: "planetary-dosha-analysis-remedies-master-lakshman-ji",
    title: "Planetary dosha analysis & personal remedies",
    description:
      "Master Lakshman Ji checks your chart for planetary doshas and suggests personalized remedies. Send your date, time and place of birth after you order.",
    includes: "Dosha check of your chart\nPersonalized remedies\nAnswers to your questions",
    price: 51,
    minutes: 45,
    image: "/images/gigs/master-lakshman-b.jpg",
    tags: ["dosha", "remedies", "manglik", "vedic astrology", "spiritual healing"],
  },
  {
    slug: "palm-tarot-reading-master-lakshman-ji",
    title: "Palm & tarot card reading",
    description:
      "A palm reading and tarot card reading on the question that matters most to you right now. Send clear photos of both palms and your question after you order.",
    includes: "Palm reading from photos\nTarot card spread\nAnswers to your question",
    price: 21,
    minutes: 20,
    image: "/images/gigs/master-lakshman-a.jpg",
    tags: ["palm reading", "tarot", "psychic reading", "jersey city", "new jersey"],
  },
];

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

  await db.user.update({
    where: { id: user.id },
    data: { plan: "PREMIUM", planExpiresAt: ENDS },
  });

  const businessData = {
    name: TITLE,
    profileType: "PROFESSIONAL" as const,
    category: "Astrologers",
    categorySlug: "religious-services",
    subcategorySlug: "religious-services-astrologers",
    description,
    city: "Jersey City",
    state: "NJ",
    country: "USA",
    address: ADDRESS,
    phone: PHONE,
    whatsappNumber: WHATSAPP,
    websiteUrl: WEBSITE,
    mapsUrl: "https://maps.app.goo.gl/jX7CFqS3kc4yZ5UZA",
    logoUrl: `${SITE}/images/ads/master-lakshman-logo.jpg`,
    coverUrl: `${SITE}/covers/master-lakshman-ji.jpg`,
    availability: "9 AM – 11 PM",
    serviceOptions: ["In person", "Phone call", "Video call", "WhatsApp / chat"],
    specialties: [
      "Kundli / birth chart analysis",
      "Marriage & compatibility",
      "Love & relationships",
      "Career & finance",
      "Planetary dosha remedies",
      "Palm reading",
      "Tarot card reading",
      "Psychic reading",
      "Negative energy removal",
    ],
    status: "APPROVED" as const,
    featured: true,
    featuredUntil: ENDS,
    featuredRank: 3,
    referralOffer: OFFER,
    seoTitle: "Master Lakshman Ji — Astrologer & Psychic in Jersey City, NJ | Kundli, Palm, Tarot",
    seoDescription:
      "Astrologer and psychic healer in Jersey City, NJ: kundli and birth chart analysis, marriage compatibility, career guidance, dosha remedies, palm and tarot readings. First consultation free when you mention GoDesi: (201) 884-3046.",
  };
  const business = await db.business.upsert({
    where: { slug: SLUG },
    update: businessData,
    create: { ...businessData, slug: SLUG, ownerId: user.id },
  });

  const deal = await db.deal.findFirst({ where: { businessId: business.id, code: "GODESI" } });
  const dealData = {
    title: OFFER,
    details:
      "Call or WhatsApp Master Lakshman Ji at (201) 884-3046 and say you found him on GoDesi.com — your first consultation is free. Kundli, love and marriage, career, dosha remedies, palm and tarot readings.",
    code: "GODESI",
    linkUrl: `${SITE}${LINK}`,
    expiresAt: new Date(ENDS.getTime() - 1000),
    active: true,
  };
  if (deal) await db.deal.update({ where: { id: deal.id }, data: dealData });
  else await db.deal.create({ data: { ...dealData, businessId: business.id } });

  for (const banner of BANNERS) {
    // Absolute URLs: the advertiser's "My ads" editor only accepts full URLs.
    const data = { ...banner, title: TITLE, linkUrl: `${SITE}${LINK}`, endsAt: ENDS, advertiserId: user.id };
    const existing = await db.banner.findFirst({
      where: { imageUrl: { endsWith: banner.imageUrl.replace(SITE, "") } },
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
    title: "Kundli, palm & tarot readings + remedies — Master Lakshman Ji, Jersey City NJ",
    description: listingDescription,
    city: "Jersey City",
    state: "NJ",
    country: "USA",
    price: 0,
    currency: "USD",
    categorySlug: "buy-sell",
    deliveryOption: "either",
    contactName: "Master Lakshman Ji",
    contactPhone: PHONE,
    contactEmail: EMAIL,
    whatsapp: WHATSAPP,
    status: "APPROVED" as const,
    featured: true,
  };
  const listing = await db.listing.upsert({
    where: { slug: LISTING_SLUG },
    update: listingData,
    create: { ...listingData, slug: LISTING_SLUG, ownerId: user.id },
  });
  if (!(await db.listingImage.count({ where: { listingId: listing.id } }))) {
    await db.listingImage.create({ data: { listingId: listing.id, url: `${SITE}/images/ads/master-lakshman-sidebar.png` } });
  }

  for (const gig of GIGS) {
    const columns = {
      title: gig.title,
      description: gig.description,
      includes: gig.includes,
      priceMinor: gig.price * 100,
      deliveryDays: 2,
      images: [gig.image],
      tags: gig.tags,
      faq: [
        {
          q: "How does the reading happen?",
          a: "After you order, Master Lakshman Ji contacts you to fix a time for a phone or WhatsApp call, or you can visit him in Jersey City.",
        },
      ],
      status: "ACTIVE" as const,
    };
    const pkg = {
      tier: "BASIC" as const,
      name: `${gig.minutes}-minute reading`,
      description: gig.description.split(". ")[0] + ".",
      includes: gig.includes,
      priceMinor: gig.price * 100,
      deliveryDays: 2,
      revisions: 0,
    };
    const saved = await db.gig.upsert({
      where: { slug: gig.slug },
      update: columns,
      create: { ...columns, slug: gig.slug, sellerId: user.id },
    });
    await db.gigPackage.upsert({
      where: { gigId_tier: { gigId: saved.id, tier: "BASIC" } },
      update: pkg,
      create: { ...pkg, gigId: saved.id },
    });
  }

  const now = new Date();
  const newsData = {
    title: NEWS_TITLE,
    summary: newsSummary,
    imageUrl: "/images/ads/master-lakshman-sidebar.png",
    source: "GoDesi News Desk",
    status: "PUBLISHED" as const,
    topic: "faith",
    category: "Local",
    city: "Jersey City",
    state: "NJ",
    country: "USA",
    sourceType: "News",
    sourceUrl: WEBSITE,
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

  console.log({ business: LINK, listing: `/listings/${LISTING_SLUG}`, profile: `/${user.username}`, news: link });
}

main().finally(() => db.$disconnect());
