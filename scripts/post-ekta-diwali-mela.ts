import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function card(slug: string, name: string, category: string, city: string, state: string, description: string, extra: Record<string, string> = {}) {
  const found = await prisma.business.findUnique({ where: { slug } });
  if (found) return found.id;
  return (await prisma.business.create({ data: { slug, name, category, city, state, description, status: "APPROVED", ...extra } })).id;
}

async function main() {
  const iafId = await card(
    "indo-american-foundation-of-arizona-phoenix",
    "Indo American Foundation of Arizona",
    "Community organization",
    "Phoenix", "AZ",
    "Indo American Foundation of Arizona — community festivals and cultural events in the Phoenix area, including the Grand Diwali Mela.",
  );
  const ektaId = await card(
    "bharatiya-ekta-mandir-phoenix",
    "Bharatiya Ekta Mandir",
    "Hindu temple & community center",
    "Phoenix", "AZ",
    "Hindu temple and community center at 2804 W Maryland Ave, Phoenix AZ — festivals, cultural programs and community gatherings.",
  );

  const slug = "grand-diwali-mela-2026-phoenix";
  if (await prisma.event.findUnique({ where: { slug } })) {
    console.log("event exists:", slug);
    return;
  }
  await prisma.event.create({
    data: {
      slug,
      title: "Grand Diwali Mela 2026 — Indo American Foundation of Arizona",
      description: [
        "Indo American Foundation of Arizona presents the Grand Diwali Mela 2026 — three evenings of food, attractions, kids activities and a cultural program & talent showcase, also marking the America 250th anniversary celebration.",
        "",
        "Every year 3,000–5,000 visitors attend.",
        "",
        "Business / commercial booths: 1 day $250 · all 3 days $500 (save $250). Non-profit organizations get a free table to share their mission. Booth setup from 3 PM; events start 6 PM onwards each day.",
        "",
        "Register for a booth: https://bit.ly/EktaDiwali2026 — limited spaces, first come first served. No duplicate menus — secure your menu early.",
        "",
        "Questions — Manish 602-688-7011 · Prasad 602-427-8863 · Subbu 602-420-2223 · Preeti Sanga 248-595-3987. Sponsors and donors welcome.",
      ].join("\n"),
      startsAt: new Date("2026-11-06T18:00:00-07:00"),
      endsAt: new Date("2026-11-08T22:00:00-07:00"),
      timeZone: "America/Phoenix",
      venue: "Bharatiya Ekta Mandir",
      address: "2804 W Maryland Ave, Phoenix, AZ 85017",
      city: "Phoenix",
      state: "AZ",
      country: "USA",
      imageUrl: "/events/grand-diwali-mela-2026-phoenix.jpg",
      price: 0,
      currency: "USD",
      seatsTotal: 5000,
      status: "APPROVED",
      organizerId: "cms22di8e0000yelb71ajutf0",
      businessId: iafId,
      genres: ["festival-mela", "food-fest", "cultural-program"],
      eventType: "celebration",
      tags: ["diwali", "mela", "phoenix", "free"],
      features: ["free-entry", "family-friendly", "food", "kids-activities"],
      websiteUrl: "https://bit.ly/EktaDiwali2026",
    },
  });
  console.log("event:", slug, "| iaf:", iafId, "| ekta:", ektaId);
}

main().finally(() => prisma.$disconnect());
