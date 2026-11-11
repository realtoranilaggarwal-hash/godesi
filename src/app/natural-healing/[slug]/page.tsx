import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card } from "@/components/ui";
import { ShareButtons } from "@/components/ShareButtons";
import { ArticleCardLink } from "@/components/wellness/ArticleCardLink";
import { HealthDisclaimer } from "@/components/wellness/HealthDisclaimer";
import { ProductBlock } from "@/components/wellness/ProductBlock";
import { WellnessText } from "@/components/wellness/WellnessText";
import { siteUrl } from "@/lib/format";
import { metaDescription, pageTitle } from "@/lib/seo";
import {
  WELLNESS_EBOOK_PATH,
  WELLNESS_PATH,
  parseSources,
  tableOfContents,
  wellnessArticle,
  wellnessArticles,
  wellnessBlocks,
  wellnessProducts,
} from "@/lib/wellness";

export const dynamic = "force-dynamic";

const AUTHOR = "GoDesi Wellness Desk";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await wellnessArticle(params.slug);
  if (!article) return { title: "Article not found" };
  const title = pageTitle(article.title);
  const description = metaDescription(
    article.metaDescription,
    "From GoDesi Natural Healing & Wellness — traditional Indian wisdom for modern living.",
  );
  return {
    title,
    description,
    alternates: { canonical: `${WELLNESS_PATH}/${article.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.publishedAt,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export default async function WellnessArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await wellnessArticle(params.slug);
  if (!article) notFound();

  const [articles, products] = await Promise.all([
    wellnessArticles(),
    article.productCategories.length
      ? wellnessProducts(article.productCategories, article.slug)
      : Promise.resolve([]),
  ]);
  void db.wellnessArticle
    .update({ where: { id: article.id }, data: { views: { increment: 1 } } })
    .catch(() => null);

  const blocks = wellnessBlocks(article.body);
  const toc = tableOfContents(blocks);
  const sources = parseSources(article.sources);
  const index = articles.findIndex((item) => item.slug === article.slug);
  const related = [...articles.slice(index + 1), ...articles.slice(0, Math.max(index, 0))]
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3);
  const url = `${siteUrl()}${WELLNESS_PATH}/${article.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    image: article.coverImage ? [`${siteUrl()}${article.coverImage}`] : undefined,
    author: { "@type": "Organization", name: AUTHOR },
    publisher: { "@type": "Organization", name: "GoDesi" },
    mainEntityOfPage: url,
  };

  return (
    <article className="mx-auto max-w-3xl space-y-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Link href={WELLNESS_PATH} className="text-sm font-semibold text-emerald-700">
        ← Natural Healing &amp; Wellness
      </Link>
      <Card>
        {article.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImage}
            alt={article.title}
            className="mb-4 aspect-[1200/630] w-full rounded-2xl object-cover"
          />
        ) : null}
        <h1 className="break-words text-3xl font-black text-slate-900">{article.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          By {AUTHOR} ·{" "}
          <time dateTime={article.publishedAt}>
            {new Date(article.publishedAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </p>

        <HealthDisclaimer extra={article.disclaimer} className="mt-4" />

        {toc.length > 1 ? (
          <nav aria-label="Table of contents" className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-900">In this article</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="text-emerald-700 hover:underline">
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className="mt-5">
          <WellnessText blocks={blocks} />
        </div>

        {sources.length ? (
          <section className="mt-6 border-t border-slate-100 pt-4">
            <h2 id="sources" className="text-lg font-black text-slate-900">Sources</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              {sources.map((source) => (
                <li key={source.url} className="break-words">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 underline"
                  >
                    {source.title}
                  </a>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <HealthDisclaimer className="mt-6" />

        <div className="mt-5 border-t border-slate-100 pt-4">
          <ShareButtons url={url} title={article.title} />
        </div>
      </Card>

      <ProductBlock products={products} />

      <Link
        href={WELLNESS_EBOOK_PATH}
        className="block rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900 hover:border-amber-400"
      >
        🎁 Free for GoDesi members: the Natural Healing eBook — Traditional Indian Wisdom for
        Modern Living →
      </Link>

      {related.length ? (
        <section>
          <h2 className="mb-3 text-lg font-black text-slate-900">Related articles</h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug} className="min-w-0">
                <ArticleCardLink article={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
