/** Temu Black Friday affiliate collections; the box hides itself after Cyber Monday. */
const ENDS = new Date("2026-12-01T05:00:00Z");

const PICKS = [
  { label: "Best Sellers", href: "https://temu.to/k/p655yfxxokq" },
  {
    label: "Lowest Price in last 30 days",
    href: "https://temu.to/k/p5vn344tcf8",
  },
  { label: "Trusted Brand Choices", href: "https://temu.to/k/pbofd2sx4tm" },
];

export function TemuPicks() {
  if (Date.now() >= ENDS.getTime()) return null;
  return (
    <section className="space-y-2 rounded-2xl border border-orange-300 bg-orange-50 p-4">
      <p className="flex items-center justify-between gap-2">
        <span className="font-bold text-orange-900">
          🛍️ Temu Black Friday picks
        </span>
        <span className="text-[10px] uppercase tracking-wide text-slate-500">
          Ad · paid links
        </span>
      </p>
      <p className="text-sm text-slate-700">
        Explore a collection and claim your $200 coupon bundle in the TEMU app.
      </p>
      <div className="flex flex-wrap gap-2">
        {PICKS.map((pick) => (
          <a
            key={pick.href}
            href={pick.href}
            target="_blank"
            rel="noopener noreferrer sponsored nofollow"
            className="rounded-full border border-orange-400 bg-white px-3 py-1.5 text-sm font-semibold text-orange-800 hover:bg-orange-100"
          >
            {pick.label} →
          </a>
        ))}
      </div>
      <p className="text-[11px] text-slate-500">
        Only for app users with qualifying orders. T&amp;Cs apply.
      </p>
    </section>
  );
}
