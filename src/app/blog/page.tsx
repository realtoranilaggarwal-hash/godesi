import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { blogSummary } from "@/lib/blog";
import { Card, EmptyState } from "@/components/ui";
import { SidebarBanners } from "@/components/Banners";
import { CategoryTreeCard } from "@/components/CategoryTreeCard";
import { gradientFor } from "@/lib/categories";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Godesi blog — updates, guides and what's new",
  description:
    "Product updates, community guides and everything we are building on Godesi — how to get more enquiries, sell online and grow your desi business.",
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/rss.xml" } },
};

function postDate(value: Date) {
  return value.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function BlogPage() {
  const user = await getCurrentUser();
  const [posts, updates] = await Promise.all([
    db.blogPost.findMany({
      where: { published: true, kind: "POST" },
      orderBy: { publishedAt: "desc" },
      take: 30,
    }),
    db.blogPost.findMany({
      where: { published: true, kind: "UPDATE" },
      orderBy: { publishedAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <section
          className={`rounded-3xl bg-gradient-to-r ${gradientFor("indigo")} px-5 py-8 text-white sm:px-8`}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">
            Godesi blog
          </p>
          <h1 className="mt-1 text-3xl font-black">News from the team ✍️</h1>
          <p className="mt-1 max-w-xl text-white/90">
            What we are building, how to get the most out of Godesi, and stories
            from the community.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="/blog/rss.xml"
              className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25"
            >
              📡 RSS feed
            </a>
            {user && isStaff(user) ? (
              <Link
                href="/admin/content"
                className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-indigo-700 hover:bg-white/90"
              >
                ✍️ Write a post
              </Link>
            ) : null}
          </div>
        </section>

        {user && isStaff(user) ? (
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold">Your post space ✍️</h2>
                <p className="text-sm text-slate-600">
                  Write an update for members — it appears right here at the top.
                </p>
              </div>
              <Link
                href="/admin/content"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
              >
                Write a post
              </Link>
            </div>
          </Card>
        ) : null}

        {posts.length ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <div className="flex gap-4">
                  {post.coverUrl ? (
                    <Image
                      src={post.coverUrl}
                      alt={post.title}
                      width={160}
                      height={120}
                      className="hidden h-24 w-32 shrink-0 rounded-xl object-cover sm:block"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-lg font-bold text-slate-900 hover:text-indigo-600"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {postDate(post.publishedAt)}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{blogSummary(post)}</p>
                    {post.tags.length ? (
                      <p className="mt-2 flex flex-wrap gap-1">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600"
                          >
                            #{tag}
                          </span>
                        ))}
                      </p>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No posts yet"
            body="Posts from the Godesi team will appear here. Product updates are listed below."
          />
        )}

        <WhatsNew updates={updates} />
      </div>

      <aside className="hidden w-[280px] shrink-0 space-y-4 lg:order-first lg:block">
        <CategoryTreeCard />
        <SidebarBanners />
      </aside>
    </div>
  );
}

function WhatsNew({
  updates,
}: {
  updates: {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    body: string;
    publishedAt: Date;
  }[];
}) {
  if (!updates.length) return null;
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xl font-black">What&apos;s new on Godesi 🚀</h2>
        <p className="text-sm text-slate-500">
          Everything we have shipped, newest first.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {updates.map((update) => (
          <Card key={update.id}>
            <Link
              href={`/blog/${update.slug}`}
              className="font-bold text-slate-900 hover:text-indigo-600"
            >
              {update.title}
            </Link>
            <p className="text-[11px] text-slate-400">{postDate(update.publishedAt)}</p>
            <p className="mt-1 text-sm text-slate-600">{blogSummary(update)}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
