/**
 * "Post here — get seen everywhere" marquee for the journalists page. Every
 * approved member story is pushed out through godesi.com/news-sitemap.xml
 * (the feed Google News reads) and /news/rss.xml (the feed every news
 * reader and aggregator subscribes to), so the outlets below are real
 * channels, not decoration.
 */
const OUTLETS = [
  { name: "Google News", style: "bg-white text-blue-600 border-slate-200" },
  { name: "Bing News", style: "bg-white text-teal-600 border-slate-200" },
  { name: "Yahoo News", style: "bg-white text-violet-700 border-slate-200" },
  { name: "Feedly", style: "bg-white text-emerald-600 border-slate-200" },
  { name: "Inoreader", style: "bg-white text-sky-600 border-slate-200" },
  { name: "Flipboard", style: "bg-white text-red-600 border-slate-200" },
  { name: "Google Search", style: "bg-white text-slate-700 border-slate-200" },
  { name: "Every RSS reader", style: "bg-white text-orange-600 border-slate-200" },
];

export function NewsMediaStrip() {
  const chips = OUTLETS.map((outlet) => (
    <span
      key={outlet.name}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-bold shadow-sm ${outlet.style}`}
    >
      {outlet.name}
    </span>
  ));

  return (
    <section className="overflow-hidden rounded-3xl bg-slate-900 py-5 text-white">
      <p className="px-5 text-center text-xs font-bold uppercase tracking-widest text-amber-300 sm:text-sm">
        📡 Post on Godesi — your story is syndicated to news readers everywhere
      </p>
      <div className="ticker-window mt-4">
        <div className="ticker-track flex items-center gap-3" style={{ animationDuration: "28s" }}>
          <div className="flex items-center gap-3 pr-3">{chips}</div>
          <div className="flex items-center gap-3 pr-3" aria-hidden>
            {chips}
          </div>
        </div>
      </div>
      <p className="mt-3 px-5 text-center text-[11px] text-slate-400">
        Approved stories ship in the Google News sitemap and the public RSS
        feed — the exact files news apps and search engines subscribe to.
      </p>
    </section>
  );
}
