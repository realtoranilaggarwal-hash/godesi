import Link from "next/link";
import { dollarRates, tickerHeadlines } from "@/lib/ticker";

/**
 * The scrolling strip under the header: today's dollar rates for the countries
 * our members send money to, then the latest Godesi headlines. Both come from
 * free sources — daily reference rates and our own news wall — so there is no
 * market data bill and nothing here claims to be a live dealing price.
 */
export async function SiteTicker() {
  const [{ rates, asOf }, headlines] = await Promise.all([
    dollarRates(),
    tickerHeadlines(8),
  ]);

  if (!rates.length && !headlines.length) return null;

  const items = [
    ...rates.map((rate) => (
      <span key={`fx-${rate.code}`} className="whitespace-nowrap">
        <span className="font-semibold text-slate-900">$1</span> ={" "}
        <span className="font-semibold text-emerald-700">
          {rate.perDollar.toLocaleString(undefined, {
            maximumFractionDigits: rate.perDollar > 10 ? 2 : 4,
          })}
        </span>{" "}
        {rate.code}
        <span className="text-slate-400"> · {rate.label}</span>
      </span>
    )),
    ...headlines.map((headline) => (
      <Link
        key={headline.href}
        href={headline.href}
        className="whitespace-nowrap font-medium text-slate-700 hover:text-indigo-600"
      >
        📰 {headline.title}
      </Link>
    )),
  ];

  return (
    <div className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4">
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
        <a
          href="https://www.exchangerate-api.com"
          target="_blank"
          rel="noreferrer"
          title={
            asOf
              ? `Reference rates, updated ${asOf}. Not a live dealing price.`
              : "Daily reference rates"
          }
          className="hidden shrink-0 text-[10px] text-slate-400 hover:text-slate-600 sm:block"
        >
          rates: exchangerate-api
        </a>
      </div>
    </div>
  );
}
