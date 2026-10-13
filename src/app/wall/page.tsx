import type { Metadata } from "next";
import Link from "next/link";
import { hashtagWall, hitAgo, type HashtagHit } from "@/lib/hashtag";
import { wallTopics } from "@/lib/wallTopics";
import { siteUrl } from "@/lib/format";
import { InlineBanner, SidebarBanners } from "@/components/Banners";
import { Card, inputClass } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Desi news wall — live headlines by topic | Godesi",
  description:
    "A wall of live desi news: H-1B, Indian community in the USA, events, investments, weddings, Bollywood and more, refreshed through the day.",
  alternates: { canonical: `${siteUrl()}/wall` },
};

const PER_BOX = 5;

/**
 * A box only has five rows, so an old headline is a wasted one — but a quiet
 * topic would otherwise show an empty box, hence the fallback.
 */
function recent(hits: HashtagHit[]) {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const fresh = hits.filter(
    (hit) => new Date(hit.publishedAt).getTime() >= cutoff,
  );
  return (fresh.length ? fresh : hits).slice(0, PER_BOX);
}

function HitRow({ hit }: { hit: HashtagHit }) {
  return (
    <a
      href={hit.link}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col gap-0.5 rounded-xl px-2 py-2 hover:bg-indigo-50"
    >
      <span className="line-clamp-3 text-sm font-semibold text-slate-900">
        {hit.title}
      </span>
      <span className="line-clamp-1 text-[11px] text-slate-500">
        {hit.source === "news" ? "📰" : "💬"} {hit.author} ·{" "}
        {hitAgo(hit.publishedAt)}
      </span>
    </a>
  );
}

export default async function WallPage() {
  const topics = await wallTopics();
  // One slow source must not blank the whole wall.
  const results = await Promise.all(
    topics.map((topic) =>
      hashtagWall(topic.query).catch(() => [] as HashtagHit[]),
    ),
  );
  const boxes = topics
    .map((topic, index) => ({ topic, hits: recent(results[index]) }))
    .filter((box) => box.hits.length);

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-4">
        <section className="rounded-3xl bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 px-5 py-7 text-white sm:px-8">
          <h1 className="text-2xl font-black sm:text-3xl">Desi news wall 🧱</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/90">
            Every topic our community follows, live in one screen — headlines and
            public posts, refreshed through the day.
          </p>
          <form action="/trending" className="mt-4 flex flex-wrap gap-2">
            <input
              name="tag"
              placeholder="Search any other topic — #Garba, Edison NJ…"
              aria-label="Topic or hashtag"
              className={`${inputClass} max-w-sm flex-1 text-slate-900`}
            />
            <button className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900">
              Show me
            </button>
          </form>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {boxes.map(({ topic, hits }) => (
            <section
              key={topic.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-3"
            >
              <Link
                href={`/trending?tag=${encodeURIComponent(topic.query)}`}
                className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-2 py-1.5 text-sm font-bold text-slate-900 hover:bg-indigo-50"
              >
                <span className="truncate">
                  {topic.emoji ? `${topic.emoji} ` : ""}
                  {topic.label}
                </span>
                <span className="shrink-0 text-xs font-semibold text-indigo-600">
                  See all →
                </span>
              </Link>
              <div className="mt-1 divide-y divide-slate-100">
                {hits.map((hit) => (
                  <HitRow key={hit.link} hit={hit} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <InlineBanner />

        <Card>
          <p className="text-sm text-slate-600">
            Headlines come from Google News and posts from Mastodon&apos;s public
            timeline — both free and open, and each box links out to the original
            publisher. X (Twitter) charges for search access, so tweets
            can&apos;t be shown here. Got a story of your own?{" "}
            <Link href="/news/report" className="font-semibold text-indigo-700">
              Post it on Godesi
            </Link>
            .
          </p>
        </Card>
      </div>

      <SidebarBanners />
    </div>
  );
}
