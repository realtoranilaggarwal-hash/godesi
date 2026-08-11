import Link from "next/link";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";

/** Fills a spare cell in the category grid with the website offer. */
export function WebsiteOfferTile() {
  return (
    <Link
      href="/website"
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center gap-3 bg-gradient-to-r from-sky-500 to-indigo-500 px-3 py-2 text-white">
        <span className="text-xl" aria-hidden>
          🌐
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight">Get a website</p>
          <p className="text-[11px] text-white/80">
            ${WEBSITE_OFFER.priceUsd} for {WEBSITE_OFFER.pages} pages, live in
            days
          </p>
        </div>
      </div>
      <div className="p-3">
        <div className="flex flex-wrap gap-1.5">
          {["Your own domain", "We host it"].map((perk) => (
            <span
              key={perk}
              className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs text-sky-700"
            >
              {perk}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
