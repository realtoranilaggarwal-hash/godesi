/**
 * Seeds GoDesi Natural Healing & Wellness: the ten launch articles, the free
 * ebook and the Amazon wellness shelf. Re-runnable — articles and the ebook
 * are refreshed from scripts/natural-healing/articles.ts; existing products
 * keep whatever was set in /admin/wellness.
 *
 * Every product links to Amazon with AMAZON_ASSOCIATE_TAG. Without the tag the
 * products are saved with affiliateUrl null and stay hidden (no free promotion).
 *
 *   AMAZON_ASSOCIATE_TAG=godesi03-20 DATABASE_URL=... npx tsx scripts/seed-natural-healing.ts
 *   npx tsx scripts/natural-healing/build-ebook.ts   # rebuilds the PDF
 */
import { PrismaClient } from "@prisma/client";
import { ARTICLES, EBOOK, PRODUCTS, RETIRED_PRODUCT_SLUGS } from "./natural-healing/articles";

const db = new PrismaClient();

const DISCLOSURE =
  "GoDesi may earn a commission when you purchase through certain links. This does not increase your purchase price.";

function amazonSearch(query: string, tag?: string) {
  const url = new URL("https://www.amazon.com/s");
  url.searchParams.set("k", query);
  if (tag) url.searchParams.set("tag", tag);
  return url.toString();
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

  const tag = process.env.AMAZON_ASSOCIATE_TAG?.trim();
  if (!tag) console.warn("AMAZON_ASSOCIATE_TAG is not set: products are saved hidden (no affiliate link).");
  const retired = await db.wellnessProduct.deleteMany({
    where: { slug: { in: RETIRED_PRODUCT_SLUGS }, clicks: 0 },
  });
  let live = 0;
  for (const product of PRODUCTS) {
    const affiliateUrl = tag ? amazonSearch(product.amazonQuery, tag) : null;
    const existing = await db.wellnessProduct.findUnique({
      where: { slug: product.slug },
      select: { affiliateUrl: true },
    });
    if (existing?.affiliateUrl || affiliateUrl) live += 1;
    const data = {
      name: product.name,
      merchantName: "Amazon",
      category: product.category,
      description: product.description,
      articleSlugs: product.articleSlugs,
      regularUrl: amazonSearch(product.amazonQuery),
      disclosureText: DISCLOSURE,
    };
    if (existing) {
      if (!existing.affiliateUrl && affiliateUrl)
        await db.wellnessProduct.update({ where: { slug: product.slug }, data: { affiliateUrl } });
    } else {
      await db.wellnessProduct.create({ data: { slug: product.slug, ...data, affiliateUrl, active: true } });
    }
  }
  console.log(`Retired placeholder products removed: ${retired.count}`);
  console.log(`Products: ${PRODUCTS.length} (${live} with an Amazon affiliate link)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
