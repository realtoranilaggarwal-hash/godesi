import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { GUIDES, guideBySlug } from "@/lib/guides";
import { searchBusinesses } from "@/lib/businesses";
import { getCategory } from "@/lib/directory";
import { citySlug } from "@/lib/citySlug";
import { siteUrl } from "@/lib/format";
import { resultsAreThin, robotsFor } from "@/lib/thinContent";
import { BusinessCard } from "@/components/BusinessCard";
import { Card } from "@/components/ui";

export const revalidate = 3600;

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

async function loadGuide(slug: string) {
  const guide = guideBySlug(slug);
  if (!guide) return null;
  const [perCity, category, events] = await Promise.all([
    Promise.all(
      guide.cities.map((city) =>
        searchBusinesses(
          guide.subcategories.length
            ? { categorySlugs: guide.subcategories, city, take: 200 }
            : { category: guide.category, city, take: 200 },
        ),
      ),
    ),
    getCategory(guide.category),
    db.event.findMany({
      where: {
        status: "APPROVED",
        startsAt: { gte: new Date() },
        OR: guide.cities.map((city) => ({
          city: { contains: city, mode: "insensitive" as const },
        })),
      },
      orderBy: { startsAt: "asc" },
      take: 6,
      select: { slug: true, title: true, startsAt: true, venue: true },
    }),
  ]);
  const seen = new Set<string>();
  const businesses = perCity
    .flat()
    .filter((row) => (seen.has(row.id) ? false : (seen.add(row.id), true)));
  return { guide, businesses, category, events };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = await loadGuide(params.slug);
  if (!data) return { title: "Guide not found" };
  const { guide, businesses } = data;
  return {
    title: `${guide.title} — ${businesses.length} listed`,
    description: guide.description,
    robots: robotsFor(resultsAreThin(businesses.length)),
    alternates: { canonical: `${siteUrl()}/guide/${guide.slug}` },
  };
}

export default async function GuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await loadGuide(params.slug);
  if (!data) notFound();
  const { guide, businesses, category, events } = data;
  const base = siteUrl();
  const claimed = businesses.filter((row) => row.description || row.logoUrl);
  const rest = businesses.filter((row) => !claimed.includes(row));

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: guide.title,
      numberOfItems: businesses.length,
      itemListElement: businesses.slice(0, 50).map((row, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: row.name,
        url: `${base}/b/${row.slug}`,
      })),
    },
  ];

  return (
    <div className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Card className="bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white">
        <p className="text-xs font-bold uppercase tracking-wide text-white/80">
          {category?.name ?? guide.category} · {guide.cityLabel}
        </p>
        <h1 className="mt-1 text-2xl font-black md:text-3xl">{guide.title}</h1>
        <p className="mt-2 text-sm text-white/90">
          {businesses.length} listed on GoDesi
          {claimed.length ? ` · ${claimed.length} with photos or details` : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold">
          <Link
            href="/add-business"
            className="rounded-xl bg-white px-3 py-2 text-indigo-700"
          >
            List your business free
          </Link>
          <Link
            href={`/city/${citySlug(guide.cityLabel)}`}
            className="rounded-xl border border-white/40 px-3 py-2"
          >
            Everything desi in {guide.cityLabel}
          </Link>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <section className="space-y-3 text-[15px] leading-relaxed text-slate-700">
            {guide.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>

          {claimed.length ? (
            <section>
              <h2 className="mb-3 text-lg font-black">
                With photos and details
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {claimed.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="mb-3 text-lg font-black">
              All {businesses.length} listings
            </h2>
            <p className="mb-3 text-sm text-slate-500">
              Name, area and phone from public records. Own one of these? Claim
              the card to add photos, hours, prices and WhatsApp — free.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {rest.map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  variant="compact"
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-black">Common questions</h2>
            <div className="space-y-3">
              {guide.faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <summary className="cursor-pointer font-bold">
                    {faq.q}
                  </summary>
                  <p className="mt-2 text-sm text-slate-700">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <Card>
            <h2 className="font-black">Before you call</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-700">
              {guide.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </Card>
          {events.length ? (
            <Card>
              <h2 className="font-black">Coming up in {guide.cityLabel}</h2>
              <ul className="mt-2 space-y-2 text-sm">
                {events.map((event) => (
                  <li key={event.slug}>
                    <Link
                      href={`/events/${event.slug}`}
                      className="font-semibold text-indigo-700 hover:underline"
                    >
                      {event.title}
                    </Link>
                    <div className="text-xs text-slate-500">
                      {event.startsAt.toDateString()} · {event.venue}
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/events"
                className="mt-3 inline-block text-sm font-bold text-indigo-700"
              >
                All events →
              </Link>
            </Card>
          ) : null}
          <Card>
            <h2 className="font-black">More guides</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {GUIDES.filter((other) => other.slug !== guide.slug).map(
                (other) => (
                  <li key={other.slug}>
                    <Link
                      href={`/guide/${other.slug}`}
                      className="text-indigo-700 hover:underline"
                    >
                      {other.title}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}
