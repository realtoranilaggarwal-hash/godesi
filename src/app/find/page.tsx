import type { Metadata } from "next";
import Link from "next/link";
import { siteSearch, type SiteSearchHit } from "@/lib/siteSearch";
import { Card, EmptyState, inputClass } from "@/components/ui";
import { SidebarBanners } from "@/components/Banners";
import { gradientFor } from "@/lib/categories";
import { siteUrl } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search Godesi — businesses, events, rentals, temples and more",
  description:
    "One search across every Godesi listing: businesses and professionals, wedding vendors, events, property and rooms, items for sale, temples and open requirements.",
  alternates: { canonical: `${siteUrl()}/find` },
};

const SUGGESTIONS = [
  "top contributors",
  "photographer",
  "caterer",
  "attorney",
  "tutor",
  "accountant",
  "makeup artist",
  "pandit",
  "used car",
];

function Group({ title, hits }: { title: string; hits: SiteSearchHit[] }) {
  if (!hits.length) return null;
  return (
    <Card>
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      <ul className="mt-2 divide-y divide-slate-100">
        {hits.map((hit) => (
          <li key={`${hit.badge}-${hit.href}-${hit.title}`} className="py-2">
            <Link
              href={hit.href}
              className="font-semibold text-slate-900 hover:text-indigo-600"
            >
              {hit.title}
            </Link>
            <p className="text-sm text-slate-500">{hit.subtitle}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default async function FindPage({
  searchParams,
}: {
  searchParams: { q?: string; city?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const results = await siteSearch(q, searchParams.city);

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-4">
        <section
          className={`rounded-3xl bg-gradient-to-r ${gradientFor("indigo")} px-5 py-7 text-white sm:px-8`}
        >
          <h1 className="text-3xl font-black">Search Godesi 🔍</h1>
          <p className="mt-1 text-white/90">
            Businesses, wedding vendors, events, property, rooms, items, temples and
            open requirements — all in one place.
          </p>
        </section>

        <Card>
          <form className="grid gap-3 sm:grid-cols-[1fr_200px_auto]">
            <input
              name="q"
              defaultValue={q}
              placeholder="What are you looking for? e.g. photographer"
              className={inputClass}
              aria-label="Search Godesi"
            />
            <input
              name="city"
              defaultValue={searchParams.city ?? ""}
              placeholder="City (optional)"
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
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((item) => (
              <Link
                key={item}
                href={`/find?q=${encodeURIComponent(item)}`}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                {item}
              </Link>
            ))}
          </div>
        </Card>

        {q.length < 2 ? (
          <EmptyState title="Type at least two letters to search everything on Godesi." />
        ) : results.total === 0 ? (
          <EmptyState
            title={`Nothing found for “${q}”.`}
            body="Try a shorter word, drop the city, or browse the categories."
          />
        ) : (
          <>
            <p className="text-sm text-slate-500">
              {results.total} result{results.total === 1 ? "" : "s"} for “{q}”
            </p>
            <Group title="Godesi pages" hits={results.pages} />
            <Group title="Businesses & professionals" hits={results.businesses} />
            <Group title="Events" hits={results.events} />
            <Group title="Property, rooms & items" hits={results.listings} />
            <Group title="Temples & places of worship" hits={results.worship} />
            <Group title="Open requirements" hits={results.leads} />
            <Group title="Categories" hits={results.categories} />
            <Group title="Recommended links" hits={results.resources} />
          </>
        )}
      </div>

      <aside className="hidden w-[300px] shrink-0 space-y-4 lg:block">
        <SidebarBanners />
      </aside>
    </div>
  );
}
