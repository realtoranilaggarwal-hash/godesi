import { CopyButton } from "@/components/CopyButton";
import { expiryLabel } from "@/lib/dealFormat";
import type { PublicStoreOffer } from "@/lib/storeOffers";

export function StoreOfferCard({ offer }: { offer: PublicStoreOffer }) {
  const ends = expiryLabel(offer.endsAt);
  return (
    <div className="flex h-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4">
      <p className="flex items-center justify-between gap-2 text-xs">
        <span className="truncate font-semibold text-slate-700">
          🛒 {offer.advertiserName}
        </span>
        <span className="shrink-0 text-[10px] uppercase tracking-wide text-slate-400">
          Paid link
        </span>
      </p>
      <p className="font-bold text-slate-900">{offer.title}</p>
      {offer.description ? (
        <p className="line-clamp-3 text-sm text-slate-600">
          {offer.description}
        </p>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1 text-xs">
        {offer.code ? (
          <span className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1">
            <span className="font-mono font-bold tracking-wider text-slate-800">
              {offer.code}
            </span>
            <CopyButton value={offer.code} />
          </span>
        ) : null}
        <a
          href={`/api/offers/${offer.id}/click`}
          target="_blank"
          rel="noopener noreferrer sponsored nofollow"
          className="font-semibold text-indigo-700 hover:underline"
        >
          Shop the offer →
        </a>
        {ends ? <span className="text-slate-500">{ends}</span> : null}
      </div>
    </div>
  );
}
