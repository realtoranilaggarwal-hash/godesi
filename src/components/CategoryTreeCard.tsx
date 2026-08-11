import Link from "next/link";
import { getCategoryTree } from "@/lib/directory";
import { softFor } from "@/lib/categories";
import { Card } from "@/components/ui";

/** Compact category tree for side rails: top categories with their subcategories. */
export async function CategoryTreeCard({ limit = 8 }: { limit?: number }) {
  const categories = await getCategoryTree();
  if (!categories.length) return null;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">Browse categories 🧭</h2>
        <Link href="/categories" className="text-xs font-semibold text-indigo-600">
          All
        </Link>
      </div>
      <ul className="mt-3 space-y-3">
        {categories.slice(0, limit).map((category) => (
          <li key={category.slug}>
            <Link
              href={`/categories/${category.slug}`}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-bold ${softFor(category.color)}`}
            >
              <span aria-hidden>{category.icon}</span>
              {category.name}
            </Link>
            {category.children.length ? (
              <p className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 pl-1 text-xs text-slate-500">
                {category.children.slice(0, 6).map((child) => (
                  <Link
                    key={child.slug}
                    href={`/categories/${child.slug}`}
                    className="hover:text-indigo-600"
                  >
                    {child.name}
                  </Link>
                ))}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </Card>
  );
}
