import Link from "next/link";
import { wallItems } from "@/lib/wall";

/**
 * The scrolling strip under the header: who just joined and what's new on
 * Godesi (members, business cards, listings, events, member reports).
 */
export async function SiteTicker() {
  const happenings = (await wallItems(12)).filter(
    (item) => !item.external && item.kind !== "social",
  );

  if (!happenings.length) return null;

  const items = happenings.map((item) => (
    <Link
      key={item.id}
      href={item.href}
      className="whitespace-nowrap text-slate-600 hover:text-indigo-600"
    >
      {item.icon}{" "}
      <span className="font-semibold text-slate-800">{item.title}</span>{" "}
      {item.text}
    </Link>
  ));

  return (
    <div className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-3 px-4">
        <span className="hidden shrink-0 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white sm:inline">
          what&apos;s new
        </span>
        <div className="ticker-window min-w-0 flex-1 py-1.5">
          <div
            className="ticker-track flex items-center gap-6 text-xs"
            /* Roughly four seconds per item, so a short strip is not glacial
               and a long one is still readable. */
            style={{ animationDuration: `${Math.max(30, items.length * 4)}s` }}
          >
            {items}
            {/* Repeated once so the loop has no visible gap. */}
            {items.map((item, index) => (
              <span key={`repeat-${index}`} aria-hidden>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
