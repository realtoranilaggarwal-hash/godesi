import type { Metadata } from "next";
import { searchBusinesses, listCategories, listCities } from "@/lib/businesses";
import { BusinessCard } from "@/components/BusinessCard";
import { Card, EmptyState, inputClass } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discover businesses",
  description: "Search verified small businesses by category, city and rating on Godesi.",
};

type SearchParams = {
  q?: string;
  category?: string;
  city?: string;
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

  const [results, categories, cities] = await Promise.all([
    searchBusinesses({
      q: searchParams.q?.trim() || undefined,
      category: searchParams.category || undefined,
      city: searchParams.city || undefined,
      minRating,
      premiumOnly,
    }),
    listCategories(),
    listCities(),
  ]);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Discover businesses</h1>

      <Card>
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            name="q"
            defaultValue={searchParams.q ?? ""}
            placeholder="Search by name or keyword"
            className={`${inputClass} lg:col-span-2`}
            aria-label="Search"
          />
          <select
            name="category"
            defaultValue={searchParams.category ?? ""}
            className={inputClass}
            aria-label="Category"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No businesses match your filters"
          body="Try a broader search or clear the filters."
        />
      )}
    </div>
  );
}
