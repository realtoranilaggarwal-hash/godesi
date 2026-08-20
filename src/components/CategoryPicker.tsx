"use client";

import { useState } from "react";
import Link from "next/link";

export type PickerChild = { slug: string; name: string };
export type PickerGroup = {
  slug: string;
  name: string;
  icon: string;
  /** Tailwind classes for the pill, worked out on the server from the colour. */
  className: string;
  children: PickerChild[];
};

/**
 * Short links to the main categories, with the whole taxonomy behind one
 * toggle: each category opens into its subcategories so a visitor can walk down
 * the tree and pick, instead of scrolling a wall of chips.
 */
export function CategoryPicker({
  groups,
  quickCount = 8,
  label = "All categories",
  onNavigate,
}: {
  groups: PickerGroup[];
  /** How many categories to show as short links before the tree opens. */
  quickCount?: number;
  label?: string;
  onNavigate?: () => void;
}) {
  const [openTree, setOpenTree] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  if (!groups.length) return null;

  return (
    <div>
      <ul className="flex flex-wrap gap-1.5 empty:hidden">
        {groups.slice(0, quickCount).map((group) => (
          <li key={group.slug}>
            <Link
              href={`/categories/${group.slug}`}
              onClick={onNavigate}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${group.className}`}
            >
              <span aria-hidden>{group.icon}</span>
              {group.name}
            </Link>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setOpenTree((value) => !value)}
        aria-expanded={openTree}
        className="mt-2 flex w-full items-center justify-between rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
      >
        {label}
        <span aria-hidden>{openTree ? "▴" : "▾"}</span>
      </button>

      {openTree ? (
        <ul className="mt-1 max-h-[60vh] space-y-0.5 overflow-y-auto pr-1">
          {groups.map((group) => {
            const open = openGroup === group.slug;
            return (
              <li key={group.slug}>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/categories/${group.slug}`}
                    onClick={onNavigate}
                    className="min-w-0 flex-1 truncate rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                  >
                    <span aria-hidden className="mr-1">
                      {group.icon}
                    </span>
                    {group.name}
                  </Link>
                  {group.children.length ? (
                    <button
                      type="button"
                      onClick={() => setOpenGroup(open ? null : group.slug)}
                      aria-expanded={open}
                      aria-label={`${open ? "Hide" : "Show"} ${group.name} subcategories`}
                      className="rounded-lg px-2 py-1 text-[11px] font-bold text-slate-400 hover:bg-slate-50 hover:text-indigo-600"
                    >
                      {open ? "▴" : "▾"}
                    </button>
                  ) : null}
                </div>

                {open && group.children.length ? (
                  <ul className="ml-3 border-l border-slate-200 pl-2">
                    {group.children.map((child) => (
                      <li key={child.slug}>
                        <Link
                          href={`/categories/${child.slug}`}
                          onClick={onNavigate}
                          className="block truncate rounded-lg px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
