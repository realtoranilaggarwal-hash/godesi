import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { canonicalEmail } from "../src/lib/signupGuard";
import { ensureUsername } from "../src/lib/profiles";

/**
 * SocialDada.com, GoDesi's media and support team, as a featured business
 * profile at /business/socialdada (facts from socialdada.com), plus the $499
 * website banner in the sidebar rotation linking to it. The banner replaces
 * the old "$99 website" house creative, so no paid banner loses a turn.
 * Re-runnable.
 *
 *   npx tsx scripts/add-socialdada-profile.ts
 */
const db = new PrismaClient();

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://godesi.com").replace(
  /\/$/,
  "",
);
const SLUG = "socialdada";
const EMAIL = "care@socialdada.com";
const PHONE = "+17329837958";
const UNTIL = new Date("2027-11-23T05:00:00Z"); // end of Nov 22, 2027 ET
const OLD_BANNER = "/images/ads/website-99.png";
const BANNER = {
  imageUrl: "/images/ads/website-499.png",
  title: "Your website for just $499 (was $999) — built by SocialDada.com",
  linkUrl: `/business/${SLUG}`,
};

const description = [
  "SocialDada.com is the media and support team behind GoDesi.com. Its teams in the USA (Iselin, NJ) and India (Noida) design and build websites, run SEO and online marketing, set up AI chat bots and automation, and look after domains and hosting for desi businesses.",
  "",
  "GoDesi website offer: a custom website for $499 (regular price $999) with a custom design, About us, Services and up to 10 pages, an AI chat bot, a Google Photos gallery and a YouTube video gallery. Hosting is $200 a year.",
  "• Use code GODESI for a free 1-year featured ad on GoDesi.",
  "• Refer 2 friends and your first year of hosting is free.",
  "Start at godesi.com/website or call (732) 983-7958.",
  "",
  "Services: web design, web development, SEO, e-commerce, digital marketing, mobile apps, AI & automation (chat bots, WhatsApp, CRM), cybersecurity, social media, domains & hosting.",
  "",
  "Websites built by SocialDada:",
  "• NJFind.com — real estate, mortgage, insurance and ventures hub",
  "• Path2India.com — NRI services in India: medical tourism, parent care, property, relocation, legal and travel",
  "• FutureFinancePlanning.com — independent New Jersey agency for retirement income, mortgage protection and first homes",
  "",
  "Offices: 1 Austin Ave, Suite C, Iselin, NJ 08830, USA · R 12, Sector 12, Noida, UP 201301, India. USA (732) 983-7958 · India +91 87967 76123 · care@socialdada.com",
].join("\n");

const PACKAGES = [
  {
    name: "Custom website",
    price: 499,
    description: "Limited-time price — regularly $999.",
    includes:
      "Custom design\nAbout us, Services and up to 10 pages\nAI chat bot\nGoogle Photos and YouTube galleries\nCode GODESI: free 1-year GoDesi featured ad",
  },
  {
    name: "Hosting, per year",
    price: 200,
    description: "Refer 2 friends and the first year is free.",
    includes: null,
  },
  {
    name: "Online menu & ordering",
    price: 1000,
    description:
      "One time. Customers order online; linked to your Stripe, Square or PayPal.",
    includes: null,
  },
  {
    name: "Daily articles, per year",
    price: 500,
    description:
      "365 articles with a picture and hashtags, emailed to you every day for SEO.",
    includes: null,
  },
];

const BUILT = [
  ["njfind", "NJFind.com — built by SocialDada"],
  ["path2india", "Path2India.com — built by SocialDada"],
  ["futurefinanceplanning", "FutureFinancePlanning.com — built by SocialDada"],
] as const;

async function owner() {
  const existing = await db.user.findFirst({
    where: {
      OR: [{ email: EMAIL }, { emailCanonical: canonicalEmail(EMAIL) }],
    },
  });
  // Contact details on a card show while the owner's plan is paid.
  const plan = { plan: "PREMIUM" as const, planExpiresAt: UNTIL };
  if (existing) {
    // Signups get a session before verifying their email, so only a verified
    // (or staff) account may take over the official card.
    if (!existing.emailVerifiedAt && existing.role !== "ADMIN") {
      throw new Error(
        `${EMAIL} is registered but not verified (${existing.id}); verify it first`,
      );
    }
    return db.user.update({ where: { id: existing.id }, data: plan });
  }
  const user = await db.user.create({
    data: {
      name: "SocialDada.com",
      email: EMAIL,
      emailCanonical: canonicalEmail(EMAIL),
      role: "BUSINESS",
      passwordHash: await bcrypt.hash(randomBytes(32).toString("hex"), 10),
      offerPhone: PHONE,
      ...plan,
    },
  });
  await ensureUsername(user.id);
  return user;
}

async function main() {
  const user = await owner();
  const data = {
    name: "SocialDada.com",
    profileType: "BUSINESS" as const,
    category: "Web & App Development",
    categorySlug: "business-services",
    subcategorySlug: "business-services-web-and-app-development",
    extraCategorySlugs: [
      "business-services-digital-marketing",
      "business-services-graphic-design-and-branding",
    ],
    city: "Iselin",
    state: "NJ",
    country: "USA",
    address: "1 Austin Ave, Suite C, Iselin, NJ 08830",
    description,
    seoTitle:
      "SocialDada.com — websites from $499 for desi businesses | GoDesi",
    seoDescription:
      "GoDesi's media and support team: custom websites from $499 (regularly $999), SEO, AI chat bots and hosting. Built NJFind.com, Path2India.com and FutureFinancePlanning.com.",
    logoUrl: `${SITE}/images/business/socialdada-logo.png`,
    coverUrl: `${SITE}/images/business/socialdada-cover.jpg`,
    websiteUrl: "https://socialdada.com",
    phone: PHONE,
    whatsappNumber: PHONE,
    publicEmail: EMAIL,
    startingPrice: 499,
    priceCurrency: "USD",
    priceFrom: "$499",
    referralOffer:
      "Code GODESI — free 1-year featured ad on GoDesi with your website",
    specialties: [
      "Website design",
      "Shopify / e-commerce",
      "Custom web apps",
      "Mobile apps (iOS / Android)",
      "React / Next.js",
      "AI & chatbot integration",
      "Website maintenance",
      "Hosting & migration",
      "Payment gateway integration",
      "UI / UX design",
      "Landing pages",
    ],
    featuredSpecialty: "Website design",
    serviceOptions: [
      "Remote / online",
      "At our office",
      "Small businesses",
      "Startups",
    ],
    yearsExperience: 10,
    status: "APPROVED" as const,
    featured: true,
    featuredRank: 2,
    featuredUntil: UNTIL,
    ownerId: user.id,
  };

  const bySlug = await db.business.findUnique({ where: { slug: SLUG } });
  if (bySlug?.ownerId && bySlug.ownerId !== user.id) {
    throw new Error(`${SLUG} is owned by another account (${bySlug.ownerId})`);
  }
  // An account owns at most one card.
  const mine = await db.business.findUnique({ where: { ownerId: user.id } });
  if (bySlug && mine && bySlug.id !== mine.id) {
    throw new Error(`${EMAIL} already owns /business/${mine.slug}`);
  }
  const existing = bySlug ?? mine;
  const card = existing
    ? await db.business.update({
        where: { id: existing.id },
        data: { slug: SLUG, ...data },
      })
    : await db.business.create({ data: { slug: SLUG, ...data } });

  // Packages and gallery are seeded once; later edits from the dashboard stay.
  if (!(await db.vendorPackage.count({ where: { businessId: card.id } })))
    await db.vendorPackage.createMany({
      data: PACKAGES.map((item, sortOrder) => ({
        ...item,
        businessId: card.id,
        currency: "USD",
        sortOrder,
      })),
    });
  if (!(await db.media.count({ where: { businessId: card.id } })))
    await db.media.createMany({
      data: BUILT.map(([file, caption], sortOrder) => ({
        businessId: card.id,
        url: `${SITE}/images/business/socialdada-built-${file}.jpg`,
        caption,
        sortOrder,
      })),
    });
  console.log(`card: ${SITE}/business/${card.slug}`);

  const banners = await db.banner.findMany({
    where: { slot: "SIDEBAR", imageUrl: { in: [OLD_BANNER, BANNER.imageUrl] } },
    select: { id: true, slot: true },
  });
  for (const banner of banners) {
    await db.banner.update({
      where: { id: banner.id },
      data: { ...BANNER, active: true, status: "ACTIVE", endsAt: null },
    });
    console.log(`banner ${banner.slot} -> ${BANNER.linkUrl}`);
  }
  if (!banners.length) {
    const last = await db.banner.aggregate({
      where: { slot: "SIDEBAR" },
      _max: { position: true },
    });
    await db.banner.create({
      data: {
        ...BANNER,
        slot: "SIDEBAR",
        position: (last._max.position ?? 0) + 1,
      },
    });
    console.log("banner SIDEBAR added");
  }
}

main().finally(() => db.$disconnect());
