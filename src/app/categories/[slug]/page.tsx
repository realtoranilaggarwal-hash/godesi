import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCategory, categoryScopeSlugs } from "@/lib/directory";
import { searchBusinesses } from "@/lib/businesses";
import { gradientFor, softFor } from "@/lib/categories";
import { BusinessCard } from "@/components/BusinessCard";
import { EventCard } from "@/components/EventCard";
import { SidebarBanners } from "@/components/Banners";
import { Card, EmptyState, inputClass } from "@/components/ui";
import { siteUrl } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await getCategory(params.slug);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.name} in India — Godesi directory`,
    description:
      category.blurb ??
      `Find trusted ${category.name.toLowerCase()} businesses near you on Godesi.`,
    alternates: { canonical: `${siteUrl()}/categories/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { city?: string; q?: string };
}) {
  const category = await getCategory(params.slug);
  if (!category) notFound();

  const scope = categoryScopeSlugs(category);
  const [businesses, events] = await Promise.all([
    searchBusinesses({ categorySlugs: scope, city: searchParams.city, q: searchParams.q }),
    db.event.findMany({
      where: { status: "APPROVED", startsAt: { gte: new Date() }, categorySlug: { in: scope } },
      orderBy: { startsAt: "asc" },
      take: 3,
      include: { category: { select: { name: true, icon: true, color: true } } },
    }),
  ]);

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <section
          className={`rounded-3xl bg-gradient-to-r ${gradientFor(category.color)} px-5 py-8 text-white sm:px-8`}
        >
          <p className="text-sm text-white/80">
            <Link href="/categories" className="hover:underline">
              All categories
            </Link>
            {category.parent ? (
              <>
                {" / "}
                <Link href={`/categories/${category.parent.slug}`} className="hover:underline">
                  {category.parent.name}
                </Link>
              </>
            ) : null}
          </p>
          <h1 className="mt-1 text-3xl font-black">
            <span aria-hidden>{category.icon}</span> {category.name}
          </h1>
          {category.blurb ? <p className="mt-1 text-white/90">{category.blurb}</p> : null}
        </section>

        {category.children.length ? (
          <section>
            <h2 className="mb-2 text-lg font-bold">Browse subcategories</h2>
            <div className="flex flex-wrap gap-2">
              {category.children.map((child) => (
                <Link
                  key={child.slug}
                  href={`/categories/${child.slug}`}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition hover:shadow-sm ${softFor(category.color)}`}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <Card>
          <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              name="q"
              defaultValue={searchParams.q ?? ""}
              placeholder={`Search in ${category.name}`}
              className={inputClass}
              aria-label="Search"
            />
            <input
              name="city"
              defaultValue={searchParams.city ?? ""}
              placeholder="City"
              className={inputClass}
              aria-label="City"
            />
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Search
            </button>
          </form>
        </Card>

        <section>
          <h2 className="mb-3 text-lg font-bold">
            {businesses.length} listing{businesses.length === 1 ? "" : "s"}
          </h2>
          {businesses.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No listings here yet"
              body="Be the first business in this category — creating a card is free."
            />
          )}
        </section>

        {events.length ? (
          <section>
            <h2 className="mb-3 text-lg font-bold">Upcoming {category.name} events</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <SidebarBanners />
    </div>
  );
}
