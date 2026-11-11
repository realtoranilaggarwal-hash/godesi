import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCardLink } from "@/components/wellness/ArticleCardLink";
import { HealthDisclaimer } from "@/components/wellness/HealthDisclaimer";
import { ProductBlock } from "@/components/wellness/ProductBlock";
import { cachedCurrentUser } from "@/lib/auth";
import {
  WELLNESS_EBOOK_PATH,
  WELLNESS_PATH,
  activeEbook,
  wellnessArticles,
  wellnessProducts,
} from "@/lib/wellness";

export const dynamic = "force-dynamic";

const DESCRIPTION =
  "GoDesi Natural Healing & Wellness — traditional Indian home wisdom like tamra jal, ginger, turmeric and pranayama, explained with modern research and safety notes.";

export const metadata: Metadata = {
  title: "Natural Healing & Wellness",
  description: DESCRIPTION,
  alternates: { canonical: WELLNESS_PATH },
  openGraph: {
    title: "GoDesi Natural Healing & Wellness",
    description: DESCRIPTION,
    images: ["/wellness/banner.svg"],
  },
};

export default async function NaturalHealingPage() {
  const [articles, ebook, products, user] = await Promise.all([
    wellnessArticles(),
    activeEbook(),
    wellnessProducts(null),
    cachedCurrentUser(),
  ]);
  const featured = articles.find((article) => article.featured) ?? articles[0];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-700 to-amber-600 p-6 text-white sm:p-10">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">GoDesi</p>
        <h1 className="mt-1 text-3xl font-black sm:text-4xl">🌿 Natural Healing &amp; Wellness</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
          The kitchen remedies and daily habits our dadis and nanis swore by — copper water,
          ginger, haldi, a warm compress, a walk after dinner, a few minutes of pranayama —
          explained in plain language, with what modern research says and when to be careful.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {featured ? (
            <Link
              href={`${WELLNESS_PATH}/${featured.slug}`}
              className="rounded-full bg-white px-4 py-2 text-sm font-bold text-emerald-800"
            >
              Start reading
            </Link>
          ) : null}
          {ebook ? (
            <Link
              href={WELLNESS_EBOOK_PATH}
              className="rounded-full border border-white/70 px-4 py-2 text-sm font-bold text-white"
            >
              🎁 Free eBook
            </Link>
          ) : null}
        </div>
      </section>

      <HealthDisclaimer />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {featured ? (
          <section className="min-w-0">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
              Featured article
            </h2>
            <Link
              href={`${WELLNESS_PATH}/${featured.slug}`}
              className="block overflow-hidden rounded-2xl border border-slate-200 bg-white hover:border-emerald-400"
            >
              {featured.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featured.coverImage} alt="" className="aspect-[1200/630] w-full object-cover" />
              ) : null}
              <span className="block p-4">
                <span className="block break-words text-2xl font-black text-slate-900">
                  {featured.title}
                </span>
                <span className="mt-2 block text-sm text-slate-600">{featured.metaDescription}</span>
                <span className="mt-3 block text-sm font-bold text-emerald-700">Read the article →</span>
              </span>
            </Link>
          </section>
        ) : null}

        {ebook ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
            <h2 className="text-sm font-bold uppercase tracking-wide text-amber-800">Free for members</h2>
            <Link href={WELLNESS_EBOOK_PATH} className="mx-auto mt-3 block w-40">
              {ebook.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ebook.coverUrl} alt={`${ebook.title} cover`} className="w-full rounded-lg shadow-md" />
              ) : (
                <span className="flex aspect-[3/4] items-center justify-center rounded-lg bg-emerald-700 text-5xl">📗</span>
              )}
            </Link>
            <p className="mt-3 break-words font-black text-slate-900">{ebook.title}</p>
            <Link
              href={user ? WELLNESS_EBOOK_PATH : `/login?next=${encodeURIComponent(WELLNESS_EBOOK_PATH)}`}
              className="mt-3 inline-block rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white"
            >
              {user ? "Get your free eBook" : "Register / Login to get free eBook"}
            </Link>
          </section>
        ) : null}
      </div>

      {articles.length ? (
        <section>
          <h2 className="mb-3 text-xl font-black text-slate-900">Articles</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <li key={article.slug} className="min-w-0">
                <ArticleCardLink article={article} />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          Articles are on their way — check back soon.
        </p>
      )}

      <ProductBlock products={products} title="Recommended wellness products" />
    </div>
  );
}
