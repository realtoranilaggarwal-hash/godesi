import Link from "next/link";
import { Card, inputClass } from "@/components/ui";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type CategoryOption = { slug: string; icon: string | null; name: string };

/**
 * Compact "find a card" strip — search box + A–Z browse that lands on /search.
 * Sits at the top of /b profiles so visitors can hop to another business.
 */
export function CardSearchStrip({
  categories,
}: {
  categories: CategoryOption[];
}) {
  return (
    <Card>
      <form
        action="/search"
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <input
          name="q"
          placeholder="Search cards by name or keyword"
          className={`${inputClass} sm:flex-1`}
          aria-label="Search cards"
        />
        <select
          name="category"
          defaultValue=""
          className={`${inputClass} sm:w-56`}
          aria-label="Category"
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.icon} {item.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Search
        </button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-1">
        <Link
          href="/search"
          className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          All
        </Link>
        {LETTERS.map((letter) => (
          <Link
            key={letter}
            href={`/search?letter=${letter}`}
            className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            {letter}
          </Link>
        ))}
      </div>
    </Card>
  );
}
