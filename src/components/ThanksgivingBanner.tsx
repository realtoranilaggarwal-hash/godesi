import Link from "next/link";
import { THANKSGIVING, thanksgivingLink, thanksgivingLive } from "@/lib/thanksgiving";

/** One-day Thanksgiving specials strip under the header. */
export function ThanksgivingBanner() {
  if (!thanksgivingLive()) return null;
  const offers = [
    {
      href: thanksgivingLink("nye", "banner"),
      label: (
        <>
          🎆 <span className="hidden sm:inline">NYE tickets </span>
          <span className="sm:hidden">NYE </span>
          <strong>10% OFF</strong>
          <span className="hidden sm:inline"> with</span>{" "}
          <code className="rounded bg-white/80 px-0.5 font-black sm:px-1 text-orange-800">
            {THANKSGIVING.nyeCode}
          </code>
        </>
      ),
      external: true,
    },
    {
      href: thanksgivingLink("marketing", "banner"),
      label: (
        <>
          📣 <span className="hidden sm:inline">Annual AI Marketing Package</span>
          <span className="sm:hidden">AI Marketing</span>{" "}
          <strong>${THANKSGIVING.marketingUsd}</strong>
        </>
      ),
    },
    {
      href: thanksgivingLink("website", "banner"),
      label: (
        <>
          💻 AI Website <strong>${THANKSGIVING.websiteUsd}</strong>
        </>
      ),
    },
  ];
  return (
    <div className="border-y border-orange-300 bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 text-orange-950">
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-2 py-1.5 text-xs sm:py-2 sm:text-sm">
        <Link
          href={thanksgivingLink("article", "banner")}
          className="font-black uppercase tracking-wide hover:underline"
        >
          🦃 Thanksgiving specials – one day only!
        </Link>
        {/* One row on phones too: short labels keep the strip from eating the first screen. */}
        <div className="flex w-full flex-nowrap items-center justify-center gap-1 sm:w-auto sm:gap-3">
        {offers.map((offer) => (
          <a
            key={offer.href}
            href={offer.href}
            {...(offer.external ? { target: "_blank", rel: "noopener" } : {})}
            className="whitespace-nowrap rounded-full border border-orange-300 bg-white/70 px-1.5 py-0.5 text-[10px] font-semibold shadow-sm transition hover:bg-white sm:px-3 sm:py-1 sm:text-sm"
          >
            {offer.label}
            <span className="hidden sm:inline"> →</span>
          </a>
        ))}
        </div>
      </div>
    </div>
  );
}
