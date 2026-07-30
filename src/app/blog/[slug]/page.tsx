import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { blogBlocks, blogSummary } from "@/lib/blog";
import { Card } from "@/components/ui";
import { InArticleAd } from "@/components/InArticleAd";
import { ShareButtons } from "@/components/ShareButtons";
import { SidebarBanners } from "@/components/Banners";
import { siteUrl } from "@/lib/format";

export const dynamic = "force-dynamic";

async function loadPost(slug: string) {
  return db.blogPost.findFirst({
    where: { slug, published: true },
    include: { author: { select: { name: true } } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await loadPost(params.slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: blogSummary(post),
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: blogSummary(post),
      images: post.coverUrl ? [post.coverUrl] : undefined,
      type: "article",
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await loadPost(params.slug);
  if (!post) notFound();

  const blocks = blogBlocks(post.body);

  return (
    <div className="flex gap-6">
      <article className="min-w-0 flex-1 space-y-4">
        <Link href="/blog" className="text-sm font-semibold text-indigo-600">
          ← All posts
        </Link>
        <Card>
          {post.coverUrl ? (
            <Image
              src={post.coverUrl}
              alt=""
              width={1200}
              height={630}
              className="mb-4 h-56 w-full rounded-2xl object-cover"
            />
          ) : null}
          {post.kind === "UPDATE" ? (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
              What&apos;s new
            </span>
          ) : null}
          <h1 className="mt-2 text-3xl font-black text-slate-900">{post.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {post.publishedAt.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {post.author?.name ? ` · ${post.author.name}` : ""}
          </p>

          <div className="mt-5 space-y-4 text-[15px] leading-7 text-slate-700">
            {blocks.map((block, index) =>
              block.type === "image" ? (
                <figure key={index} className="space-y-1">
                  <Image
                    src={block.src}
                    alt={block.caption}
                    width={1280}
                    height={900}
                    className="w-full rounded-2xl border border-slate-200"
                  />
                  {block.caption ? (
                    <figcaption className="text-xs text-slate-500">
                      {block.caption}
                    </figcaption>
                  ) : null}
                </figure>
              ) : block.type === "list" ? (
                <ul key={index} className="list-disc space-y-1 pl-5">
                  {block.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p key={index} className="whitespace-pre-line">
                  {block.text}
                </p>
              ),
            )}
          </div>

          {post.tags.length ? (
            <p className="mt-5 flex flex-wrap gap-1">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/resources?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  #{tag}
                </Link>
              ))}
            </p>
          ) : null}

          <InArticleAd className="mt-5" />

          <div className="mt-5 border-t border-slate-100 pt-4">
            <ShareButtons
              url={`${siteUrl()}/blog/${post.slug}`}
              title={post.title}
            />
          </div>
        </Card>
      </article>

      <aside className="hidden w-[280px] shrink-0 space-y-4 lg:order-first lg:block">
        <SidebarBanners />
      </aside>
    </div>
  );
}
