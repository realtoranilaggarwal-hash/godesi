import Link from "next/link";
import type { PickerGroup } from "@/components/CategoryPicker";

/** Dropdown tree of every main category and its subcategories. */
export function CategoryTree({ groups }: { groups: PickerGroup[] }) {
  return (
    <nav
      aria-label="Categories"
      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-900">Categories 🧭</p>
        <Link
          href="/categories"
          className="text-xs font-semibold text-indigo-600"
        >
          See all
        </Link>
      </div>
      <ul className="space-y-0.5 text-sm">
        {groups.map((group) => (
          <li key={group.slug}>
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-1.5 font-semibold text-slate-800 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                <span aria-hidden>{group.icon}</span>
                <span className="min-w-0 flex-1 truncate">{group.name}</span>
                <span
                  aria-hidden
                  className="text-xs text-slate-400 transition group-open:rotate-90"
                >
                  ▶
                </span>
              </summary>
              <ul className="mb-1 ml-7 space-y-0.5 border-l border-slate-200 pl-2">
                <li>
                  <Link
                    href={`/categories/${group.slug}`}
                    className="block rounded px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                  >
                    All {group.name}
                  </Link>
                </li>
                {group.children.map((child) => (
                  <li key={child.slug}>
                    <Link
                      href={`/categories/${child.slug}`}
                      className="block truncate rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </nav>
  );
}
