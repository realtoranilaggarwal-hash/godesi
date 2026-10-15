import Link from "next/link";
import { dealDetails } from "@/lib/deals";
import { dealOfTheDay } from "@/lib/dealOfTheDay";
import { DealCard } from "@/components/DealCard";
import { StoreOfferCard } from "@/components/StoreOfferCard";
import { CopyButton } from "@/components/CopyButton";

/** Today's one business deal and one store coupon, changing at midnight New York time. */
export async function DealOfTheDay() {
  const { deal, offer } = await dealOfTheDay();
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
  const { deal, offer } = await dealOfTheDay();

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-sm">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <h2 className="shrink-0 font-bold text-emerald-900">
          ⏰ Deal of the day
        </h2>
        {deal ? (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={`/b/${deal.business.slug}`}
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
                className="text-xs font-semibold text-indigo-700 hover:underline"
              >
                Claim →
              </a>
            ) : null}
          </div>
        ) : null}
        {offer ? (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
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
            <span className="text-[10px] uppercase tracking-wide text-slate-400">
              Paid link
            </span>
          </div>
        ) : null}
        {!deal && !offer ? (
          <p className="flex-1 text-slate-600">
            Today&rsquo;s pick is on its way — see every offer on the deals page.
          </p>
        ) : null}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-emerald-200/70 pt-1.5 text-xs">
        <Link href="/deals" className="font-semibold text-indigo-700 hover:underline">
          All deals →
        </Link>
        <Link href="/shop" className="font-semibold text-indigo-700 hover:underline">
          🛍️ Shop →
        </Link>
        <span className="text-slate-600">
          Own a business?{" "}
          <Link
            href="/dashboard/deals"
            className="font-semibold text-emerald-800 underline hover:text-emerald-900"
          >
            Post your deal free
          </Link>{" "}
          — it shows here, on your page and on /deals.
        </span>
      </div>
    </section>
  );
}

function DealCode({ code }: { code: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-white px-1.5 py-0.5 text-xs">
      <span className="font-mono font-bold tracking-wider text-emerald-900">
        {code}
      </span>
      <CopyButton value={code} />
    </span>
  );
}
