import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [businesses, categories, events] = await Promise.all([
    db.business.findMany({
      where: { status: "APPROVED" },
      select: { slug: true, updatedAt: true },
    }),
    db.category.findMany({ where: { parentSlug: null }, select: { slug: true } }),
    db.event.findMany({
      where: { status: "APPROVED" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/leads`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/events`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/news`, changeFrequency: "hourly", priority: 0.7 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/advertise`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/sitemap`, changeFrequency: "daily", priority: 0.4 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/cookies`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/refunds`, changeFrequency: "yearly", priority: 0.2 },
    ...categories.map((category) => ({
      url: `${base}/categories/${category.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...businesses.map((business) => ({
      url: `${base}/b/${business.slug}`,
      lastModified: business.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...events.map((event) => ({
      url: `${base}/events/${event.slug}`,
      lastModified: event.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
