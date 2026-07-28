import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { blogSummary } from "@/lib/blog";
import { Card, EmptyState } from "@/components/ui";
import { SidebarBanners } from "@/components/Banners";
import { gradientFor } from "@/lib/categories";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Godesi blog — updates, guides and what's new",
  description:
    "Product updates, community guides and everything we are building on Godesi.",
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
          <a
            href="/blog/rss.xml"
            className="mt-4 inline-block rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25"
          >
            📡 RSS feed
          </a>
        </section>

        {posts.length ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <div className="flex gap-4">
                  {post.coverUrl ? (
                    <Image
                      src={post.coverUrl}
                      alt=""
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
            body="Product updates and guides will appear here."
          />
        )}
      </div>

      <aside className="hidden w-[320px] shrink-0 space-y-4 lg:block">
        <WhatsNew updates={updates} />
        <SidebarBanners />
      </aside>
    </div>
  );
}

function WhatsNew({
  updates,
}: {
  updates: { id: string; slug: string; title: string; publishedAt: Date }[];
}) {
  if (!updates.length) return null;
  return (
    <Card>
      <h2 className="text-base font-bold">What&apos;s new on Godesi 🚀</h2>
      <p className="mt-1 text-xs text-slate-500">
        Everything we have shipped, newest first.
      </p>
      <ul className="mt-3 space-y-3">
        {updates.map((update) => (
          <li key={update.id} className="border-l-2 border-indigo-200 pl-3">
            <Link
              href={`/blog/${update.slug}`}
              className="text-sm font-semibold text-slate-800 hover:text-indigo-600"
            >
              {update.title}
            </Link>
            <p className="text-[11px] text-slate-400">{postDate(update.publishedAt)}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
