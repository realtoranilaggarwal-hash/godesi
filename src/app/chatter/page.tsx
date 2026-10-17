import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { siteUrl } from "@/lib/format";
import { uploadsEnabled } from "@/lib/uploads";
import {
  CHATTER_TOPICS,
  chatterFeed,
  followingFeed,
  isChatterTopic,
  topicOf,
  trendingChatterTags,
  viewerState,
} from "@/lib/chatter";
import { ChatterComposer } from "@/components/chatter/ChatterComposer";
import { ChatterPostCard } from "@/components/chatter/ChatterPostCard";
import { Card, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

type Search = {
  topic?: string;
  city?: string;
  tag?: string;
  before?: string;
  feed?: string;
};

export function generateMetadata({
  searchParams,
}: {
  searchParams: Search;
}): Metadata {
  const topic =
    searchParams.topic && isChatterTopic(searchParams.topic)
      ? topicOf(searchParams.topic)
      : null;
  const tag = searchParams.tag?.replace(/^#/, "");
  const label = tag
    ? `#${tag}`
    : topic
      ? topic.label
      : searchParams.city
        ? searchParams.city
        : null;
  const filtered = Boolean(label || searchParams.before || searchParams.feed);
  return {
    title: label
      ? `${label} on GoDesi Chatter`
      : "GoDesi Chatter — your community, your voice",
    description:
      "Are you a Gapodi? Short posts, questions and stories from the desi community — food, cricket, Bollywood, jobs, local news and more.",
    alternates: { canonical: `${siteUrl()}/chatter` },
    robots:
      filtered && !tag && !topic ? { index: false, follow: true } : undefined,
  };
}

function feedHref(base: Search, change: Partial<Search>) {
  const params = new URLSearchParams();
  const merged = { ...base, before: undefined, ...change };
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `/chatter?${query}` : "/chatter";
}

const chip = "rounded-full px-3 py-1 text-xs font-semibold";

export default async function ChatterPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const user = await getCurrentUser();
  const following = searchParams.feed === "following" && Boolean(user);
  const filter = {
    topic: searchParams.topic,
    city: searchParams.city?.trim(),
    tag: searchParams.tag?.replace(/^#/, ""),
    before: searchParams.before,
  };
  const [feed, tags] = await Promise.all([
    following && user ? followingFeed(user.id, filter) : chatterFeed(filter),
    trendingChatterTags(),
  ]);
  const viewer = await viewerState(user?.id ?? null, feed.posts);
  const posts = feed.posts.filter(
    (post) => !viewer.blocked.has(post.author.id),
  );
  const uploads = uploadsEnabled();
  const activeTopic =
    filter.topic && isChatterTopic(filter.topic) ? filter.topic : null;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4">
        <header className="rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-widest opacity-90">
            GoDesi Chatter · beta
          </p>
          <h1 className="mt-1 text-3xl font-black">Are you a Gapodi?</h1>
          <p className="mt-1 text-sm opacity-95">
            Your community, your voice. Share what&apos;s on your mind — food,
            cricket, Bollywood, jobs, local news — in any language.
          </p>
        </header>

        <Card>
          {user ? (
            <ChatterComposer
              uploads={uploads}
              defaultCity={user.location}
              defaultTopic={activeTopic ?? undefined}
            />
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-700">
                <strong>What&apos;s on your mind?</strong> Sign in with your
                GoDesi account to post, reply and follow people.
              </p>
              <div className="flex gap-2">
                <Link
                  href="/login?next=/chatter"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold"
                >
                  Log in
                </Link>
                <Link
                  href="/signup?next=/chatter"
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white"
                >
                  Join free
                </Link>
              </div>
            </div>
          )}
        </Card>

        <nav aria-label="Chatter feeds" className="flex flex-wrap gap-2">
          <Link
            href={feedHref(searchParams, { feed: undefined })}
            className={`${chip} ${following ? "bg-slate-100 text-slate-700" : "bg-slate-900 text-white"}`}
          >
            Everyone
          </Link>
          <Link
            href={
              user
                ? feedHref(searchParams, { feed: "following" })
                : "/login?next=/chatter?feed=following"
            }
            className={`${chip} ${following ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
          >
            People I follow
          </Link>
          <form action="/chatter" className="ml-auto flex gap-1">
            {activeTopic ? (
              <input type="hidden" name="topic" value={activeTopic} />
            ) : null}
            {following ? (
              <input type="hidden" name="feed" value="following" />
            ) : null}
            <input
              name="city"
              defaultValue={filter.city ?? ""}
              placeholder="Filter by city"
              aria-label="Filter by city"
              className="w-36 rounded-lg border border-slate-300 px-2 py-1 text-xs"
            />
            <button
              type="submit"
              className="rounded-lg bg-slate-100 px-2 text-xs font-semibold"
            >
              Go
            </button>
          </form>
        </nav>

        {filter.tag || filter.city || activeTopic ? (
          <p className="text-sm text-slate-600">
            Showing {filter.tag ? <strong>#{filter.tag}</strong> : null}
            {activeTopic ? (
              <strong> {topicOf(activeTopic).label}</strong>
            ) : null}
            {filter.city ? <strong> in {filter.city}</strong> : null} ·{" "}
            <Link
              href={following ? "/chatter?feed=following" : "/chatter"}
              className="text-indigo-700 underline"
            >
              clear
            </Link>
            {filter.tag ? (
              <>
                {" "}
                ·{" "}
                <Link
                  href={`/trending?tag=${encodeURIComponent(`#${filter.tag}`)}`}
                  className="text-indigo-700 underline"
                >
                  #{filter.tag} on Trending
                </Link>
              </>
            ) : null}
          </p>
        ) : null}

        {posts.length === 0 ? (
          <EmptyState
            title={
              following
                ? "Nothing from people you follow yet"
                : "No posts here yet"
            }
            body={
              following
                ? "Tap + Follow on any post to see that member here."
                : "Be the first Gapodi to say something!"
            }
          />
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <ChatterPostCard
                key={post.id}
                post={post}
                viewerId={user?.id ?? null}
                liked={viewer.liked.has(post.id)}
                following={viewer.following.has(post.author.id)}
                uploads={uploads}
              />
            ))}
          </div>
        )}

        {feed.nextBefore ? (
          <div className="text-center">
            <Link
              href={feedHref(searchParams, { before: feed.nextBefore })}
              className="inline-block rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold"
              rel="nofollow"
            >
              Older posts →
            </Link>
          </div>
        ) : null}
      </div>

      <aside className="space-y-4">
        <Card>
          <h2 className="text-sm font-bold">Topics</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {CHATTER_TOPICS.map((topic) => (
              <li key={topic.id}>
                <Link
                  href={feedHref(searchParams, {
                    topic: activeTopic === topic.id ? undefined : topic.id,
                    tag: undefined,
                  })}
                  className={`block rounded px-2 py-1 hover:bg-slate-50 ${activeTopic === topic.id ? "bg-orange-50 font-semibold text-orange-700" : ""}`}
                >
                  {topic.emoji} {topic.label}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        {tags && tags.length ? (
          <Card>
            <h2 className="text-sm font-bold">🔥 Trending on Chatter</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map(({ tag, count }) => (
                <Link
                  key={tag}
                  href={`/chatter?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700"
                >
                  #{tag} <span className="text-indigo-400">{count}</span>
                </Link>
              ))}
            </div>
          </Card>
        ) : null}
        <Card>
          <h2 className="text-sm font-bold">Chatter rules</h2>
          <p className="mt-1 text-xs text-slate-600">
            Be kind, no abuse or hate, no spam or selling in every post, and no
            one else&apos;s private details. Report anything that breaks the
            rules.
          </p>
          <Link
            href="/chatter/rules"
            className="mt-2 inline-block text-xs font-semibold text-indigo-700 underline"
          >
            Read all the rules
          </Link>
        </Card>
      </aside>
    </div>
  );
}
