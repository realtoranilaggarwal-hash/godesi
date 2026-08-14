import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";
import { cachedQuery } from "@/lib/cache";
import { newsPath } from "@/lib/newsLinks";
import { popularCities } from "@/lib/cities";

export const dynamic = "force-dynamic";

/** Crawlers refetch the sitemap constantly, and it reads every published row. */
const SITEMAP_TTL = 3600;

/** Dates are stringified by the cache, so the rows carry ISO timestamps. */
const sitemapRows = cachedQuery("sitemap-rows", SITEMAP_TTL, async () => {
  const [businesses, categories, events, reports] = await Promise.all([
    db.business.findMany({
      where: { status: "APPROVED" },
      select: { slug: true, updatedAt: true },
    }),
    db.category.findMany({
      where: { parentSlug: null },
      select: { slug: true },
    }),
    db.event.findMany({
      where: { status: "APPROVED" },
      select: { slug: true, updatedAt: true },
    }),
    // Feed items are somebody else's article; only our own reporting belongs
    // in the sitemap.
    db.newsItem.findMany({
      where: { status: "PUBLISHED", submittedById: { not: null } },
      select: { id: true, title: true, publishedAt: true },
    }),
  ]);
  return {
    businesses: businesses.map((row) => ({
      slug: row.slug,
      updatedAt: row.updatedAt.toISOString(),
    })),
    categories: categories.map((row) => row.slug),
    events: events.map((row) => ({
      slug: row.slug,
      updatedAt: row.updatedAt.toISOString(),
    })),
    reports: reports.map((row) => ({
      path: newsPath(row),
      publishedAt: row.publishedAt.toISOString(),
    })),
  };
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [{ businesses, categories, events, reports }, cities] =
    await Promise.all([sitemapRows(), popularCities(200)]);

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/leads`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/wedding`, changeFrequency: "daily", priority: 0.9 },
    {
      url: `${base}/wedding/requirements`,
      changeFrequency: "hourly",
      priority: 0.7,
    },
    { url: `${base}/real-estate`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/rooms`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/marketplace`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/religious`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/events`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/venues`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/news`, changeFrequency: "hourly", priority: 0.7 },
    { url: `${base}/city`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/trending`, changeFrequency: "daily", priority: 0.5 },
    { url: `${base}/wall`, changeFrequency: "hourly", priority: 0.6 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/desi-elite`, changeFrequency: "daily", priority: 0.8 },
    {
      url: `${base}/desi-elite/apply`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/desi-elite/awards`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    { url: `${base}/live-radio`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/live/submit`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/leaderboard`, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/live-tv`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/connect`, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/alumni`, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/resources`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/advertise`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/why-list`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/website`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/badge`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/safety`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/find`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/rewards`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/report`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/sitemap`, changeFrequency: "daily", priority: 0.4 },
    { url: `${base}/feeds`, changeFrequency: "weekly", priority: 0.4 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/cookies`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/refunds`, changeFrequency: "yearly", priority: 0.2 },
    ...categories.map((slug) => ({
      url: `${base}/categories/${slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...businesses.map((business) => ({
      url: `${base}/b/${business.slug}`,
      lastModified: new Date(business.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...events.map((event) => ({
      url: `${base}/events/${event.slug}`,
      lastModified: new Date(event.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...cities.map((city) => ({
      url: `${base}/city/${city.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...reports.map((report) => ({
      url: `${base}${report.path}`,
      lastModified: new Date(report.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
