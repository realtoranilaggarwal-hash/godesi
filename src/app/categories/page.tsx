import type { Metadata } from "next";
import { getCategoryCounts, getCategoryTree } from "@/lib/directory";
import { CategoryTiles } from "@/components/CategoryTiles";
import { SidebarBanners } from "@/components/Banners";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "All categories",
  description:
    "Home services, education, real estate, beauty, weddings, catering, travel, religious services, jobs and more.",
};

export default async function CategoriesPage() {
  const [categories, counts] = await Promise.all([getCategoryTree(), getCategoryCounts()]);

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <div>
          <h1 className="text-3xl font-black">Every category on Godesi</h1>
          <p className="text-slate-600">
            {categories.length} categories ·{" "}
            {categories.reduce((sum, item) => sum + item.children.length, 0)} subcategories
          </p>
        </div>
        <CategoryTiles categories={categories} counts={counts} />
      </div>
      <SidebarBanners />
    </div>
  );
}
