import Link from "next/link";
import { dealDetails } from "@/lib/deals";
import { cachedDealOfTheDay } from "@/lib/dealOfTheDay";
import { DealCard } from "@/components/DealCard";
import { StoreOfferCard } from "@/components/StoreOfferCard";
import { CopyButton } from "@/components/CopyButton";
import { getCurrentUser } from "@/lib/auth";
import { optionalRead } from "@/lib/resilient";

/** Today's one business deal and one store coupon, changing at midnight New York time. */
export async function DealOfTheDay() {
  const { deal, offer } = await cachedDealOfTheDay();
  if (!deal && !offer) return null;

  return (
    <section className="space-y-3 rounded-3xl border border-emerald-200 bg-emerald-50/60 p-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-xl font-bold">⏰ Deal of the day</h2>
        <Link
          href="/deals"
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          All deals →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {deal ? (
          <DealCard
            title={deal.title}
            details={dealDetails(deal)}
            code={deal.code}
            linkUrl={deal.linkUrl}
            expiresAt={deal.expiresAt}
            business={{
              slug: deal.business.slug,
              name: deal.business.name,
              city: deal.business.city,
              logoUrl: deal.business.logoUrl,
              icon: deal.business.categoryRef?.icon,
              line:
                deal.business.subcategoryRef?.name ??
                deal.business.categoryRef?.name,
            }}
          />
        ) : null}
        {offer ? <StoreOfferCard offer={offer} /> : null}
      </div>
      <p className="text-xs text-slate-500">
        A new pick every morning — come back tomorrow.
      </p>
    </section>
  );
}

/** Home page: today's picks as one slim line, with the ways into deals and shopping. */
export async function DealOfTheDayBar() {
  /** Logged-in members get the Wall of Fame CTA in this spot instead. */
  const user = await optionalRead(() => getCurrentUser(), null);
  if (user) return null;

  const { deal, offer } = await cachedDealOfTheDay();

  return (
    <section className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-2.5 py-1.5 text-sm">
      <span
        aria-hidden
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-2xl"
      >
        🛍️
      </span>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="flex flex-wrap items-baseline gap-x-2 text-xs">
          <span className="text-sm font-bold text-emerald-900">
            ⏰ Deal of the day
          </span>
          <Link
            href="/deals"
            className="font-semibold text-indigo-700 hover:underline"
          >
            All deals →
          </Link>
          <Link
            href="/dashboard/deals"
            className="font-semibold text-emerald-800 hover:underline"
          >
            Post yours free
          </Link>
        </p>
        {deal ? (
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href={`/business/${deal.business.slug}`}
              className="min-w-0 truncate font-semibold text-slate-800 hover:text-indigo-700"
            >
              🏷️ {deal.title}{" "}
              <span className="font-normal text-slate-500">
                · {deal.business.name}
              </span>
            </Link>
            {deal.code ? <DealCode code={deal.code} /> : null}
            {deal.linkUrl ? (
              <a
                href={deal.linkUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="shrink-0 text-xs font-semibold text-indigo-700 hover:underline"
              >
                Claim →
              </a>
            ) : null}
          </div>
        ) : null}
        {offer ? (
          <div className="flex min-w-0 items-center gap-2">
            <a
              href={`/api/offers/${offer.id}/click`}
              target="_blank"
              rel="noopener noreferrer sponsored nofollow"
              className="min-w-0 truncate font-semibold text-slate-800 hover:text-indigo-700"
            >
              🛒 {offer.title}{" "}
              <span className="font-normal text-slate-500">
                · {offer.advertiserName}
              </span>
            </a>
            {offer.code ? <DealCode code={offer.code} /> : null}
            <span className="shrink-0 text-[10px] uppercase tracking-wide text-slate-400">
              Paid link
            </span>
          </div>
        ) : null}
        {!deal && !offer ? (
          <p className="truncate text-xs text-slate-600">
            Today&rsquo;s pick is on its way — see every offer on the deals
            page.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function DealCode({ code }: { code: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-emerald-300 bg-white px-1.5 py-0.5 text-xs">
      <span className="font-mono font-bold tracking-wider text-emerald-900">
        {code}
      </span>
      <CopyButton value={code} />
    </span>
  );
}
