import { NYE_SUPPORTER_SPECIAL, nyeSupporterSpecialLive } from "@/lib/nyeSupporterSpecial";

/** Thanksgiving weekend NYE ticket-buyer perks strip under the header. */
export function NyeSupporterSpecialBanner() {
  if (!nyeSupporterSpecialLive()) return null;
  return (
    <a
      href={NYE_SUPPORTER_SPECIAL.nyeUrl}
      target="_blank"
      rel="noopener"
      className="block border-y border-amber-500/40 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white transition hover:brightness-110"
    >
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-2 py-1.5 text-center text-xs sm:py-2 sm:text-sm">
        <span className="font-black uppercase tracking-wide">🦃 Till Sat night:</span>
        <span>
          buy any NYE ticket → <strong>free featured classified</strong> on GoDesi
          <span className="hidden sm:inline">
            {" "}
            + your name on our <strong>Supporters</strong> list + your own <strong>10% off code</strong> to share with
            your clients
          </span>
        </span>
        <span className="whitespace-nowrap rounded-full bg-white/20 px-2 py-0.5 font-bold">Get tickets →</span>
      </div>
    </a>
  );
}
