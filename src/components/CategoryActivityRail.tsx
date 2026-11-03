import { ActivityWall } from "@/components/ActivityWall";

/**
 * Under every category: the GoDesi live wall (who joined, what was posted),
 * plus the category's own RSS feed so other sites can pull its listings.
 */
export function CategoryActivityRail({
  categorySlug,
  categoryName,
}: {
  categorySlug: string;
  categoryName: string;
}) {
  return (
    <div className="space-y-2">
      <ActivityWall heading="Happening on GoDesi" />
      <p className="text-xs text-slate-500">
        <a
          href={`/categories/${categorySlug}/rss.xml`}
          className="mr-1 rounded-lg bg-orange-500 px-2 py-0.5 font-semibold text-white hover:bg-orange-600"
        >
          📡 RSS feed
        </a>
        lists the newest {categoryName.toLowerCase()} listings on GoDesi and
        links back to each card.
      </p>
    </div>
  );
}
