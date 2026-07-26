import Link from "next/link";
import { gradientFor, softFor } from "@/lib/categories";

export type TileCategory = {
  slug: string;
  name: string;
  icon: string;
  color: string;
  blurb: string | null;
  children: { slug: string; name: string }[];
};

export function CategoryTiles({
  categories,
  counts,
}: {
  categories: TileCategory[];
  counts?: Map<string, number>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/categories/${category.slug}`}
          className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div
            className={`flex items-center gap-3 bg-gradient-to-r ${gradientFor(category.color)} px-4 py-3 text-white`}
          >
            <span className="text-2xl" aria-hidden>
              {category.icon}
            </span>
            <div>
              <p className="font-bold leading-tight">{category.name}</p>
              <p className="text-xs text-white/80">
                {counts?.get(category.slug) ?? 0} listings ·{" "}
                {category.children.length} subcategories
              </p>
            </div>
          </div>
          <div className="p-4">
            {category.blurb ? (
              <p className="text-sm text-slate-600">{category.blurb}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {category.children.slice(0, 4).map((child) => (
                <span
                  key={child.slug}
                  className={`rounded-full border px-2 py-0.5 text-xs ${softFor(category.color)}`}
                >
                  {child.name}
                </span>
              ))}
              {category.children.length > 4 ? (
                <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-500">
                  +{category.children.length - 4} more
                </span>
              ) : null}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
