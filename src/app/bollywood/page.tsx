import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { cachedQuery } from "@/lib/cache";
import { optionalRead } from "@/lib/resilient";
import { freshNewsCutoff } from "@/lib/news";
import { newsPath } from "@/lib/newsLinks";
import { proxyImage } from "@/lib/proxyImage";
import { InContentBanner } from "@/components/Banners";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Bollywood news today: latest films, stars & desi entertainment",
  description:
    "Latest Bollywood news, film releases, box office, OTT and celebrity updates, refreshed every day from trusted Indian entertainment sources for the desi community in the USA.",
  alternates: { canonical: "/bollywood" },
};

/** One cached read every 10 minutes serves every visitor and crawler. */
const bollywoodStories = cachedQuery("bollywood-news", 600, async () =>
  db.newsItem.findMany({
    where: {
      status: "PUBLISHED",
      topic: "entertainment",
      publishedAt: { gte: freshNewsCutoff() },
    },
    orderBy: { publishedAt: "desc" },
    take: 60,
    select: {
      id: true,
      title: true,
      summary: true,
      imageUrl: true,
      source: true,
      publishedAt: true,
    },
  }),
);

function ago(date: Date) {
  const hours = Math.max(
    1,
    Math.round((Date.now() - new Date(date).getTime()) / 3_600_000),
  );
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

export default async function BollywoodPage() {
  const rows = await optionalRead(() => bollywoodStories(), []);
  // Picture stories first so the grid looks like a magazine, newest within each.
  const stories = [
    ...rows.filter((row) => row.imageUrl),
    ...rows.filter((row) => !row.imageUrl),
  ].slice(0, 48);
  const [lead, ...rest] = stories;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-fuchsia-600">
          🎬 GoDesi Entertainment
        </p>
        <h1 className="text-3xl font-black text-slate-900">
          Bollywood news today
        </h1>
        <p className="max-w-3xl text-slate-600">
          The latest Bollywood and desi entertainment headlines: films, box
          office, OTT releases, music and stars. Updated automatically every day
          from India&apos;s entertainment newsrooms.
        </p>
        <div className="flex flex-wrap gap-2 text-sm font-semibold">
          <Link
            href="/news"
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-700 hover:bg-slate-50"
          >
            📰 All desi news
          </Link>
          <Link
            href="/events"
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-700 hover:bg-slate-50"
          >
            🎟️ Desi events near you
          </Link>
          <Link
            href="/dj"
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-700 hover:bg-slate-50"
          >
            🎧 Desi DJs
          </Link>
        </div>
      </header>

      {!lead ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
          New stories arrive every morning. Check back soon.
        </p>
      ) : (
        <>
          <Link
            href={newsPath(lead)}
            className="group grid overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid-cols-2"
          >
            {lead.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={proxyImage(lead.imageUrl)}
                alt=""
                className="h-64 w-full object-cover md:h-full"
              />
            ) : null}
            <div className="space-y-2 p-5">
              <p className="text-xs font-semibold text-fuchsia-700">
                {lead.source} · {ago(lead.publishedAt)}
              </p>
              <h2 className="text-2xl font-black leading-tight text-slate-900 group-hover:text-fuchsia-700">
                {lead.title}
              </h2>
              <p className="line-clamp-4 text-slate-600">{lead.summary}</p>
            </div>
          </Link>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((story, index) => (
              <li
                key={story.id}
                className={
                  index === 8 ? "sm:col-span-2 lg:col-span-3" : undefined
                }
              >
                {index === 8 ? <InContentBanner /> : null}
                <Link
                  href={newsPath(story)}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-fuchsia-300"
                >
                  {story.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={proxyImage(story.imageUrl)}
                      alt=""
                      loading="lazy"
                      className="h-44 w-full object-cover"
                    />
                  ) : null}
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <p className="text-xs font-semibold text-fuchsia-700">
                      {story.source} · {ago(story.publishedAt)}
                    </p>
                    <h3 className="font-bold leading-snug text-slate-900 group-hover:text-fuchsia-700">
                      {story.title}
                    </h3>
                    {story.imageUrl ? null : (
                      <p className="line-clamp-3 text-sm text-slate-600">
                        {story.summary}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="text-xs text-slate-500">
        Headlines and short summaries link to the full story on each
        publisher&apos;s site.
      </p>
    </div>
  );
}
