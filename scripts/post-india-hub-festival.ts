import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  let hub = await prisma.business.findUnique({ where: { slug: "india-hub-foundation-schaumburg" } });
  if (!hub) {
    hub = await prisma.business.create({
      data: {
        slug: "india-hub-foundation-schaumburg",
        name: "India Hub Foundation",
        category: "Community organization",
        city: "Schaumburg",
        state: "IL",
        description: "India Hub Foundation — unite, celebrate, help each other. Cultural and community centre at 930 National Parkway, Schaumburg IL. 1-888-886-6335 · office@indiahub.org · indiahub.org",
        websiteUrl: "https://www.indiahub.org",
        phone: "1-888-886-6335",
        publicEmail: "office@indiahub.org",
        status: "APPROVED",
      },
    });
  }

  const slug = "festival-of-lights-india-hub-schaumburg";
  const existing = await prisma.event.findUnique({ where: { slug } });
  if (existing) {
    console.log("event exists:", slug);
    return;
  }
  await prisma.event.create({
    data: {
      slug,
      title: "Festival of Lights at India Hub — Diwali Mela & Performances",
      description: [
        "India Hub Foundation celebrates Diwali with the community: shopping, culture and creativity for the whole family — free event, all are welcome.",
        "",
        "Diwali Mela 12–8 PM — shop, support small businesses, find unique gifts.",
        "Diya Making 4–6 PM — paint and take home your own diya (while supplies last).",
        "Semi-Kathak Bollywood Dance 5 PM — by Sloka Nambiar, American Natya Idol National Bronze Medalist.",
        "Theatrical Performance 5 PM — by Science of Spirituality.",
        "",
        "In collaboration with Science of Spirituality. Questions: 1-888-886-6335 or office@indiahub.org · indiahub.org",
      ].join("\n"),
      startsAt: new Date("2026-11-07T12:00:00-06:00"),
      endsAt: new Date("2026-11-07T20:00:00-06:00"),
      timeZone: "America/Chicago",
      venue: "India Hub",
      address: "930 National Parkway, Schaumburg, IL 60173",
      city: "Schaumburg",
      state: "IL",
      country: "USA",
      imageUrl: "/events/festival-of-lights-india-hub-schaumburg.jpg",
      price: 0,
      currency: "USD",
      seatsTotal: 1500,
      status: "APPROVED",
      organizerId: "cms22di8e0000yelb71ajutf0",
      businessId: hub.id,
      genres: ["festival-mela", "classical-dance", "shopping-expo"],
      eventType: "celebration",
      tags: ["diwali", "festival-of-lights", "mela", "free"],
      features: ["free-entry", "family-friendly", "free-parking"],
    },
  });
  console.log("event:", slug);
}

main().finally(() => prisma.$disconnect());
