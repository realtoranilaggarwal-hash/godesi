/**
 * NJ gurdwaras: service timings, phone and website from each gurdwara's own site
 * (checked Nov 2026), plus the NJ gurdwaras OpenStreetMap missed.
 * Run once: npx tsx scripts/nj-gurdwara-timings.ts
 */
import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/slug";

const db = new PrismaClient();

type Info = {
  address: string;
  phone: string | null;
  websiteUrl: string;
  serviceTimes: string | null;
};

const UPDATES: Record<string, Info> = {
  "glen-rock-gurudwara-glen-rock-nj": {
    address: "541 Prospect St",
    phone: "(201) 251-4300",
    websiteUrl: "https://www.glenrockgurudwara.org/",
    serviceTimes: null,
  },
  "sikh-gurdwara-of-pine-hill-pine-hill-nj": {
    address: "1110 Blackwood-Clementon Rd",
    phone: "(856) 464-9835",
    websiteUrl: "https://www.gnssdv.com/prayer-services/",
    serviceTimes: [
      "Sunday diwan: 9:30 AM – 2 PM (Sukhmani Sahib, Asa Di Vaar, Katha, Kirtan, Langar 1:30 PM)",
      "Friday: Rehras Sahib 7 PM, Kirtan 7:30 – 9 PM, Langar 9 PM",
      "Wednesday: Sukhmani Sahib by ladies 3:30 – 5 PM",
    ].join("\n"),
  },
  "nanak-naam-jahaj-gurudwara-jersey-city": {
    address: "1080 West Side Ave",
    phone: "(201) 479-8197",
    websiteUrl: "https://www.nnjgurudwara.org/",
    serviceTimes: [
      "Sunday: Asa Di Var 7:30 AM, Kirtan 11 AM, Katha 12 PM, Langar 1 PM",
      "Evenings (not Friday): Rehras Sahib 6:30 PM, Kirtan, Katha, Langar 8 – 9 PM",
      "Friday: Sukhmani Sahib 5 PM, Rehras Sahib 6:30 PM, Kirtan, Katha, Langar 9 PM",
      "Open daily 5 AM – 9 PM, Prakash 5 AM",
    ].join("\n"),
  },
  "garden-state-sikh-association-gurudwara-bridgewater-nj": {
    address: "977 Washington Valley Rd",
    phone: "(908) 658-9805",
    websiteUrl: "https://sites.google.com/view/gssabw/home",
    serviceTimes: null,
  },
};

const NEW_PLACES: (Info & { name: string; city: string })[] = [
  {
    name: "Gurdwara Singh Sabha Carteret",
    city: "Port Reading",
    address: "941 Port Reading Ave",
    phone: "(732) 541-4411",
    websiteUrl: "https://thesinghsabha.org/",
    serviceTimes: [
      "Sunday diwan: 10 AM – 2:30 PM, with Langar",
      "Evenings daily: Rehras Sahib 6:15 PM, Kirtan 6:45 PM, Katha 7:15 PM",
      "Morning: Prakash 5 AM, Nitnem 5 – 6:30 AM",
      "Khalsa School: Sunday 10:30 AM – 1 PM",
    ].join("\n"),
  },
  {
    name: "Gurdwara Dashmesh Darbar",
    city: "Port Reading",
    address: "800 Port Reading Ave",
    phone: "(732) 541-6000",
    websiteUrl: "https://gddnj.org/",
    serviceTimes: [
      "Sunday diwan: 10 AM – 2:45 PM, Kirtan, Katha and Langar",
      "Evening diwan: Mon–Thu 6:30 – 8:45 PM, Fri–Sat 6:30 – 9:15 PM, Sun 6:30 – 7:45 PM",
      "Morning diwan: Mon–Sat 6 – 7:45 AM, Prakash 4:30 AM",
    ].join("\n"),
  },
  {
    name: "Central Jersey Sikh Association (CJSA)",
    city: "Windsor",
    address: "116 N Main St",
    phone: null,
    websiteUrl: "https://cjsa.us/?page_id=58",
    serviceTimes: [
      "Sunday diwan: Sukhmani Sahib 8:30 AM, Asa Di Var 10:15 AM, Katha 11:45 AM, Ardas 1 PM, Langar 1:15 – 2 PM",
      "Evening diwan: 6:30 – 7:30 PM in winter, 7 – 8 PM in summer (not Friday or Sunday)",
      "Morning Nitnem: 4:30 – 6 AM daily",
    ].join("\n"),
  },
  {
    name: "Sikh Sabha of New Jersey",
    city: "Lawrence Township",
    address: "282 Bakers Basin Rd",
    phone: "(609) 587-3131",
    websiteUrl: "https://www.sikhsabhanj.org/programs",
    serviceTimes: [
      "Sunday diwan: 9:30 AM – 1:50 PM, Langar follows",
      "Friday diwan: 5 – 8:45 PM",
      "Mon–Wed evening diwan: 6:30 – 8 PM",
      "Every morning: Prakash 6 AM, Nitnem 6:15 – 7:30 AM",
    ].join("\n"),
  },
  {
    name: "Guru Nanak Mission Gurudwara",
    city: "Oakland",
    address: "138 Bauer Dr",
    phone: "(201) 338-0676",
    websiteUrl: "http://www.gurunanakmissionnj.com/",
    serviceTimes: [
      "Kirtan diwan on Fridays and Sundays",
      "Sunday Naam Simran: 10 – 11 AM",
      "Open daily from 4 AM (till 10 PM on Fridays, 8 PM other days)",
    ].join("\n"),
  },
];

async function main() {
  for (const [slug, info] of Object.entries(UPDATES)) {
    const { count } = await db.worshipPlace.updateMany({ where: { slug }, data: info });
    console.log(count ? "updated" : "MISSING", slug);
  }
  for (const place of NEW_PLACES) {
    const slug = slugify(`${place.name} ${place.city} NJ`);
    await db.worshipPlace.upsert({
      where: { slug },
      update: place,
      create: {
        ...place,
        slug,
        faith: "GURUDWARA",
        state: "NJ",
        country: "USA",
        source: "web",
        status: "APPROVED",
        description: `Gurdwara Sahib in ${place.city}, NJ.`,
      },
    });
    console.log("saved", slug);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
