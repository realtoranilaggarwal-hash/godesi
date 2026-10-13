import type { Metadata } from "next";
import Link from "next/link";
import { cleanTag, hashtagWall, hitAgo } from "@/lib/hashtag";
import { siteUrl } from "@/lib/format";
import { SidebarBanners } from "@/components/Banners";
import { Card, EmptyState, inputClass } from "@/components/ui";

export const dynamic = "force-dynamic";

const SUGGESTIONS = [
  "#IndiaDayParade",
  "#Diwali",
  "#H1B",
  "#Bollywood",
  "#Cricket",
  "#Edison NJ",
  "#DesiFood",
  "#Garba",
];

export function generateMetadata({
  searchParams,
}: {
  searchParams: { tag?: string };
}): Metadata {
  const tag = cleanTag(searchParams.tag ?? "");
  return {
    title: tag
      ? `${tag} — live news and posts | Godesi`
      : "Trending hashtags — live desi news and posts | Godesi",
    description:
      "Type any hashtag or keyword and see live headlines and public posts about it, from Google News and Mastodon.",
    alternates: { canonical: `${siteUrl()}/trending` },
    robots: tag ? { index: false, follow: true } : undefined,
  };
}

export default async function TrendingPage({
  searchParams,
}: {
  searchParams: { tag?: string };
}) {
  const tag = cleanTag(searchParams.tag ?? "");
  const hits = tag ? await hashtagWall(tag) : [];

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-4">
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-800 to-fuchsia-700 px-5 py-7 text-white sm:px-8">
          <h1 className="text-2xl font-black sm:text-3xl">
            Trending hashtags #️⃣
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-white/90">
            Type a hashtag or keyword — live headlines and public posts about it
            appear below.
          </p>
          <form action="/trending" className="mt-4 flex flex-wrap gap-2">
            <input
              name="tag"
              defaultValue={tag}
              placeholder="#IndiaDayParade, #H1B, Edison NJ…"
              aria-label="Hashtag or keyword"
              className={`${inputClass} max-w-sm flex-1 text-slate-900`}
            />
            <button className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900">
              Show me
            </button>
          </form>
          <p className="mt-3 text-xs font-semibold text-white/90">
            Or see every topic at once on the{" "}
            <Link href="/wall" className="underline">
              news wall
            </Link>
            .
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            {SUGGESTIONS.map((suggestion) => (
              <Link
                key={suggestion}
                href={`/trending?tag=${encodeURIComponent(suggestion)}`}
                className="rounded-full bg-white/20 px-3 py-1 hover:bg-white/30"
              >
                {suggestion}
              </Link>
            ))}
          </div>
        </section>

        {tag && !hits.length ? (
          <EmptyState
            title={`Nothing published about ${tag} right now`}
            body="Try a broader word — a city, a festival or a topic."
          />
        ) : null}

        {hits.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hits.map((hit) => (
              <a
                key={hit.link}
                href={hit.link}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-3 hover:border-indigo-300 hover:shadow-sm"
              >
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  {hit.source === "news" ? "📰 News" : "💬 Post"}
                  <span className="font-semibold normal-case text-slate-400">
                    {hitAgo(hit.publishedAt)}
                  </span>
                </span>
                <span className="line-clamp-4 text-sm font-semibold text-slate-900">
                  {hit.title}
                </span>
                <span className="line-clamp-1 text-xs text-slate-500">
                  {hit.author}
                </span>
              </a>
            ))}
          </div>
        ) : null}

        {tag ? null : (
          <Card>
            <p className="text-sm text-slate-600">
              Headlines come from Google News and posts from Mastodon&apos;s
              public timeline — both free and open. X (Twitter) charges for
              search access, so tweets can&apos;t be shown here.
            </p>
          </Card>
        )}
      </div>

      <SidebarBanners />
    </div>
  );
}
