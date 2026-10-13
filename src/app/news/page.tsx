import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { can, getCurrentUser } from "@/lib/auth";
import { NewsCard } from "@/components/NewsCard";
import { NewsForm } from "@/components/forms/NewsForm";
import {
  InContentBanner,
  InlineBanner,
  SidebarBanners,
} from "@/components/Banners";
import { ChatPanel } from "@/components/ChatPanel";
import { Card, EmptyState, LinkButton } from "@/components/ui";
import { JournalistJoinForm } from "@/components/forms/JournalistJoinForm";
import { JournalistBadge } from "@/components/JournalistBadge";
import { JOURNALIST_RULES, levelFor, topJournalists } from "@/lib/journalists";
import { gradientFor } from "@/lib/categories";
import { freshNewsCutoff } from "@/lib/news";
import { NEWS_TOPICS, topicSlug } from "@/lib/newsTopics";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Desi news & community headlines",
  description:
    "Community, business and India headlines for the desi diaspora, refreshed daily from trusted sources, plus stories reported by Godesi members.",
  alternates: {
    canonical: "/news",
    types: { "application/rss+xml": "/news/rss.xml" },
  },
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: { topic?: string };
}) {
  const user = await getCurrentUser();
  const topic = searchParams.topic ? topicSlug(searchParams.topic) : null;
  // Older stories were filed before topics existed, so a filter also matches
  // the free-text category the reporter picked back then.
  const topicWhere = topic
    ? {
        OR: [
          { topic },
          {
            category: {
              equals: NEWS_TOPICS.find((row) => row.slug === topic)?.label,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};
  const isNewsStaff = user ? can(user, "news") : false;

  /**
   * Wire feeds publish dozens of stories an hour and would bury the community's
   * own reporting, so member stories are queried separately and pinned on top.
   */
  const [memberStories, wireStories] = await Promise.all([
    db.newsItem.findMany({
      where: {
        status: "PUBLISHED",
        submittedById: { not: null },
        publishedAt: { gte: freshNewsCutoff() },
        ...topicWhere,
      },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take: 12,
      include: {
        submittedBy: {
          select: { name: true, username: true, avatarUrl: true },
        },
      },
    }),
    db.newsItem.findMany({
      where: {
        status: "PUBLISHED",
        submittedById: null,
        publishedAt: { gte: freshNewsCutoff() },
        ...topicWhere,
      },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take: 40,
      include: {
        submittedBy: {
          select: { name: true, username: true, avatarUrl: true },
        },
      },
    }),
  ]);

  const items = [...memberStories, ...wireStories].slice(0, 40);

  const myVotes = user
    ? await db.newsVote.findMany({
        where: {
          userId: user.id,
          newsId: { in: items.map((item) => item.id) },
        },
        select: { newsId: true, value: true },
      })
    : [];
  const voteByNews = new Map(myVotes.map((vote) => [vote.newsId, vote.value]));

  // Star levels for the members whose stories are on the page.
  const submitterIds = Array.from(
    new Set(
      items.flatMap((item) => (item.submittedById ? [item.submittedById] : [])),
    ),
  );
  const approvedCounts = submitterIds.length
    ? await db.newsItem.groupBy({
        by: ["submittedById"],
        where: { status: "PUBLISHED", submittedById: { in: submitterIds } },
        _count: { _all: true },
      })
    : [];
  const levelByUser = new Map(
    approvedCounts.map((row) => [
      row.submittedById ?? "",
      levelFor(row._count._all),
    ]),
  );

  const leaders = await topJournalists(5);

  const mine = user
    ? await db.newsItem.findMany({
        where: { submittedById: user.id, status: { not: "PUBLISHED" } },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, status: true },
      })
    : [];

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <section
          className={`rounded-3xl bg-gradient-to-r ${gradientFor("sky")} px-5 py-8 text-white sm:px-8`}
        >
          <h1 className="text-3xl font-black">Desi news 📰</h1>
          <p className="mt-1 max-w-xl text-white/90">
            Headlines pulled from trusted feeds once a day, plus stories
            submitted by our members — vote the best ones up.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
            <Link
              href="/journalists"
              className="rounded-xl bg-white/95 px-3 py-1.5 text-sky-700 hover:bg-white"
            >
              🗞️ Become a local journalist
            </Link>
            <Link
              href="/news/report"
              className="rounded-xl bg-white/95 px-3 py-1.5 text-sky-700 hover:bg-white"
            >
              📰 Report local news
            </Link>
            <Link
              href="/trending"
              className="rounded-xl bg-white/95 px-3 py-1.5 text-sky-700 hover:bg-white"
            >
              #️⃣ Trending hashtags
            </Link>
            <Link
              href="/wall"
              className="rounded-xl bg-white/95 px-3 py-1.5 text-sky-700 hover:bg-white"
            >
              🧱 Desi news wall
            </Link>
            <Link
              href="#post"
              className="rounded-xl bg-white/20 px-3 py-1.5 text-white hover:bg-white/30"
            >
              ✍️ Share a link
            </Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
          <Link
            href="/news"
            className={`rounded-full px-3 py-1 ${
              topic
                ? "border border-slate-200 text-slate-600 hover:bg-slate-50"
                : "bg-slate-900 text-white"
            }`}
          >
            All news
          </Link>
          {NEWS_TOPICS.map((row) => (
            <Link
              key={row.slug}
              href={`/news?topic=${row.slug}`}
              className={`rounded-full px-3 py-1 ${
                topic === row.slug
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {row.emoji} {row.label}
            </Link>
          ))}
        </div>

        {user && !user.journalistSince ? (
          <Card className="border-amber-200 bg-amber-50">
            <h2 className="font-bold">
              Do you want to be a local journalist? 🗞️
            </h2>
            <p className="mt-1 text-sm text-amber-900">
              Post news and happenings from your own city, earn stars on your
              profile and reward points for every approved story.
            </p>
            <div className="mt-3">
              <JournalistJoinForm />
            </div>
          </Card>
        ) : null}

        {items.length ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.slice(0, 6).map((item) => (
                <NewsCard
                  key={item.id}
                  item={item}
                  vote={voteByNews.get(item.id) ?? 0}
                  posterLevel={
                    item.submittedById
                      ? (levelByUser.get(item.submittedById) ?? null)
                      : null
                  }
                  canVote={Boolean(user)}
                  canFeature={isNewsStaff}
                />
              ))}
            </div>
            {items.length > 6 ? (
              <>
                <InContentBanner />
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.slice(6).map((item) => (
                    <NewsCard
                      key={item.id}
                      item={item}
                      vote={voteByNews.get(item.id) ?? 0}
                      posterLevel={
                        item.submittedById
                          ? (levelByUser.get(item.submittedById) ?? null)
                          : null
                      }
                      canVote={Boolean(user)}
                      canFeature={isNewsStaff}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </>
        ) : (
          <EmptyState
            title={topic ? "Nothing on this topic yet" : "No stories yet"}
            body={
              topic
                ? "Be the first — file a report and pick this topic."
                : "The news crawler runs once a day — check back shortly."
            }
          />
        )}

        <p className="rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Stories credited to a member are submitted by the community. Godesi
          reviews them but does not verify every claim, and our team can edit,
          unpublish or delete any story that is not genuine, original or safe.
          Spotted a problem?{" "}
          <Link href="/contact" className="font-semibold underline">
            Report it
          </Link>
          .
        </p>

        {leaders.length ? (
          <Card>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-bold">Top local journalists 🏆</h2>
              <Link
                href="/journalists"
                className="text-sm font-semibold text-indigo-600"
              >
                Join / see all
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-slate-100">
              {leaders.map((leader) => (
                <li
                  key={leader.id}
                  className="flex items-center gap-3 py-2 text-sm"
                >
                  {leader.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={leader.avatarUrl}
                      alt={leader.name ?? "Godesi member"}
                      className="h-7 w-7 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-xs font-bold text-white">
                      {leader.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate">
                    {leader.username ? (
                      <Link
                        href={`/${leader.username}`}
                        className="font-semibold hover:text-indigo-600"
                      >
                        {leader.name}
                      </Link>
                    ) : (
                      <span className="font-semibold">{leader.name}</span>
                    )}
                    {leader.beat ? (
                      <span className="block truncate text-xs text-slate-500">
                        {leader.beat}
                      </span>
                    ) : null}
                  </span>
                  <JournalistBadge level={leader.level} />
                  <span className="text-xs font-bold text-slate-500">
                    {leader.approved}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <Card id="post">
          <h2 className="font-bold">Share a story ✍️</h2>
          <p className="mt-1 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Saw it yourself? File a{" "}
            <Link href="/news/report" className="font-bold underline">
              full report with photos
            </Link>{" "}
            instead — this box is for sharing someone else&rsquo;s article.
          </p>
          {user ? (
            <>
              <p className="mt-1 text-sm text-slate-600">
                {isNewsStaff
                  ? "You publish instantly."
                  : "Our team reviews member stories before they go live, and you earn reward points when yours is approved, gets upvotes or is picked as important news."}
              </p>
              <div className="mt-3">
                <NewsForm isAdmin={isNewsStaff} />
              </div>
              {mine.length ? (
                <ul className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-sm">
                  {mine.map((item) => (
                    <li key={item.id} className="flex justify-between gap-3">
                      <span className="truncate text-slate-600">
                        {item.title}
                      </span>
                      <span className="shrink-0 text-xs font-bold uppercase text-slate-400">
                        {item.status === "PENDING"
                          ? "In review"
                          : "Not accepted"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : (
            <div className="mt-2 space-y-3">
              <p className="text-sm text-slate-600">
                Any Godesi member can submit a story — sign in and share it. Our
                team reviews submissions, and contributors earn reward points.
              </p>
              <LinkButton href="/login?next=/news">
                Sign in to post news
              </LinkButton>
            </div>
          )}

          <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Posting rules
            </p>
            <ul className="space-y-1 text-xs text-slate-500">
              {JOURNALIST_RULES.map((rule) => (
                <li key={rule}>• {rule}</li>
              ))}
            </ul>
          </div>
        </Card>
        <ChatPanel />
        <InlineBanner />
      </div>

      <SidebarBanners />
    </div>
  );
}
