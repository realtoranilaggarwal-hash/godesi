import type { Metadata } from "next";
import { searchBusinesses, listCities, listCountries } from "@/lib/businesses";
import { FeaturedStrip } from "@/components/FeaturedStrip";
import { getCategoryTree } from "@/lib/directory";
import { BusinessCard } from "@/components/BusinessCard";
import {
  InContentBanner,
  InlineBanner,
  SidebarBanners,
} from "@/components/Banners";
import { Card, EmptyState, inputClass } from "@/components/ui";
import { gradientFor } from "@/lib/categories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search desi businesses near you",
  description:
    "Search verified desi small businesses by category, subcategory, city and rating. See photos, opening hours and reviews, and message the owner on WhatsApp free.",
};

type SearchParams = {
  q?: string;
  category?: string;
  sub?: string;
  city?: string;
  country?: string;
  minRating?: string;
  premium?: string;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const minRating = Number(searchParams.minRating ?? 0) || 0;
  const premiumOnly = searchParams.premium === "1";
  const categories = await getCategoryTree();

  const selected = categories.find(
    (item) => item.slug === searchParams.category,
  );
  const categorySlugs = searchParams.sub
    ? [searchParams.sub]
    : selected
      ? [selected.slug, ...selected.children.map((child) => child.slug)]
      : undefined;

  const [results, cities, countries] = await Promise.all([
    searchBusinesses({
      q: searchParams.q?.trim() || undefined,
      categorySlugs,
      city: searchParams.city || undefined,
      country: searchParams.country || undefined,
      minRating,
      premiumOnly,
    }),
    listCities(),
    listCountries(),
  ]);

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <section
          className={`rounded-3xl bg-gradient-to-r ${gradientFor("emerald")} px-5 py-7 text-white sm:px-8`}
        >
          <h1 className="text-3xl font-black">Businesses 🏪</h1>
          <p className="mt-1 text-white/90">
            {categories.length} categories of verified desi businesses — filter
            by subcategory, city and rating.
          </p>
        </section>

        <FeaturedStrip categorySlugs={categorySlugs} />

        <Card>
          <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input
              name="q"
              defaultValue={searchParams.q ?? ""}
              placeholder="Search by name or keyword"
              className={inputClass}
              aria-label="Search"
            />
            <select
              name="category"
              defaultValue={searchParams.category ?? ""}
              className={inputClass}
              aria-label="Category"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.icon} {item.name}
                </option>
              ))}
            </select>
            <select
              name="sub"
              defaultValue={searchParams.sub ?? ""}
              className={inputClass}
              aria-label="Subcategory"
            >
              <option value="">All subcategories</option>
              {categories.map((item) => (
                <optgroup key={item.slug} label={item.name}>
                  {item.children.map((child) => (
                    <option key={child.slug} value={child.slug}>
                      {child.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <select
              name="city"
              defaultValue={searchParams.city ?? ""}
              className={inputClass}
              aria-label="City"
            >
              <option value="">All cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              name="country"
              defaultValue={searchParams.country ?? ""}
              className={inputClass}
              aria-label="Country"
            >
              <option value="">All countries</option>
              {countries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              name="minRating"
              defaultValue={searchParams.minRating ?? "0"}
              className={inputClass}
              aria-label="Minimum rating"
            >
              <option value="0">Any rating</option>
              <option value="3">3★ &amp; up</option>
              <option value="4">4★ &amp; up</option>
              <option value="4.5">4.5★ &amp; up</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="premium"
                value="1"
                defaultChecked={premiumOnly}
                className="h-4 w-4 rounded border-slate-300"
              />
              Premium / Pro members only
            </label>

            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 sm:col-span-2 lg:col-span-1"
            >
              Apply filters
            </button>
          </form>
        </Card>

        <p className="text-sm text-slate-500">
          {results.length} business{results.length === 1 ? "" : "es"} found
        </p>

        {results.length ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.slice(0, 6).map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
            {results.length > 6 ? (
              <>
                <InContentBanner />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {results.slice(6).map((business) => (
                    <BusinessCard key={business.id} business={business} />
                  ))}
                </div>
              </>
            ) : null}
          </>
        ) : (
          <EmptyState
            title="No businesses match your filters"
            body="Try a broader search or clear the filters."
          />
        )}
        <InlineBanner />
      </div>

      <SidebarBanners />
    </div>
  );
}
