import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const slug = "advanced-tax-strategies-saturday-zoom";
  if (await prisma.event.findUnique({ where: { slug } })) {
    console.log("event exists:", slug);
    return;
  }
  await prisma.event.create({
    data: {
      slug,
      title: "Advanced Tax Strategies for High-Income — Saturday Webinar",
      description: [
        "High income doesn't mean you have to pay high taxes.",
        "",
        "Join us for an insightful session covering legal strategies to reduce what you owe, tailored for high-income W-2 earners, business owners, and investors with significant stock market gains or interest in Roth conversions.",
        "",
        "Educational webinar organized by Future Finance Planning partners. Attend with your CPA — or invite them.",
        "",
        "Two Saturdays — pick one: Oct 31 or Nov 7, 2026 · 5:00 PM ET on Zoom.",
        "",
        "Register free: https://tinyurl.com/ts-saturday",
        "",
        "Referral invite by Anil Aggarwal.",
      ].join("\n"),
      startsAt: new Date("2026-10-31T17:00:00-04:00"),
      endsAt: new Date("2026-11-07T19:00:00-05:00"),
      timeZone: "America/New_York",
      venue: "Online — Zoom webinar",
      city: "Online",
      imageUrl: "/events/tax-strategies-saturday-webinar.png",
      price: 0,
      currency: "USD",
      seatsTotal: 500,
      status: "APPROVED",
      organizerId: "cms6n20v70003traagjtv9hq6",
      businessId: "cmsvla4ww00015t3lpvconaky",
      genres: ["seminar-webinar", "money-tax"],
      eventType: "Seminar / Webinar",
      mode: "ONLINE",
      frequency: "RECURRING",
      tags: ["tax", "webinar", "high-income", "w2", "roth-conversion"],
      websiteUrl: "https://tinyurl.com/ts-saturday",
    },
  });
  console.log("event:", slug);
}

main().finally(() => prisma.$disconnect());
