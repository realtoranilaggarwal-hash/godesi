import { PrismaClient } from "@prisma/client";

/**
 * Anil's own sites as house 320x100 banners in the MOBILE slot (right-side
 * stack on computers, under the page on phones). No end date, so they rotate
 * after the paid bookings. Each banner opens the site's GoDesi business page,
 * which links on to the site; missing pages are created here. Re-runnable.
 *
 *   npx tsx scripts/add-anil-house-banners.ts
 */
const db = new PrismaClient();
const SITE = "https://godesi.com";
// A user owns at most one business: NJFind goes on his spare account; the other
// two stay unowned (claims need admin approval) until he picks accounts for them.
const OWNERS: Record<string, string> = { "njfind-iselin": "anil.bizwiz@gmail.com" };

type NewPage = {
  name: string;
  category: string;
  categorySlug: string;
  subcategorySlug: string;
  city: string;
  state: string;
  country: string;
  phone?: string;
  whatsappNumber?: string;
  publicEmail?: string;
  websiteUrl: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
};

const NEW_PAGES: Record<string, NewPage> = {
  "njfind-iselin": {
    name: "NJFind.com",
    category: "Real Estate Agents",
    categorySlug: "real-estate",
    subcategorySlug: "real-estate-property-dealers",
    city: "Iselin",
    state: "NJ",
    country: "USA",
    whatsappNumber: "17328778585",
    publicEmail: "RealtorAnilAggarwal@gmail.com",
    websiteUrl: "https://njfind.com/",
    description: [
      "NJFind.com is one New Jersey hub for real estate, mortgage, life insurance and Anil Aggarwal's other business platforms: find a home, compare financing and protect your family in one place.",
      "Real estate services are provided through Vylla Home, licensed real estate broker. Vylla Home office: (609) 649-3106 · https://vyllanj.com",
      "Anil Aggarwal, Broker Manager | Realtor® — (732) 877-8585 · RealtorAnilAggarwal@gmail.com",
    ].join("\n\n"),
    seoTitle: "NJFind.com — NJ Real Estate, Mortgage & Insurance Hub | Iselin, NJ",
    seoDescription:
      "NJFind.com connects New Jersey real estate, mortgage and life insurance in one place. Real estate through Vylla Home, office (609) 649-3106.",
  },
  "vylla-india": {
    name: "Vylla.in",
    category: "Real Estate Agents",
    categorySlug: "real-estate",
    subcategorySlug: "real-estate-property-dealers",
    city: "Noida",
    state: "UP",
    country: "India",
    websiteUrl: "https://vylla.in/",
    description: [
      "Vylla.in is India's verified real-estate marketplace: find RERA-registered agents, builders and new projects, list your property, and connect with trusted home-service partners.",
      "NRIs in the USA and UK can shortlist verified agents and projects in India before they fly in.",
    ].join("\n\n"),
    seoTitle: "Vylla.in — Verified Real Estate Agents, Builders & Projects in India",
    seoDescription:
      "Find RERA-registered agents, builders and new projects in India on Vylla.in, list your property and connect with trusted home-service partners.",
  },
  "intensive-care-india": {
    name: "IntensiveCareIndia.com",
    category: "Medical Tourism",
    categorySlug: "health-medical",
    subcategorySlug: "health-medical-medical-tourism",
    city: "Iselin",
    state: "NJ",
    country: "USA",
    phone: "+1-732-983-7958",
    whatsappNumber: "17329837958",
    websiteUrl: "https://intensivecareindia.com/",
    description: [
      "IntensiveCareIndia.com helps patients from the USA and UK get treatment at internationally accredited (JCI, NABH) hospitals in India, often saving 70-90% compared with US and UK private costs.",
      "A personal patient coordinator handles cost estimates, hospital and surgeon selection, visa help, flights, airport transfers and hotels — from the first report you upload to recovery.",
      "Popular treatments: heart bypass and valve replacement, hip and knee replacement, liver and kidney transplant, spine, cancer care and more.",
      "USA: +1-732-983-7958 · UK: +44-7810165046 · India: +91-8796776123",
    ].join("\n\n"),
    seoTitle: "IntensiveCareIndia.com — Medical Treatment in India for USA & UK Patients",
    seoDescription:
      "Top accredited hospitals and surgeons in India for USA and UK patients: heart surgery, joint replacement, transplants. Free cost estimate, save 70-90%.",
  },
};

const BANNERS = [
  ["njfind", "NJFind.com — Real Estate, Mortgage & Insurance hub", "njfind-iselin"],
  ["path2india", "Path2India.com — NRI concierge services in India", "path2indiacom-iselin"],
  ["vylla-in", "Vylla.in — Verified real-estate agents in India", "vylla-india"],
  ["refiyourloans", "RefiYourLoans.com — Compare mortgage & refi options", "anil-aggarwal-do-mortgage-east-brunswick"],
  ["futurefinanceplanning", "Future Finance Planning — IUL, mortgage protection & retirement", "future-finance-planning-llc-east-brunswick"],
  ["intensivecareindia", "IntensiveCareIndia.com — Top hospitals & surgeons in India", "intensive-care-india"],
] as const;

async function main() {
  for (const [image, page] of Object.entries({ njfind: "njfind-iselin", "vylla-in": "vylla-india", intensivecareindia: "intensive-care-india" })) {
    if (await db.business.findUnique({ where: { slug: page }, select: { id: true } })) continue;
    const data = NEW_PAGES[page];
    const owner = OWNERS[page]
      ? await db.user.findFirstOrThrow({ where: { email: OWNERS[page], business: null }, select: { id: true } })
      : null;
    const business = await db.business.create({
      data: {
        ...data,
        slug: page,
        ownerId: owner?.id ?? null,
        status: "APPROVED",
        logoUrl: `${SITE}/images/business/house-${image}-logo.png`,
        coverUrl: `${SITE}/images/business/house-${image}-cover.jpg`,
      },
    });
    await db.media.create({
      data: { businessId: business.id, url: `${SITE}/images/ads/house-${image}-320x100.png`, type: "IMAGE", caption: data.name },
    });
    console.log(`created /business/${page}`);
  }

  for (const [slug, title, page] of BANNERS) {
    await db.business.findUniqueOrThrow({ where: { slug: page }, select: { id: true } });
    const imageUrl = `/images/ads/house-${slug}-320x100.png`;
    const linkUrl = `${SITE}/business/${page}`;
    const data = { slot: "MOBILE" as const, imageUrl, title, linkUrl };
    const existing = await db.banner.findFirst({ where: { imageUrl }, select: { id: true } });
    if (existing) {
      await db.banner.update({ where: { id: existing.id }, data: { ...data, active: true, status: "ACTIVE" } });
      console.log(`updated ${slug} -> ${linkUrl}`);
      continue;
    }
    const last = await db.banner.aggregate({ where: { slot: "MOBILE" }, _max: { position: true } });
    await db.banner.create({ data: { ...data, position: (last._max.position ?? 0) + 1 } });
    console.log(`added ${slug} -> ${linkUrl}`);
  }
}

main().finally(() => db.$disconnect());
