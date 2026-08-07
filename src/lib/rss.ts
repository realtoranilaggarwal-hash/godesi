import { siteUrl } from "@/lib/format";

export type RssItem = {
  title: string;
  link: string;
  description: string;
  publishedAt: Date;
  imageUrl?: string | null;
  category?: string | null;
};

export function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Teaser length: enough to sell the item, short enough not to replace it. */
export function teaser(text: string, length = 400) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length - 1)}…` : clean;
}

function itemXml(item: RssItem) {
  const url = item.link.startsWith("http") ? item.link : `${siteUrl()}${item.link}`;
  return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(teaser(item.description))}</description>
      <pubDate>${item.publishedAt.toUTCString()}</pubDate>${
        item.category ? `\n      <category>${escapeXml(item.category)}</category>` : ""
      }${
        item.imageUrl
          ? `\n      <enclosure url="${escapeXml(item.imageUrl)}" type="image/jpeg" />`
          : ""
      }
    </item>`;
}

/** One RSS 2.0 document builder, so every Godesi feed looks the same. */
export function rssResponse({
  title,
  description,
  path,
  items,
}: {
  title: string;
  description: string;
  /** Page the feed describes, e.g. `/news`; the feed itself is `${path}/rss.xml`. */
  path: string;
  items: RssItem[];
}) {
  const base = siteUrl();
  const self = path.endsWith(".xml") ? `${base}${path}` : `${base}${path}/rss.xml`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${base}${path.endsWith(".xml") ? "" : path}</link>
    <atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(description)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.map(itemXml).join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=600, s-maxage=600, stale-while-revalidate=3600",
      "access-control-allow-origin": "*",
    },
  });
}
