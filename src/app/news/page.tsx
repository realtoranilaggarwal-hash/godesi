import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { effectivePlan } from "@/lib/plans";
import { ingestIfStale } from "@/lib/news";
import { NewsCard } from "@/components/NewsCard";
import { NewsForm } from "@/components/forms/NewsForm";
import { SidebarBanners } from "@/components/Banners";
import { Card, EmptyState, LinkButton } from "@/components/ui";
import { gradientFor } from "@/lib/categories";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Desi news",
  description: "Community, business and India headlines, refreshed every 30 minutes.",
};

export default async function NewsPage() {
  const user = await getCurrentUser();
  const canSubmit = user && (user.role === "ADMIN" || effectivePlan(user) !== "FREE");

  // Refreshes the feed if the last crawl is older than 30 minutes.
  await ingestIfStale(30).catch(() => null);

  const items = await db.newsItem.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 40,
  });

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <section
          className={`rounded-3xl bg-gradient-to-r ${gradientFor("sky")} px-5 py-8 text-white sm:px-8`}
        >
          <h1 className="text-3xl font-black">Desi news 📰</h1>
          <p className="mt-1 max-w-xl text-white/90">
            Headlines pulled from trusted feeds every 30 minutes, plus stories submitted by
            our members.
          </p>
        </section>

        {items.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No stories yet"
            body="The news crawler runs every 30 minutes — check back shortly."
          />
        )}

        <Card>
          <h2 className="font-bold">Share a story</h2>
          {canSubmit ? (
            <div className="mt-3">
              <NewsForm isAdmin={user.role === "ADMIN"} />
            </div>
          ) : (
            <div className="mt-2 space-y-3">
              <p className="text-sm text-slate-600">
                Submitting news is a Pro and Premium member benefit. Admins publish
                instantly; member stories are reviewed first.
              </p>
              <LinkButton href="/pricing">See plans</LinkButton>
            </div>
          )}
        </Card>
      </div>

      <SidebarBanners />
    </div>
  );
}
