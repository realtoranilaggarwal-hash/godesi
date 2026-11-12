import { PrismaClient } from "@prisma/client";

/**
 * Adds an unclaimed, approved starter card for Master Bedina (astrologer from
 * a newspaper flyer) under Religious & Cultural › Astrologers, so he shows in
 * the /astrology astrologer list and can claim the card later. No banner or
 * ad order is created. Re-runnable: an existing card with the slug is kept.
 *
 *   npx tsx scripts/add-master-bedina.ts
 */

const prisma = new PrismaClient();

const SLUG = "master-bedina-astrologer";
const CATEGORY = "religious-services";
const SUBCATEGORY = "religious-services-astrologers";

const description = [
  "Master Bedina is an astrologer, psychic and spiritualist who describes astrology as a gift passed down in his family from generation to generation.",
  "",
  "Readings offered: palm reading, face reading, photo reading, horoscope reading and numerology.",
  "",
  "People consult him for guidance on job and career, education, business, finances, marriage and relationships, children and family, and health.",
  "",
  "He also offers spiritual remedies and protection consultations.",
  "",
  "Call (646) 382-7477 or email sanhatiusa@gmail.com to book a reading.",
].join("\n");

async function main() {
  const existing = await prisma.business.findUnique({ where: { slug: SLUG } });
  if (existing) {
    console.log(`Already exists: ${existing.id} (${existing.status})`);
    return;
  }

  const card = await prisma.business.create({
    data: {
      slug: SLUG,
      name: "Master Bedina — Famous Astrologer, Psychic & Spiritualist",
      profileType: "PROFESSIONAL",
      category: CATEGORY,
      categorySlug: CATEGORY,
      subcategorySlug: SUBCATEGORY,
      city: "New York",
      state: "NY",
      country: "USA",
      description,
      phone: "(646) 382-7477",
      publicEmail: "sanhatiusa@gmail.com",
      specialties: [
        "Palmistry",
        "Face reading",
        "Numerology",
        "Horoscope / kundli reading",
        "Career & job reading",
        "Education & exam guidance",
        "Business & partnership reading",
        "Money & finance prediction",
        "Marriage matching / compatibility",
        "Love & relationship reading",
        "Health prediction",
        "Spiritual healing & meditation guidance",
      ],
      status: "APPROVED",
      ownerId: null,
    },
  });
  console.log(`Created ${card.id} -> /business/${card.slug}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
