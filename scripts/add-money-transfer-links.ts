import { PrismaClient } from "@prisma/client";

/**
 * Pins USA → India money transfer services to the USD → INR page's
 * "Send money to India" box. Re-runnable: links already in the list are left alone.
 *
 *   DATABASE_URL=... npx tsx scripts/add-money-transfer-links.ts
 */
const db = new PrismaClient();

const SERVICES = [
  {
    title: "Remitly",
    url: "https://www.remitly.com/r/3vpaa1ii",
    description:
      "Send to bank accounts in India from the app. New customers can get a first-transfer offer through our invite link.",
    kind: "AFFILIATE" as const,
  },
  {
    title: "Wise",
    url: "https://wise.com/invite/mic/anila1190",
    description:
      "Uses the mid-market exchange rate and shows its fee upfront. Join through our invite link.",
    kind: "AFFILIATE" as const,
  },
  {
    title: "Western Union",
    url: "https://ssqt.co/mQZulBL",
    description:
      "A familiar name for sending to India, online or at agent locations. Sign up through our invite link.",
    kind: "AFFILIATE" as const,
  },
  {
    title: "MoneyGram",
    url: "https://www.moneygram.com/us/en/corridor/india",
    description: "Another long-standing option for sending money to India.",
    kind: "EDITORIAL" as const,
  },
  {
    title: "Ria Money Transfer",
    url: "https://www.riamoneytransfer.com/en-us/",
    description: "Compare Ria's rate for USA to India transfers.",
    kind: "EDITORIAL" as const,
  },
];

async function main() {
  for (const service of SERVICES) {
    const existing = await db.resourceLink.findFirst({
      where: { url: service.url },
      select: { id: true },
    });
    if (existing) {
      console.log(`exists ${service.url}`);
      continue;
    }
    await db.resourceLink.create({
      data: {
        ...service,
        tags: ["money transfer", "send money to india"],
        placement: "money-transfer",
        status: "APPROVED",
        active: true,
      },
    });
    console.log(`added ${service.title}`);
  }
}

main().finally(() => db.$disconnect());
