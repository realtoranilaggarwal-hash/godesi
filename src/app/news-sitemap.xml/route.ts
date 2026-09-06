import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";
import { newsPath } from "@/lib/newsLinks";
import { cachedQuery } from "@/lib/cache";

export const dynamic = "force-dynamic";

/** Google News only reads articles from the last two days. */
const WINDOW_HOURS = 48;
/**
 * An empty <urlset> is a Search Console error, so on a quiet week the file
 * falls back to the latest reports; Google ignores the ones older than two days.
 */
const FALLBACK_DAYS = 30;
const FALLBACK_COUNT = 20;

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
  const original = { status: "PUBLISHED" as const, submittedById: { not: null } };
  const select = { id: true, title: true, publishedAt: true };
  let rows = await db.newsItem.findMany({
    where: { ...original, publishedAt: { gte: since } },
    orderBy: { publishedAt: "desc" },
    take: 1000,
    select,
  });
  if (!rows.length) {
    const fallbackSince = new Date(
      Date.now() - FALLBACK_DAYS * 24 * 60 * 60 * 1000,
    );
    rows = await db.newsItem.findMany({
      where: { ...original, publishedAt: { gte: fallbackSince } },
      orderBy: { publishedAt: "desc" },
      take: FALLBACK_COUNT,
      select,
    });
  }

  const base = siteUrl();
  // A <urlset> with no <url> is a Search Console error; point at the news
  // page itself until there is original reporting to list.
  if (!rows.length) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>${escapeXml(`${base}/news`)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
</urlset>`;
  }
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
