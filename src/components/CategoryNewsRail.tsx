import Link from "next/link";
import { db } from "@/lib/db";
import { freshNewsCutoff } from "@/lib/news";
import { Card } from "@/components/ui";

/**
 * Five fresh headlines under every category, plus the category's own RSS feed
 * so other sites and readers can pull Godesi listings.
 */
export async function CategoryNewsRail({
  categorySlug,
  categoryName,
  topic = "general",
}: {
  categorySlug: string;
  categoryName: string;
  topic?: string;
}) {
  const items = await db.newsItem.findMany({
    where: {
      status: "PUBLISHED",
      topic,
      publishedAt: { gte: freshNewsCutoff() },
    },
    orderBy: { publishedAt: "desc" },
    take: 5,
  });

  const feed = `/categories/${categorySlug}/rss.xml`;

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">Latest desi news 📰</h2>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <Link href="/news" className="text-indigo-600 hover:underline">
            All news →
          </Link>
          <a
            href={feed}
            className="rounded-lg bg-orange-500 px-2.5 py-1 text-white hover:bg-orange-600"
          >
            📡 RSS feed
          </a>
        </div>
      </div>

      {items.length ? (
        <ul className="divide-y divide-slate-100 text-sm">
          {items.map((item) => (
            <li key={item.id} className="py-2">
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-slate-800 hover:text-indigo-700"
              >
                {item.title}
              </a>
              <p className="text-xs text-slate-500">
                {item.source} · {item.publishedAt.toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-600">
          No headlines in the last few days — the crawler runs daily.
        </p>
      )}

      <p className="text-xs text-slate-500">
        Syndicate this category: the RSS feed above lists the newest{" "}
        {categoryName.toLowerCase()} listings on Godesi and links back to each
        card.
      </p>
    </Card>
  );
}
