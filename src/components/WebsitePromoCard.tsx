import Link from "next/link";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";

/** Side-rail banner selling GoDesi websites, from the $99 AI-built site up. */
export function WebsitePromoCard({ className = "" }: { className?: string }) {
  const lines = [
    `AI-built website — $${WEBSITE_OFFER.priceUsd}`,
    `Handmade custom design — $${WEBSITE_OFFER.customPriceUsd}`,
    `Hosting & updates — $${WEBSITE_OFFER.monthlyUsd}/month`,
    "Free preview — pay only if you love it",
  ];

  return (
    <Link
      href="/website"
      className={`block overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-4 text-white shadow-sm transition hover:brightness-110 ${className}`}
    >
      <p className="text-[11px] font-black uppercase tracking-wide text-amber-300">
        🌐 Need a website?
      </p>
      <p className="mt-1 text-lg font-black leading-tight">Get your business online</p>
      <p className="mt-1 leading-none">
        <span className="text-xs font-semibold text-white/80">starting at </span>
        <span className="text-4xl font-black text-amber-300">${WEBSITE_OFFER.priceUsd}</span>
      </p>
      <ul className="mt-3 space-y-1 text-xs text-white/90">
        {lines.map((line) => (
          <li key={line}>✓ {line}</li>
        ))}
      </ul>
      <span className="mt-3 block rounded-xl bg-white px-3 py-2 text-center text-sm font-black text-indigo-700">
        See website plans →
      </span>
    </Link>
  );
}
