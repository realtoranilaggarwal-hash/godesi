import type { Metadata } from "next";
import { db } from "@/lib/db";
import { can, getCurrentUser } from "@/lib/auth";
import { ingestIfStale } from "@/lib/news";
import { NewsCard } from "@/components/NewsCard";
import { NewsForm } from "@/components/forms/NewsForm";
import { InlineBanner, SidebarBanners } from "@/components/Banners";
import { Card, EmptyState, LinkButton } from "@/components/ui";
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
        </section>

        {items.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <NewsCard
                key={item.id}
                item={item}
                vote={voteByNews.get(item.id) ?? 0}
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

        <Card>
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
        </Card>
        <InlineBanner />
      </div>

      <SidebarBanners />
    </div>
  );
}
