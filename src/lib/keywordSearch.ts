import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { CONTENT_TTL, cachedQuery } from "@/lib/cache";
import { chatterExcerpt } from "@/lib/chatter";
import { properName } from "@/lib/names";
import { dealDetails, dealSelect, liveDealWhere } from "@/lib/deals";
import { liveStoreOfferWhere, storeOfferSelect } from "@/lib/storeOffers";

/** Filler a visitor types around the real topic ("where can I save money on…"). */
const FILLER = new Set([
  "a",
  "an",
  "and",
  "are",
  "at",
  "best",
  "can",
  "do",
  "find",
  "for",
  "from",
  "get",
  "good",
  "how",
  "i",
  "in",
  "is",
  "it",
  "looking",
  "me",
  "money",
  "my",
  "near",
  "need",
  "of",
  "on",
  "or",
  "save",
  "some",
  "the",
  "they",
  "to",
  "want",
  "what",
  "where",
  "which",
  "who",
  "with",
  "you",
]);

/** "Domain registrars, where can I save money?" → ["domain", "registrar"]. */
export function searchWords(input: string) {
  const words = input
    .toLowerCase()
    .replace(/[^0-9a-z\u00C0-\u024F\u0900-\u097F\s-]/g, " ")
    .split(/\s+/)
    .map((word) => (word.length > 4 ? word.replace(/s$/, "") : word))
    .filter((word) => word.length >= 2 && !FILLER.has(word));
  return Array.from(new Set(words)).slice(0, 5);
}

function anyWordIn(fields: string[], words: string[]) {
  return fields.flatMap((field) =>
    words.map((word) => ({
      [field]: { contains: word, mode: "insensitive" as const },
    })),
  );
}

function score(words: string[], ...texts: (string | null | undefined)[]) {
  const haystack = texts.filter(Boolean).join(" ").toLowerCase();
  return words.filter((word) => haystack.includes(word)).length;
}

function byScore<T>(
  rows: T[],
  text: (row: T) => (string | null)[],
  words: string[],
) {
  return rows
    .map((row) => ({ row, score: score(words, ...text(row)) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.row);
}

async function search(query: string) {
  const words = searchWords(query);
  if (!words.length) return null;
  const now = new Date();
  const tagTerms = Array.from(
    new Set([
      ...words,
      ...words.map((word) => `${word}s`),
      query.replace(/^#/, ""),
    ]),
  );

  const [links, deals, storeOffers, events, news, posts] = await Promise.all([
    db.resourceLink.findMany({
      where: {
        status: "APPROVED",
        active: true,
        OR: [
          { tags: { hasSome: tagTerms } },
          ...(anyWordIn(
            ["title", "description"],
            words,
          ) as Prisma.ResourceLinkWhereInput[]),
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 60,
      select: {
        id: true,
        title: true,
        description: true,
        tags: true,
        kind: true,
        category: { select: { name: true, icon: true } },
      },
    }),
    db.deal.findMany({
      where: {
        AND: [
          liveDealWhere(now),
          { business: { status: "APPROVED" } },
          {
            OR: [
              ...(anyWordIn(
                ["title", "details"],
                words,
              ) as Prisma.DealWhereInput[]),
              {
                business: {
                  OR: anyWordIn(["name"], words) as Prisma.BusinessWhereInput[],
                },
              },
            ],
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: dealSelect,
    }),
    db.storeOffer.findMany({
      where: {
        AND: [
          liveStoreOfferWhere(now),
          {
            OR: anyWordIn(
              ["title", "description", "advertiserName", "category"],
              words,
            ) as Prisma.StoreOfferWhereInput[],
          },
        ],
      },
      orderBy: { endsAt: { sort: "asc", nulls: "last" } },
      take: 12,
      select: storeOfferSelect,
    }),
    db.event.findMany({
      where: {
        status: "APPROVED",
        startsAt: { gte: now },
        OR: [
          { tags: { hasSome: tagTerms } },
          ...(anyWordIn(["title"], words) as Prisma.EventWhereInput[]),
        ],
      },
      orderBy: { startsAt: "asc" },
      take: 6,
      select: {
        id: true,
        slug: true,
        title: true,
        city: true,
        startsAt: true,
        timeZone: true,
      },
    }),
    db.newsItem.findMany({
      where: {
        status: "PUBLISHED",
        OR: anyWordIn(
          ["title", "summary"],
          words,
        ) as Prisma.NewsItemWhereInput[],
      },
      orderBy: { publishedAt: "desc" },
      take: 12,
      select: { id: true, title: true, source: true, publishedAt: true },
    }),
    db.blogPost.findMany({
      where: {
        published: true,
        OR: [
          { tags: { hasSome: tagTerms } },
          ...(anyWordIn(
            ["title", "excerpt", "body"],
            words,
          ) as Prisma.BlogPostWhereInput[]),
        ],
      },
      orderBy: { publishedAt: "desc" },
      take: 8,
      select: { slug: true, title: true, excerpt: true, publishedAt: true },
    }),
  ]);
  const chatter = await db.chatterPost.findMany({
    where: {
      hiddenAt: null,
      author: { bannedAt: null },
      OR: [
        { tags: { hasSome: tagTerms } },
        ...(anyWordIn(["body"], words) as Prisma.ChatterPostWhereInput[]),
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      body: true,
      createdAt: true,
      author: { select: { name: true } },
    },
  });

  // Dates leave as ISO strings: the cache serialises whatever it holds.
  return {
    words,
    links: byScore(
      links,
      (link) => [link.title, link.description, link.tags.join(" ")],
      words,
    ),
    deals: byScore(
      deals,
      (deal) => [deal.title, deal.details, deal.business.name],
      words,
    ).map((deal) => ({
      id: deal.id,
      title: deal.title,
      details: dealDetails(deal),
      code: deal.code,
      linkUrl: deal.linkUrl,
      expiresAt: deal.expiresAt?.toISOString() ?? null,
      business: {
        slug: deal.business.slug,
        name: deal.business.name,
        city: deal.business.city,
        logoUrl: deal.business.logoUrl,
        icon: deal.business.categoryRef?.icon,
        line:
          deal.business.subcategoryRef?.name ?? deal.business.categoryRef?.name,
      },
    })),
    storeOffers: byScore(
      storeOffers,
      (offer) => [offer.title, offer.description, offer.advertiserName],
      words,
    ).map((offer) => ({
      ...offer,
      endsAt: offer.endsAt?.toISOString() ?? null,
    })),
    events: events.map((event) => ({
      ...event,
      startsAt: event.startsAt.toISOString(),
    })),
    news: news.map((item) => ({
      ...item,
      publishedAt: item.publishedAt.toISOString(),
    })),
    posts: posts.map(({ slug, title, excerpt, publishedAt }) => ({
      slug,
      title,
      excerpt,
      publishedAt: publishedAt.toISOString(),
    })),
    chatter: chatter.map((post) => ({
      id: post.id,
      excerpt: chatterExcerpt(post.body, 140),
      author: properName(post.author.name),
      createdAt: post.createdAt.toISOString(),
    })),
  };
}

const cachedSearch = cachedQuery(
  "keyword-search",
  CONTENT_TTL,
  (query: string) => search(query),
);

/** Links, deals, store coupons, events, news and blog posts that mention a keyword. */
export async function keywordSearch(query: string) {
  const results = await cachedSearch(query.trim().toLowerCase().slice(0, 80));
  if (!results) return null;
  return {
    ...results,
    deals: results.deals.map((deal) => ({
      ...deal,
      expiresAt: deal.expiresAt ? new Date(deal.expiresAt) : null,
    })),
    storeOffers: results.storeOffers.map((offer) => ({
      ...offer,
      endsAt: offer.endsAt ? new Date(offer.endsAt) : null,
    })),
    events: results.events.map((event) => ({
      ...event,
      startsAt: new Date(event.startsAt),
    })),
  };
}

export type KeywordResults = NonNullable<
  Awaited<ReturnType<typeof keywordSearch>>
>;
