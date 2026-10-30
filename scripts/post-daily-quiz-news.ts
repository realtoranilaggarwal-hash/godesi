import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function main() {
  const existing = await prisma.newsItem.findFirst({
    where: { sourceUrl: "https://401kexposed.com" },
    select: { link: true },
  });
  if (existing) {
    console.log("already posted:", existing.link);
    return;
  }

  const summary = [
    "GoDesi members now have a daily market game: every morning, call gold, the S&P 500 and Bitcoin — higher or lower at today's close?",
    "",
    "Each correct call earns 10 points, a wrong call costs 5, and a fresh round opens every day. Points are real GoDesi rewards — they go toward promotion, featured listings and ads.",
    "",
    "The idea was inspired by our friends at 401kExposed.com — the site that teaches Americans what their 401(k) statement doesn't tell them: 100 years of market crashes, hidden fees and timing risk. They run their own quiz of the day over there — play it for fun badges, then come back here and play for points.",
    "",
    "On GoDesi",
    "Play today's prediction game: https://godesi.com",
    "Quiz of the day at 401kExposed: https://401kexposed.com/#daily-quiz",
    "See your points & rewards: https://godesi.com/rewards",
    "All news: https://godesi.com/news",
  ].join("\n");

  const item = await prisma.newsItem.create({
    data: {
      guid: `report:${crypto.randomUUID()}`,
      title:
        "Call it daily: gold, S&P 500 and Bitcoin — GoDesi's new prediction game pays points for right calls",
      summary,
      imageUrl: "/news/daily-markets-quiz-401k.jpg",
      link: "pending",
      source: "GoDesi newsroom",
      topic: "community",
      category: "Community",
      sourceType: "News",
      sourceUrl: "https://401kexposed.com",
      photoUrls: ["/news/daily-markets-quiz-401k.jpg"],
      status: "PUBLISHED",
      publishedAt: new Date(),
      happenedAt: new Date(),
      country: "USA",
    },
  });
  const link = `/news/${slugify(item.title)}-${item.id}`;
  await prisma.newsItem.update({ where: { id: item.id }, data: { link } });
  console.log("news:", link);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
