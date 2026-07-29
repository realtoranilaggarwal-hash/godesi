import { db } from "@/lib/db";
import { getCategory, categoryScopeSlugs } from "@/lib/directory";
import { siteUrl } from "@/lib/format";

export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Per-category RSS of the newest listings, for syndication on other sites. */
export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const category = await getCategory(params.slug);
  if (!category) return new Response("Not found", { status: 404 });

  const base = siteUrl();
  const scope = categoryScopeSlugs(category);
  const businesses = await db.business.findMany({
    where: {
      status: "APPROVED",
      OR: [
        { categorySlug: { in: scope } },
        { subcategorySlug: { in: scope } },
        { extraCategorySlugs: { hasSome: scope } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      slug: true,
      name: true,
      description: true,
      city: true,
      state: true,
      createdAt: true,
    },
  });

  const items = businesses
    .map((business) => {
      const link = `${base}/b/${business.slug}`;
      const place = [business.city, business.state].filter(Boolean).join(", ");
      const description = [place, business.description ?? ""]
        .filter(Boolean)
        .join(" — ")
        .slice(0, 400);
      return `    <item>
      <title>${escapeXml(business.name)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${business.createdAt.toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${category.name} on Godesi`)}</title>
    <link>${base}/categories/${category.slug}</link>
    <atom:link href="${base}/categories/${category.slug}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(
      category.blurb ?? `Newest ${category.name} listings on Godesi.`,
    )}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}
