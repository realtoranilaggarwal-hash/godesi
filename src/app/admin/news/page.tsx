import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  deleteNewsAction,
  deleteNewsFeedAction,
  setNewsStatusAction,
} from "@/app/actions/admin";
import { NewsFeedForm } from "@/components/forms/NewsFeedForm";
import { Badge, Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "News desk" };

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/news");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [newsItems, feeds] = await Promise.all([
    db.newsItem.findMany({ orderBy: { createdAt: "desc" }, take: 40 }),
    db.newsFeed.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">News desk</h1>
      <Card id="news">
        <h2 className="mb-1 text-lg font-bold">News</h2>
        <p className="mb-3 text-sm text-slate-500">
          The crawler runs every 30 minutes and skips duplicates. Member
          submissions arrive as pending.
        </p>
        <NewsFeedForm />

        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {feeds.map((feed) => (
            <li
              key={feed.id}
              className="flex items-center justify-between gap-2 py-2"
            >
              <div>
                <p className="font-medium">{feed.name}</p>
                <p className="text-xs text-slate-400">
                  {feed.url} · last run{" "}
                  {feed.lastFetchedAt
                    ? feed.lastFetchedAt.toLocaleString("en-IN")
                    : "never"}
                </p>
              </div>
              <form action={deleteNewsFeedAction}>
                <input type="hidden" name="id" value={feed.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  remove
                </button>
              </form>
            </li>
          ))}
        </ul>

        <ul className="mt-4 divide-y divide-slate-100 text-sm">
          {newsItems.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2"
            >
              <div className="min-w-0">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-indigo-600"
                >
                  {item.title}
                </a>
                <p className="text-xs text-slate-400">
                  {item.source} · {item.publishedAt.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  tone={
                    item.status === "PUBLISHED"
                      ? "green"
                      : item.status === "PENDING"
                        ? "amber"
                        : "red"
                  }
                >
                  {item.status}
                </Badge>
                {(["PUBLISHED", "REJECTED"] as const)
                  .filter((status) => status !== item.status)
                  .map((status) => (
                    <form key={status} action={setNewsStatusAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="status" value={status} />
                      <button
                        type="submit"
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                      >
                        {status.toLowerCase()}
                      </button>
                    </form>
                  ))}
                <form action={deleteNewsAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    delete
                  </button>
                </form>
              </div>
            </li>
          ))}
          {newsItems.length === 0 ? (
            <li className="py-2 text-slate-500">No stories ingested yet.</li>
          ) : null}
        </ul>
      </Card>
    </div>
  );
}
