import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";
import { newsPath } from "@/lib/newsLinks";
import { budgetCurrencyOf } from "@/lib/budget";

export const dynamic = "force-dynamic";

const KINDS = ["news", "events", "businesses", "leads"] as const;
type Kind = (typeof KINDS)[number];

function isKind(value: string | null): value is Kind {
  return KINDS.includes((value ?? "") as Kind);
}

/** Teaser length: enough to sell the story, short enough not to replace it. */
function teaser(text: string, length = 220) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length - 1)}…` : clean;
}

/**
 * Public read-only feed powering Godesi's own niche sites (desinewspaper.com,
 * diwali.cc, indianbusinessassociation.com). Teasers plus canonical links back
 * to godesi.com — never the full record, so the satellites stay complementary.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const kind: Kind = isKind(params.get("kind"))
    ? (params.get("kind") as Kind)
    : "news";
  const limit = Math.min(Number(params.get("limit") ?? 24) || 24, 60);
  const city = params.get("city")?.trim() || undefined;
  const topic = params.get("topic")?.trim() || undefined;
  const category = params.get("category")?.trim() || undefined;
  const subcategory = params.get("subcategory")?.trim() || undefined;
  const eventType = params.get("type")?.trim() || undefined;
  const query = params.get("q")?.trim() || undefined;
  const base = siteUrl();

  const headers = {
    "access-control-allow-origin": "*",
    "cache-control": "public, s-maxage=600, stale-while-revalidate=3600",
  };

  if (kind === "news") {
    const items = await db.newsItem.findMany({
      where: {
        status: "PUBLISHED",
        ...(topic ? { topic } : {}),
        ...(city ? { city: { equals: city, mode: "insensitive" } } : {}),
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" as const } },
                { summary: { contains: query, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take: limit,
      select: {
        id: true,
        title: true,
        summary: true,
        imageUrl: true,
        topic: true,
        city: true,
        state: true,
        country: true,
        source: true,
        publishedAt: true,
        submittedById: true,
      },
    });

    return NextResponse.json(
      {
        kind,
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          teaser: teaser(item.summary),
          imageUrl: item.imageUrl,
          topic: item.topic,
          city: item.city,
          state: item.state,
          country: item.country,
          source: item.submittedById ? "Godesi member" : item.source,
          publishedAt: item.publishedAt,
          url: `${base}${newsPath(item)}`,
        })),
      },
      { headers },
    );
  }

  if (kind === "events") {
    const items = await db.event.findMany({
      where: {
        status: "APPROVED",
        startsAt: { gte: new Date() },
        ...(city ? { city: { equals: city, mode: "insensitive" } } : {}),
        ...(eventType ? { eventType: { in: eventType.split(",") } } : {}),
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" as const } },
                {
                  description: {
                    contains: query,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: { startsAt: "asc" },
      take: limit,
      select: {
        slug: true,
        title: true,
        description: true,
        imageUrl: true,
        startsAt: true,
        endsAt: true,
        venue: true,
        city: true,
        state: true,
        country: true,
        eventType: true,
        categorySlug: true,
      },
    });

    return NextResponse.json(
      {
        kind,
        items: items.map((item) => ({
          slug: item.slug,
          title: item.title,
          teaser: teaser(item.description),
          imageUrl: item.imageUrl,
          startsAt: item.startsAt,
          endsAt: item.endsAt,
          venue: item.venue,
          city: item.city,
          state: item.state,
          country: item.country,
          eventType: item.eventType,
          categorySlug: item.categorySlug,
          url: `${base}/events/${item.slug}`,
        })),
      },
      { headers },
    );
  }

  if (kind === "leads") {
    // Requirements are teasers only: the client's name, phone and email stay on
    // Godesi, where a paid member unlocks them.
    const items = await db.lead.findMany({
      where: {
        status: "OPEN",
        ...(city ? { city: { equals: city, mode: "insensitive" } } : {}),
        AND: [
          // Older requirements carry only the display category, so match either.
          ...(category
            ? [
                {
                  OR: [
                    // Requirements store the subcategory slug ("jobs-drivers"),
                    // so a parent slug matches by prefix.
                    ...category.split(",").map((slug) => ({
                      categorySlug: { startsWith: slug },
                    })),
                    {
                      category: {
                        in: category.split(","),
                        mode: "insensitive" as const,
                      },
                    },
                  ],
                },
              ]
            : []),
          ...(query
            ? [
                {
                  OR: [
                    {
                      title: { contains: query, mode: "insensitive" as const },
                    },
                    {
                      description: {
                        contains: query,
                        mode: "insensitive" as const,
                      },
                    },
                  ],
                },
              ]
            : []),
        ],
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        categorySlug: true,
        city: true,
        budgetMin: true,
        budgetMax: true,
        budgetCurrency: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        kind,
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          teaser: teaser(item.description),
          category: item.category,
          categorySlug: item.categorySlug,
          city: item.city,
          budgetMin: item.budgetMin,
          budgetMax: item.budgetMax,
          budgetCurrency: budgetCurrencyOf(item.budgetCurrency),
          postedAt: item.createdAt,
          url: `${base}/leads/${item.id}`,
        })),
      },
      { headers },
    );
  }

  const items = await db.business.findMany({
    where: {
      status: "APPROVED",
      ...(city ? { city: { equals: city, mode: "insensitive" } } : {}),
      ...(category ? { categorySlug: { in: category.split(",") } } : {}),
      ...(subcategory
        ? { subcategorySlug: { in: subcategory.split(",") } }
        : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" as const } },
              {
                description: { contains: query, mode: "insensitive" as const },
              },
            ],
          }
        : {}),
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: {
      slug: true,
      name: true,
      description: true,
      logoUrl: true,
      city: true,
      state: true,
      country: true,
      categorySlug: true,
      subcategorySlug: true,
      ownerId: true,
      featured: true,
    },
  });

  return NextResponse.json(
    {
      kind,
      items: items.map((item) => ({
        slug: item.slug,
        name: item.name,
        teaser: teaser(item.description ?? "", 160),
        logoUrl: item.logoUrl,
        city: item.city,
        state: item.state,
        country: item.country,
        categorySlug: item.categorySlug,
        subcategory: item.subcategorySlug,
        claimed: Boolean(item.ownerId),
        featured: item.featured,
        url: `${base}/b/${item.slug}`,
      })),
    },
    { headers },
  );
}
