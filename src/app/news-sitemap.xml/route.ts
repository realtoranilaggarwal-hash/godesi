import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";
import { newsPath } from "@/lib/newsLinks";
import { cachedQuery } from "@/lib/cache";

export const dynamic = "force-dynamic";

/** Google News only reads articles from the last two days. */
const WINDOW_HOURS = 48;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Google News wants its own sitemap, and it must only list original reporting:
 * the syndicated feed items are somebody else's article and are noindex.
 */
const recentReports = cachedQuery("news-sitemap", 900, async () => {
  const since = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000);
  const rows = await db.newsItem.findMany({
    where: {
      status: "PUBLISHED",
      submittedById: { not: null },
      publishedAt: { gte: since },
    },
    orderBy: { publishedAt: "desc" },
    take: 1000,
    select: { id: true, title: true, publishedAt: true },
  });

  const base = siteUrl();
  const urls = rows
    .map(
      (row) => `  <url>
    <loc>${escapeXml(`${base}${newsPath(row)}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>Godesi</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${row.publishedAt.toISOString()}</news:publication_date>
      <news:title>${escapeXml(row.title)}</news:title>
    </news:news>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;
});

export async function GET() {
  const xml = await recentReports();
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=900",
    },
  });
}
