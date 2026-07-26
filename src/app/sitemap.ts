import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const businesses = await db.business.findMany({
    where: { status: "APPROVED" },
    select: { slug: true, updatedAt: true },
  });

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/leads`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.5 },
    ...businesses.map((business) => ({
      url: `${base}/b/${business.slug}`,
      lastModified: business.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
