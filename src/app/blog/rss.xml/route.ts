import { db } from "@/lib/db";
import { blogSummary } from "@/lib/blog";
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
  return cachedFeed("blog", build);
}

async function build() {
  const base = siteUrl();
  const posts = await db.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });

  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${base}/blog/${post.slug}</link>
      <guid>${base}/blog/${post.slug}</guid>
      <pubDate>${post.publishedAt.toUTCString()}</pubDate>
      <description>${escapeXml(blogSummary(post))}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Godesi blog</title>
    <link>${base}/blog</link>
    <description>Updates, guides and what's new on Godesi.</description>
${items}
  </channel>
</rss>`;

  return xml;
}
