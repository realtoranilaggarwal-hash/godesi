/**
 * Thanksgiving 2026: publishes the GoDesi.com News article the header turkey
 * and the specials banner link to (see src/lib/thanksgiving.ts). Re-runnable:
 * updates the article in place.
 *
 *   DATABASE_URL=... npx tsx scripts/post-thanksgiving-2026.ts
 */
import { PrismaClient } from "@prisma/client";
import { newsPath } from "../src/lib/newsLinks";
import { THANKSGIVING } from "../src/lib/thanksgiving";

const db = new PrismaClient();
const AUTHOR_ID = "cms24edsq0000t9gk48f24h5h";
const track = (target: string) =>
  `https://godesi.com/thanksgiving/go/${target}?from=article`;

const SUMMARY = `GoDesi.com wishes everyone a very Happy Thanksgiving!

Thanksgiving is a time to appreciate family, friends, customers, business partners and the communities that support us throughout the year.

At GoDesi.com, we believe that every relationship creates an opportunity. Whether you are a small business owner, entrepreneur, professional or consumer, your community can be one of your greatest assets.

Thanksgiving is also about giving back!

This Thanksgiving, GoDesi.com is celebrating with special limited-time offers for our community.

🦃 Thanksgiving Special Deals

1. New Year’s Eve Party – Turkey Discount!

Planning to celebrate New Year’s Eve with friends and family?

Use promo code ${THANKSGIVING.nyeCode} to receive 10% OFF eligible New Year’s Eve Party tickets.

Celebrate, dance, enjoy great food and entertainment, and welcome 2027 with the GoDesi community!

Visit: ${track("nye")}

2. GoDesi Business Marketing Package – Thanksgiving Special

Businesses deserve visibility, and marketing should be accessible.

For Thanksgiving, GoDesi is introducing a special annual marketing package for just $${THANKSGIVING.marketingUsd}.

The proposed package includes:

- AI-powered promotional video content.
- Search engine optimization (SEO) marketing.
- Featured business marketing opportunities.
- Online exposure through GoDesi.com.
- One year of promotional opportunities under the special package.

Ask about it: ${track("marketing")}

3. AI Website Special – Just $${THANKSGIVING.websiteUsd}

Need a website for your business? Take advantage of our special discounted AI website offer for just $${THANKSGIVING.websiteUsd}, subject to the published package terms.

Visit: ${track("website")}

Support Local. Promote Desi Businesses. Build Relationships.

Our mission is simple: connect people, businesses, events and opportunities through technology and human networking.

This Thanksgiving, we thank every business owner, advertiser, visitor, event organizer and community member who supports GoDesi.

Happy Thanksgiving from the GoDesi family!

Visit https://godesi.com and discover today’s Thanksgiving deals.

Limited-time Thanksgiving promotions. Offers, eligibility, package inclusions and availability are subject to their published terms.

#Thanksgiving2026 #HappyThanksgiving #SupportLocal #DesiBusiness #NewYearsEve #GoDesi`;

async function main() {
  const data = {
    title: THANKSGIVING.articleTitle,
    summary: SUMMARY,
    source: "GoDesi.com News",
    topic: "community",
    category: "Community",
    city: "New Jersey",
    state: "NJ",
    country: "USA",
    happenedAt: new Date("2026-11-26T12:00:00-05:00"),
    publishedAt: new Date("2026-11-26T16:30:00-05:00"),
    sourceType: "Self",
    imageUrl: "/images/thanksgiving-2026.jpg",
    photoUrls: [] as string[],
    featured: true,
    status: "PUBLISHED" as const,
    submittedById: AUTHOR_ID,
  };
  const story = await db.newsItem.upsert({
    where: { guid: THANKSGIVING.articleGuid },
    create: { guid: THANKSGIVING.articleGuid, ...data, link: "", declaredAt: new Date() },
    update: data,
  });
  await db.newsItem.update({
    where: { id: story.id },
    data: { link: newsPath(story) },
  });
  console.log(`https://godesi.com${newsPath(story)}`);
}

main().finally(() => db.$disconnect());
