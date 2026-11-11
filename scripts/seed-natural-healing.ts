/**
 * Seeds GoDesi Natural Healing & Wellness: the ten launch articles, the free
 * ebook and placeholder wellness products. Re-runnable — articles and the
 * ebook are refreshed from scripts/natural-healing/articles.ts; existing
 * products keep the affiliate link and active flag set in /admin/wellness.
 *
 * Products stay hidden (affiliateUrl null) until an approved tracking link is
 * entered in the admin, or passed when seeding as WELLNESS_AFFILIATE_<SLUG>,
 * e.g. WELLNESS_AFFILIATE_HOUSE_OF_AYURVEDA_COPPER_WATER_BOTTLE=https://…
 *
 *   DATABASE_URL=... npx tsx scripts/seed-natural-healing.ts
 *   npx tsx scripts/natural-healing/build-ebook.ts   # rebuilds the PDF
 */
import { PrismaClient } from "@prisma/client";
import { ARTICLES, EBOOK, PRODUCTS } from "./natural-healing/articles";

const db = new PrismaClient();

function envAffiliate(slug: string) {
  const value = process.env[`WELLNESS_AFFILIATE_${slug.toUpperCase().replace(/-/g, "_")}`]?.trim();
  return value && /^https:\/\//.test(value) ? value : undefined;
}

async function main() {
  const launch = new Date("2027-01-01T05:00:00Z");
  const publishedAt = launch < new Date() ? launch : new Date();

  for (let index = 0; index < ARTICLES.length; index += 1) {
    const article = ARTICLES[index];
    const data = {
      title: article.title,
      metaDescription: article.metaDescription,
      coverImage: `/wellness/${article.slug}.svg`,
      body: article.body,
      sources: article.sources,
      disclaimer: article.disclaimer,
      productCategories: article.productCategories,
      featured: Boolean(article.featured),
      sortOrder: index,
      active: true,
    };
    await db.wellnessArticle.upsert({
      where: { slug: article.slug },
      create: { slug: article.slug, publishedAt, ...data },
      update: data,
    });
  }
  console.log(`Articles: ${ARTICLES.length}`);

  await db.wellnessEbook.upsert({
    where: { slug: EBOOK.slug },
    create: { ...EBOOK, active: true },
    update: { title: EBOOK.title, description: EBOOK.description, coverUrl: EBOOK.coverUrl },
  });
  console.log("eBook: 1");

  let live = 0;
  for (const product of PRODUCTS) {
    const affiliateUrl = envAffiliate(product.slug);
    if (affiliateUrl) live += 1;
    await db.wellnessProduct.upsert({
      where: { slug: product.slug },
      create: { ...product, regularUrl: product.regularUrl ?? null, affiliateUrl: affiliateUrl ?? null, active: true },
      update: affiliateUrl ? { affiliateUrl } : {},
    });
  }
  console.log(`Products: ${PRODUCTS.length} (${live} given affiliate links from env)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
