import Link from "next/link";
import type { ReactNode } from "react";
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

  return (
    <div
      className={`grid sm:grid-cols-2 lg:grid-cols-3 ${
        dense ? "gap-3 xl:grid-cols-6" : "gap-4"
      }`}
    >
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/categories/${category.slug}`}
          className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
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
