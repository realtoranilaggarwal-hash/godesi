import type { Metadata } from "next";
import Link from "next/link";
import { getCategoryTree } from "@/lib/directory";
import { NEWS_TOPICS } from "@/lib/newsTopics";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "RSS feeds — syndicate Godesi news, events and listings",
  description:
    "Every Godesi RSS feed in one place: all-site updates, community news by topic and city, events, property, rooms, buy & sell, the blog, GoDesi Elite and each directory category.",
  alternates: {
    canonical: "/feeds",
    types: { "application/rss+xml": "/feed.xml" },
  },
};

const MAIN: { href: string; label: string; note: string }[] = [
  {
    href: "/feed.xml",
    label: "Everything on Godesi",
    note: "News, events, new business cards, property, rooms and buy & sell in one feed.",
  },
  {
    href: "/news/rss.xml",
    label: "Community news",
    note: "Add ?topic=business or ?city=Edison to narrow it.",
  },
  {
    href: "/events/rss.xml",
    label: "Upcoming events",
    note: "Add ?city=Iselin for one city.",
  },
  {
    href: "/real-estate/rss.xml",
    label: "Property for sale and rent",
    note: "Add ?city=Noida or ?max=5000000.",
  },
  { href: "/rooms/rss.xml", label: "Rooms and roommates", note: "Add ?city=Jersey City." },
  {
    href: "/marketplace/rss.xml",
    label: "Buy & sell items",
    note: "Add ?category=buy-sell-jewellery-and-gold for one category.",
  },
  { href: "/blog/rss.xml", label: "Godesi blog", note: "Guides and what's new." },
  {
    href: "/desi-elite/rss",
    label: "GoDesi Elite",
    note: "Recognised community leaders as they are published.",
  },
];

function FeedRow({
  href,
  label,
  note,
}: {
  href: string;
  label: string;
  note?: string;
}) {
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-2 py-2">
      <div className="min-w-0">
        <a
          href={href}
          className="font-semibold text-indigo-700 hover:underline"
        >
          📡 {label}
        </a>
        {note ? <p className="text-xs text-slate-500">{note}</p> : null}
      </div>
      <code className="text-xs text-slate-500">godesi.com{href}</code>
    </li>
  );
}

export default async function FeedsPage() {
  const tree = await getCategoryTree();

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold">RSS feeds 📡</h1>
        <p className="text-slate-600">
          Read Godesi in any feed reader, or republish it on your own site. Every
          feed is RSS 2.0, refreshed every 10 minutes and open to everyone — the
          main one is{" "}
          <a className="font-semibold text-indigo-700" href="/feed.xml">
            godesi.com/feed.xml
          </a>
          .
        </p>
      </header>

      <Card>
        <h2 className="mb-1 text-lg font-bold">Main feeds</h2>
        <ul className="divide-y divide-slate-100">
          {MAIN.map((feed) => (
            <FeedRow key={feed.href} {...feed} />
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-bold">News by topic</h2>
        <div className="flex flex-wrap gap-2">
          {NEWS_TOPICS.map((topic) => (
            <a
              key={topic.slug}
              href={`/news/rss.xml?topic=${topic.slug}`}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-indigo-300"
            >
              {topic.emoji} {topic.label}
            </a>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-bold">Every directory category</h2>
        <p className="mb-3 text-sm text-slate-600">
          Each category feed carries that category&apos;s newest businesses,
          member listings and upcoming events.
        </p>
        <ul className="divide-y divide-slate-100">
          {tree.map((category) => (
            <FeedRow
              key={category.slug}
              href={`/categories/${category.slug}/rss.xml`}
              label={category.name}
            />
          ))}
        </ul>
        <p className="mt-3 text-sm text-slate-600">
          Subcategories work the same way —{" "}
          <Link className="font-semibold text-indigo-700" href="/categories">
            open any category
          </Link>{" "}
          and add <code>/rss.xml</code> to its address.
        </p>
      </Card>
    </main>
  );
}
