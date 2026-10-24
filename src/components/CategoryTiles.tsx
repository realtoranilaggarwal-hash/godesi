import Link from "next/link";
import type { ReactNode } from "react";
import { gradientFor, softFor } from "@/lib/categories";
import { CategoryArt } from "@/components/CategoryArt";

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
  extra,
  dense = false,
}: {
  categories: TileCategory[];
  counts?: Map<string, number>;
  /** Fills the leftover cell when the categories don't divide by three. */
  extra?: ReactNode;
  /** Six to a row with trimmed bodies, for pages that list every category. */
  dense?: boolean;
}) {
  const chips = dense ? 2 : 4;

  if (dense) {
    // Slim festival-banner tiles: one gradient strip per category.
    return (
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className={`group flex items-center gap-3 rounded-2xl bg-gradient-to-r ${gradientFor(
              category.color,
            )} px-4 py-3 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
          >
            <span className="text-3xl drop-shadow" aria-hidden>
              {category.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-black leading-tight">
                {category.name}
              </span>
              <span className="block truncate text-[11px] text-white/85">
                {counts?.get(category.slug) ?? 0} listings
                {category.children.length
                  ? ` · ${category.children
                      .slice(0, 2)
                      .map((child) => child.name)
                      .join(", ")}`
                  : ""}
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold">
              Browse →
            </span>
          </Link>
        ))}
        {extra}
      </div>
    );
  }

  return (
    <div
      className={`grid items-start sm:grid-cols-2 ${
        dense ? "gap-3 lg:grid-cols-4 2xl:grid-cols-5" : "gap-4 lg:grid-cols-3"
      }`}
    >
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/categories/${category.slug}`}
          className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <CategoryArt
            slug={category.slug}
            icon={category.icon}
            className="block h-auto w-full rounded-none"
          />
          <div
            className={`flex items-center gap-3 bg-gradient-to-r ${gradientFor(category.color)} ${
              dense ? "px-3 py-2" : "px-4 py-3"
            } text-white`}
          >
            <span className={dense ? "text-xl" : "text-2xl"} aria-hidden>
              {category.icon}
            </span>
            <div className="min-w-0">
              <p
                className={`font-bold leading-tight ${dense ? "text-sm" : ""}`}
              >
                {category.name}
              </p>
              <p className="text-[11px] text-white/80">
                {counts?.get(category.slug) ?? 0} listings ·{" "}
                {category.children.length} subcategories
              </p>
            </div>
          </div>
          <div className={dense ? "p-3" : "p-4"}>
            {category.blurb && !dense ? (
              <p className="text-sm text-slate-600">{category.blurb}</p>
            ) : null}
            <div className={`flex flex-wrap gap-1.5 ${dense ? "" : "mt-3"}`}>
              {category.children.slice(0, chips).map((child) => (
                <span
                  key={child.slug}
                  className={`rounded-full border px-2 py-0.5 text-xs ${softFor(category.color)}`}
                >
                  {child.name}
                </span>
              ))}
              {category.children.length > chips ? (
                <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-500">
                  +{category.children.length - chips} more
                </span>
              ) : null}
            </div>
          </div>
        </Link>
      ))}
      {extra}
    </div>
  );
}
