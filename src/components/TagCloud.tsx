import Link from "next/link";
import { tagCloud } from "@/lib/resources";

/** Bigger, bolder chips mean more links and events filed under that tag. */
function sizeFor(count: number, max: number) {
  const share = max > 1 ? (count - 1) / (max - 1) : 0;
  if (share > 0.75) return "text-base font-black";
  if (share > 0.5) return "text-sm font-bold";
  if (share > 0.25) return "text-sm font-semibold";
  return "text-xs font-semibold";
}

export async function TagCloud({ active }: { active?: string }) {
  const tags = await tagCloud();
  if (!tags.length) return null;
  const max = tags[0].count;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-base font-bold">Browse by tag</h2>
        {active ? (
          <Link
            href="/resources"
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            Clear
          </Link>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map(({ tag, count }) => {
          const selected = active === tag;
          return (
            <Link
              key={tag}
              href={`/resources?tag=${encodeURIComponent(tag)}`}
              title={`${count} item${count === 1 ? "" : "s"} tagged ${tag}`}
              className={`rounded-full border px-3 py-1 ${sizeFor(count, max)} ${
                selected
                  ? "border-transparent bg-gradient-to-r from-orange-500 to-rose-500 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
            >
              #{tag}
              <span className="ml-1 text-[10px] opacity-70">{count}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
