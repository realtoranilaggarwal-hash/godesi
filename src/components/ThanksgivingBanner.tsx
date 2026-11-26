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
          🎆 NYE tickets <strong>10% OFF</strong> with{" "}
          <code className="rounded bg-white/80 px-1 font-black text-orange-800">
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
          📣 Annual AI Marketing Package <strong>${THANKSGIVING.marketingUsd}</strong>
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
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-3 py-2 text-xs sm:text-sm">
        <Link
          href={thanksgivingLink("article", "banner")}
          className="font-black uppercase tracking-wide hover:underline"
        >
          🦃 Thanksgiving specials – one day only!
        </Link>
        {offers.map((offer) => (
          <a
            key={offer.href}
            href={offer.href}
            {...(offer.external ? { target: "_blank", rel: "noopener" } : {})}
            className="rounded-full border border-orange-300 bg-white/70 px-3 py-1 font-semibold shadow-sm transition hover:bg-white"
          >
            {offer.label} →
          </a>
        ))}
      </div>
    </div>
  );
}
