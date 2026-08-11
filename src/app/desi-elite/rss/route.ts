import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";
import { cachedFeed } from "@/lib/rss";

export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  return cachedFeed("desi-elite", build);
}

async function build() {
  const base = siteUrl();
  const entries = await db.eliteEntry.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  const items = entries
    .map(
      (entry) => `    <item>
      <title>${escapeXml(
        entry.businessName
          ? `${entry.fullName} — ${entry.businessName}`
          : entry.fullName,
      )}</title>
      <link>${base}/desi-elite/${entry.slug}</link>
      <guid>${base}/desi-elite/${entry.slug}</guid>
      <pubDate>${(entry.publishedAt ?? entry.createdAt).toUTCString()}</pubDate>
      <category>${escapeXml(entry.category)}</category>
      <description>${escapeXml(entry.shortBio.slice(0, 400))}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>GoDesi Elite — Godesi</title>
    <link>${base}/desi-elite</link>
    <description>Recognised desi entrepreneurs, professionals and community leaders.</description>
${items}
  </channel>
</rss>`;

  return xml;
}
