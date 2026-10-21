import Link from "next/link";
import { tickerHeadlines } from "@/lib/ticker";

/**
 * The scrolling strip under the header: the latest Godesi headlines. Dollar
 * rates used to ride along here; they moved to the markets box on the
 * homepage, so this stays news-only.
 */
export async function SiteTicker() {
  const headlines = await tickerHeadlines(8);

  if (!headlines.length) return null;

  const items = headlines.map((headline) => (
    <Link
      key={headline.href}
      href={headline.href}
      className="whitespace-nowrap font-medium text-slate-700 hover:text-indigo-600"
    >
      📰 {headline.title}
    </Link>
  ));

  return (
    <div className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-3 px-4">
        <span className="hidden shrink-0 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white sm:inline">
          today
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
