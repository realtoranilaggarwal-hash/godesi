import { db } from "@/lib/db";
import { cachedQuery, CONTENT_TTL } from "@/lib/cache";

export const WELLNESS_PATH = "/natural-healing";
export const WELLNESS_EBOOK_PATH = "/natural-healing/ebook";

export const HEALTH_DISCLAIMER =
  "This content is for educational purposes only and is not medical advice. It is not intended to diagnose, treat, cure or prevent any disease. Always consult a qualified healthcare professional before starting any new health practice, remedy or supplement — especially if you are pregnant, nursing, taking medication or managing a medical condition.";

export const AMAZON_DISCLOSURE =
  "As an Amazon Associate, GoDesi earns from qualifying purchases.";

export const DEFAULT_DISCLOSURE =
  "GoDesi may earn a commission when you purchase through certain links. This does not increase your purchase price.";

/** Product shelves the articles pick from; reusable across articles. */
export const WELLNESS_CATEGORIES = [
  { slug: "copper-drinkware", label: "Copper drinkware", emoji: "🏺" },
  { slug: "traditional-ingredients", label: "Traditional ingredients", emoji: "🫚" },
  { slug: "herbal-teas", label: "Herbal teas", emoji: "🍵" },
  { slug: "yoga-meditation", label: "Yoga & meditation", emoji: "🧘" },
  { slug: "natural-kitchen", label: "Natural kitchen", emoji: "🫙" },
  { slug: "home-wellness", label: "Home wellness", emoji: "🛋️" },
] as const;

export function categoryLabel(slug: string) {
  return WELLNESS_CATEGORIES.find((c) => c.slug === slug) ?? { slug, label: slug, emoji: "🌿" };
}

/** No free promotion: a product is public only with an approved tracking link. */
export const liveProductWhere = {
  active: true,
  affiliateUrl: { not: null },
  NOT: { affiliateUrl: "" },
} as const;

export function isAmazonUrl(url: string) {
  try {
    return /(^|\.)amazon\.[a-z.]+$|(^|\.)amzn\.to$/.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** Adds the GoDesi Associates tag to an amazon.* link that has none. */
export function withAmazonTag(url: string, tag = process.env.AMAZON_ASSOCIATE_TAG?.trim()) {
  if (!tag || !isAmazonUrl(url)) return url;
  const parsed = new URL(url);
  if (parsed.hostname.endsWith("amzn.to") || parsed.searchParams.get("tag")) return url;
  parsed.searchParams.set("tag", tag);
  return parsed.toString();
}

/** Amazon short links carry their tag inside; full links need ?tag=. */
export function hasAmazonTag(url: string) {
  if (!isAmazonUrl(url)) return false;
  const parsed = new URL(url);
  return parsed.hostname.endsWith("amzn.to") || Boolean(parsed.searchParams.get("tag"));
}

export function productClickPath(id: string) {
  return `/api/wellness/products/${id}/click`;
}

const PRODUCT_SELECT = {
  id: true,
  name: true,
  imageUrl: true,
  merchantName: true,
  description: true,
  category: true,
  disclosureText: true,
  articleSlugs: true,
  affiliateUrl: true,
} as const;

export type PublicProduct = {
  id: string;
  name: string;
  imageUrl: string | null;
  merchantName: string;
  description: string | null;
  category: string;
  disclosureText: string;
  /** Amazon link, so the block adds the Associates disclosure. The URL itself never leaves the server. */
  amazon: boolean;
};

/**
 * Live products: all of them (categories null), or for an article the ones
 * tagged with its slug — falling back to its categories when none are tagged.
 */
export const wellnessProducts = cachedQuery(
  "wellness-products",
  CONTENT_TTL,
  async (categories: string[] | null, articleSlug?: string): Promise<PublicProduct[]> => {
    const rows = await db.wellnessProduct.findMany({
      where: {
        ...liveProductWhere,
        ...(categories
          ? {
              OR: [
                ...(articleSlug ? [{ articleSlugs: { has: articleSlug } }] : []),
                { category: { in: categories } },
              ],
            }
          : {}),
      },
      orderBy: [{ clicks: "desc" }, { createdAt: "asc" }],
      take: categories ? 30 : 12,
      select: PRODUCT_SELECT,
    });
    const tagged = articleSlug ? rows.filter((row) => row.articleSlugs.includes(articleSlug)) : [];
    return (tagged.length ? tagged : rows).slice(0, categories ? 6 : 12).map(
      (row) => ({
        id: row.id,
        name: row.name,
        imageUrl: row.imageUrl,
        merchantName: row.merchantName,
        description: row.description,
        category: row.category,
        disclosureText: row.disclosureText,
        amazon: isAmazonUrl(row.affiliateUrl ?? ""),
      }),
    );
  },
);

export type ArticleCard = {
  slug: string;
  title: string;
  metaDescription: string;
  coverImage: string | null;
  featured: boolean;
  /** ISO string — cached rows come back stringified. */
  publishedAt: string;
};

export const wellnessArticles = cachedQuery(
  "wellness-articles",
  CONTENT_TTL,
  async (): Promise<ArticleCard[]> =>
    (
      await db.wellnessArticle.findMany({
        where: { active: true, publishedAt: { lte: new Date() } },
        orderBy: [{ sortOrder: "asc" }, { publishedAt: "asc" }],
        select: {
          slug: true,
          title: true,
          metaDescription: true,
          coverImage: true,
          featured: true,
          publishedAt: true,
        },
      })
    ).map((row) => ({ ...row, publishedAt: row.publishedAt.toISOString() })),
);

export const wellnessArticle = cachedQuery(
  "wellness-article",
  CONTENT_TTL,
  async (slug: string) => {
    const row = await db.wellnessArticle.findFirst({
      where: { slug, active: true, publishedAt: { lte: new Date() } },
    });
    return row
      ? {
          ...row,
          publishedAt: row.publishedAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
          createdAt: row.createdAt.toISOString(),
        }
      : null;
  },
);

export const activeEbook = cachedQuery("wellness-ebook", CONTENT_TTL, async () =>
  db.wellnessEbook.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true, description: true, coverUrl: true },
  }),
);

export function headingId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export type WellnessBlock =
  | { type: "heading"; level: 2 | 3; text: string; id: string }
  | { type: "list"; items: string[] }
  | { type: "text"; text: string };

/** Blank lines split blocks; "## " / "### " headings, "- " bullets, the rest paragraphs. */
export function wellnessBlocks(body: string): WellnessBlock[] {
  const blocks: WellnessBlock[] = [];
  for (const raw of body.split(/\n{2,}/)) {
    const lines = raw.trim().split("\n").map((line) => line.trim()).filter(Boolean);
    if (!lines.length) continue;
    let rest = lines;
    const heading = lines[0].match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length === 2 ? 2 : 3,
        text: heading[2],
        id: headingId(heading[2]),
      });
      rest = lines.slice(1);
    }
    if (!rest.length) continue;
    if (rest.every((line) => line.startsWith("- "))) {
      blocks.push({ type: "list", items: rest.map((line) => line.slice(2)) });
    } else {
      blocks.push({ type: "text", text: rest.join("\n") });
    }
  }
  return blocks;
}

export function tableOfContents(blocks: WellnessBlock[]) {
  return blocks.flatMap((block) =>
    block.type === "heading" && block.level === 2 ? [{ id: block.id, text: block.text }] : [],
  );
}

/** "Title | https://…" per line; a bare URL is its own title. */
export function parseSources(sources: string) {
  return sources
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, url] = line.includes("|")
        ? line.split("|").map((part) => part.trim())
        : [line, line];
      return { title, url };
    })
    .filter((source) => /^https?:\/\//.test(source.url));
}
