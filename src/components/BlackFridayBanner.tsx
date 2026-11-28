import { BLACK_FRIDAY, blackFridayLive } from "@/lib/blackFriday";
import { SIGNUP_PROMO_CODE } from "@/lib/courseCodes";
import { NYE_SUPPORTER_SPECIAL, nyeSupporterSpecialLive } from "@/lib/nyeSupporterSpecial";

/** Black Friday → Cyber Monday specials strip under the header. */
export function BlackFridayBanner() {
  if (!blackFridayLive()) return null;
  // Thanksgiving weekend ticket-buyer perks ride on the NYE chip instead of a separate strip.
  const supporterSpecial = nyeSupporterSpecialLive();
  const offers = [
    supporterSpecial
      ? {
          href: NYE_SUPPORTER_SPECIAL.nyeUrl,
          label: (
            <>
              🦃 <span className="hidden sm:inline">NYE tickets </span>
              <span className="sm:hidden">NYE </span>
              <strong>$75</strong> +{" "}
              <span className="hidden sm:inline">free featured classified, Supporter listing &amp; your 10% code till Sat</span>
              <span className="sm:hidden">free perks</span>
            </>
          ),
          external: true,
        }
      : {
          href: BLACK_FRIDAY.nyeUrl,
          label: (
            <>
              🎆 <span className="hidden sm:inline">NYE party tickets </span>
              <span className="sm:hidden">NYE </span>
              <strong>$75</strong>
              <span className="hidden sm:inline"> till Nov 30</span>
            </>
          ),
          external: true,
        },
    {
      href: "/course#free-ebook",
      label: (
        <>
          📘 <span className="hidden sm:inline">Free course ebook with </span>
          <span className="sm:hidden">Free ebook </span>
          <code className="rounded bg-white/90 px-0.5 font-black text-slate-900 sm:px-1">{SIGNUP_PROMO_CODE}</code>
        </>
      ),
    },
    {
      href: "/marketing-shop",
      label: (
        <>
          📣 <span className="hidden sm:inline">Marketing Shop + </span>free ebooks
        </>
      ),
    },
  ];
  return (
    <div className="border-y border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 text-white">
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-2 py-1.5 text-xs sm:py-2 sm:text-sm">
        <span className="font-black uppercase tracking-wide text-amber-400">🛍️ Black Friday deals</span>
        <div className="flex w-full flex-wrap items-center justify-center gap-1 sm:w-auto sm:gap-3">
          {offers.map((offer) => (
            <a
              key={offer.href}
              href={offer.href}
              {...(offer.external ? { target: "_blank", rel: "noopener" } : {})}
              className="whitespace-nowrap rounded-full border border-white/30 bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold transition hover:bg-white/20 sm:px-3 sm:py-1 sm:text-sm"
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
