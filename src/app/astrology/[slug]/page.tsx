import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ASTROLOGER_SUBCATEGORIES,
  ASTROLOGY_DISCLAIMER,
  ASTROLOGY_GUIDES,
  astrologyGuide,
} from "@/lib/astrology";
import { searchBusinesses } from "@/lib/businesses";
import { siteUrl } from "@/lib/format";
import { SidebarBanners } from "@/components/Banners";
import { Card } from "@/components/ui";
import { AstrologerList } from "@/components/AstrologerList";
import { AstrologyShop } from "@/components/AstrologyShop";
import { ShopLinkedText } from "@/components/ShopLinkedText";
import {
  DEFAULT_ASTRO_SHOP,
  astroShopItemsById,
  astroShopItemsIn,
} from "@/lib/astrologyShop";

export const revalidate = 3600;

export function generateStaticParams() {
  return ASTROLOGY_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const guide = astrologyGuide(params.slug);
  if (!guide) return { title: "Guide not found" };
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `${siteUrl()}/astrology/${guide.slug}` },
  };
}

export default async function AstrologyGuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const guide = astrologyGuide(params.slug);
  if (!guide) notFound();

  const astrologers = await searchBusinesses({
    categorySlugs: ASTROLOGER_SUBCATEGORIES,
    take: 6,
  });
  const linked = new Set<string>();
  const mentioned = astroShopItemsIn([
    ...guide.intro,
    ...guide.sections.flatMap((section) => [
      ...(section.paragraphs ?? []),
      ...(section.points ?? []),
    ]),
    ...guide.faqs.map((faq) => faq.a),
  ]);
  const shopItems = mentioned.length
    ? mentioned
    : astroShopItemsById(DEFAULT_ASTRO_SHOP);
  const others = ASTROLOGY_GUIDES.filter((row) => row.slug !== guide.slug);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.description,
      mainEntityOfPage: `${siteUrl()}/astrology/${guide.slug}`,
      publisher: { "@type": "Organization", name: "GoDesi" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
  ];

  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-3xl flex-1 space-y-5">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <section className="rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-600 to-fuchsia-600 px-5 py-8 text-white sm:px-8">
          <Link
            href="/astrology"
            className="text-xs font-semibold uppercase tracking-widest text-white/80 hover:underline"
          >
            ← Astrology guides
          </Link>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            {guide.emoji} {guide.title}
          </h1>
          {guide.intro.map((paragraph) => (
            <p key={paragraph} className="mt-3 max-w-2xl text-white/90">
              <ShopLinkedText
                text={paragraph}
                linked={linked}
                linkClassName="font-semibold text-white underline decoration-dotted underline-offset-2 hover:text-amber-200"
              />
            </p>
          ))}
        </section>

        {guide.sections.map((section) => (
          <Card key={section.heading}>
            <h2 className="text-lg font-bold">{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-2 text-sm leading-relaxed text-slate-700"
              >
                <ShopLinkedText text={paragraph} linked={linked} />
              </p>
            ))}
            {section.points ? (
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {section.points.map((point) => (
                  <li key={point}>
                    • <ShopLinkedText text={point} linked={linked} />
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>
        ))}

        <AstrologyShop items={shopItems} />

        <AstrologerList astrologers={astrologers} />

        {guide.faqs.length ? (
          <Card>
            <h2 className="text-lg font-bold">Questions people ask</h2>
            <dl className="mt-3 space-y-3">
              {guide.faqs.map((faq) => (
                <div key={faq.q}>
                  <dt className="text-sm font-bold text-slate-900">{faq.q}</dt>
                  <dd className="mt-1 text-sm text-slate-600">
                    <ShopLinkedText text={faq.a} linked={linked} />
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        ) : null}

        <Card>
          <h2 className="text-sm font-bold text-slate-700">
            More astrology guides
          </h2>
          <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            {others.map((row) => (
              <li key={row.slug}>
                <Link
                  href={`/astrology/${row.slug}`}
                  className="text-violet-700 hover:underline"
                >
                  {row.emoji} {row.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">{ASTROLOGY_DISCLAIMER}</p>
        </Card>
      </div>
      <SidebarBanners />
    </div>
  );
}
