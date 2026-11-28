import Link from "next/link";
import { cleanTag, hashtagWall } from "@/lib/hashtag";

function ago(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
  return `${Math.round(minutes / 1440)}d ago`;
}

/** Live news and posts for a search term, the same feed as /trending. */
export async function TrendingMatches({ query }: { query: string }) {
  const tag = cleanTag(query);
  if (tag.length < 2) return null;
  const hits = (await hashtagWall(tag).catch(() => [])).slice(0, 6);
  const href = `/trending?tag=${encodeURIComponent(tag)}`;

  return (
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-black text-slate-900">
          #️⃣ GoDesi Trending: “{tag}”
        </h2>
        <Link
          href={href}
          className="text-sm font-semibold text-indigo-700 underline"
        >
          See all on Trending →
        </Link>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Live news from Google News &amp; Mastodon
      </p>
      {hits.length ? (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hits.map((hit) => (
            <a
              key={hit.link}
              href={hit.link}
              target="_blank"
              rel="noreferrer"
              className="flex min-w-0 flex-col gap-1 break-words rounded-2xl border border-slate-200 bg-white p-3 hover:border-indigo-300 hover:shadow-sm"
            >
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {hit.source === "news" ? "📰 News" : "💬 Post"}
                <span className="font-semibold normal-case text-slate-400">
                  {ago(hit.publishedAt)}
                </span>
              </span>
              <span className="line-clamp-3 text-sm font-semibold text-slate-900">
                {hit.title}
              </span>
              <span className="line-clamp-1 text-xs text-slate-500">
                {hit.author}
              </span>
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-600">
          No live news or posts for this word right now. Trending also searches
          GoDesi news, blogs and deals.
        </p>
      )}
    </section>
  );
}
