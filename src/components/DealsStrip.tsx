import Link from "next/link";
import { dealDetails, cachedLiveDeals } from "@/lib/deals";
import { CopyButton } from "@/components/CopyButton";
import { LogoTile } from "@/components/LogoTile";
import { expiryLabel } from "@/lib/dealFormat";

/** The newest business offers, with a way into /deals and to post one. */
export async function DealsStrip() {
  const deals = await cachedLiveDeals({ take: 4 });
  if (!deals.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-xl font-bold">🏷️ Deals from desi businesses</h2>
        <div className="flex gap-3 text-sm font-semibold">
          <Link
            href="/dashboard/deals"
            className="text-slate-600 hover:underline"
          >
            Post a deal
          </Link>
          <Link href="/deals" className="text-indigo-600 hover:underline">
            All deals →
          </Link>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="flex min-w-0 items-center gap-3 overflow-hidden rounded-xl border border-dashed border-rose-300 bg-rose-50/60 px-3 py-2"
          >
            <LogoTile
              name={deal.business.name}
              icon={deal.business.categoryRef?.icon}
              imageUrl={deal.business.logoUrl}
              categorySlug={deal.business.categorySlug}
              className="h-9 w-9 shrink-0"
              emojiClassName="text-lg"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-rose-900">
                🏷️ {deal.title}
              </p>
              <p className="truncate text-xs text-slate-600">
                <Link
                  href={`/business/${deal.business.slug}`}
                  className="font-semibold hover:text-indigo-700"
                >
                  {deal.business.name}
                </Link>
                {dealDetails(deal) ? ` · ${dealDetails(deal)}` : ""}
                {deal.expiresAt ? ` · ${expiryLabel(deal.expiresAt)}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-xs font-semibold">
              {deal.code ? (
                <span className="hidden items-center gap-1 rounded-md border border-rose-300 bg-white px-2 py-0.5 font-mono font-bold tracking-wider text-rose-800 sm:inline-flex">
                  {deal.code}
                  <CopyButton value={deal.code} />
                </span>
              ) : null}
              {deal.linkUrl ? (
                <a
                  href={deal.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-700 hover:underline"
                >
                  Claim →
                </a>
              ) : null}
            </div>
          </div>
        ))}
        {Array.from({ length: Math.max(0, 4 - deals.length) }).map((_, i) => (
          <Link
            key={`fill-${i}`}
            href="/dashboard/deals"
            className="flex min-w-0 items-center gap-3 overflow-hidden rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm font-semibold text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600"
          >
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg"
            >
              🏷️
            </span>
            Your deal here — post it free →
          </Link>
        ))}
      </div>
    </section>
  );
}
