import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { can, getCurrentUser } from "@/lib/auth";
import { ingestIfStale } from "@/lib/news";
import { NewsCard } from "@/components/NewsCard";
import { NewsForm } from "@/components/forms/NewsForm";
import { InlineBanner, SidebarBanners } from "@/components/Banners";
import { Card, EmptyState, LinkButton } from "@/components/ui";
import { JournalistJoinForm } from "@/components/forms/JournalistJoinForm";
import { JournalistBadge } from "@/components/JournalistBadge";
import { JOURNALIST_RULES, levelFor, topJournalists } from "@/lib/journalists";
import { gradientFor } from "@/lib/categories";
import { freshNewsCutoff } from "@/lib/news";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Desi news",
  description:
    "Community, business and India headlines, refreshed every 30 minutes.",
};

export default async function NewsPage() {
  const user = await getCurrentUser();
  const isNewsStaff = user ? can(user, "news") : false;

  // Refreshes the feed if the last crawl is older than 30 minutes.
  await ingestIfStale(30).catch(() => null);

  const items = await db.newsItem.findMany({
    where: { status: "PUBLISHED", publishedAt: { gte: freshNewsCutoff() } },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: 40,
    include: {
      submittedBy: { select: { name: true, username: true, avatarUrl: true } },
    },
  });

  const myVotes = user
    ? await db.newsVote.findMany({
        where: { userId: user.id, newsId: { in: items.map((item) => item.id) } },
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
            Headlines pulled from trusted feeds every 30 minutes, plus stories
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
              href="#post"
              className="rounded-xl bg-white/20 px-3 py-1.5 text-white hover:bg-white/30"
            >
              ✍️ Post a story
            </Link>
          </div>
        </section>

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
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <NewsCard
                key={item.id}
                item={item}
                vote={voteByNews.get(item.id) ?? 0}
                posterLevel={
                  item.submittedById
                    ? levelByUser.get(item.submittedById) ?? null
                    : null
                }
                canVote={Boolean(user)}
                canFeature={isNewsStaff}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No stories yet"
            body="The news crawler runs every 30 minutes — check back shortly."
          />
        )}

        <p className="rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Stories credited to a member are submitted by the community.
          Godesi reviews them but does not verify every claim, and our team can
          edit, unpublish or delete any story that is not genuine, original or
          safe. Spotted a problem?{" "}
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
                      alt=""
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
                      <span className="truncate text-slate-600">{item.title}</span>
                      <span className="shrink-0 text-xs font-bold uppercase text-slate-400">
                        {item.status === "PENDING" ? "In review" : "Not accepted"}
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
              <LinkButton href="/login?next=/news">Sign in to post news</LinkButton>
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
        <InlineBanner />
      </div>

      <SidebarBanners />
    </div>
  );
}
