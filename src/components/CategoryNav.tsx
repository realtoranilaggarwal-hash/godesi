import Link from "next/link";
import { getCategoryTree } from "@/lib/directory";
import { softFor } from "@/lib/categories";
import { Card } from "@/components/ui";
import { CategoryPicker, type PickerGroup } from "@/components/CategoryPicker";

/** Shared shape for the sidebar rail and the menu button. */
export async function categoryPickerGroups(): Promise<PickerGroup[]> {
  const categories = await getCategoryTree();
  return categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    icon: category.icon,
    className: softFor(category.color),
    children: category.children.map((child) => ({
      slug: child.slug,
      name: child.name,
    })),
  }));
}

/** The side-rail picker: short links to the main categories plus the full tree. */
export async function CategoryNav({ quickCount = 8 }: { quickCount?: number }) {
  const groups = await categoryPickerGroups();
  if (!groups.length) return null;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">Browse categories 🧭</h2>
        <Link
          href="/categories"
          className="text-xs font-semibold text-indigo-600"
        >
          See all
        </Link>
      </div>
      <div className="mt-3">
        <CategoryPicker groups={groups} quickCount={quickCount} />
      </div>
    </Card>
  );
}
