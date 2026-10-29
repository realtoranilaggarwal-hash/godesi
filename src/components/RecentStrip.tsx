import Link from "next/link";
import { recentActivity, type RecentBanner } from "@/lib/recentActivity";
import { thumbImage } from "@/lib/proxyImage";
import { getCurrentUser } from "@/lib/auth";
import { optionalRead } from "@/lib/resilient";

function Banner({ banner }: { banner: RecentBanner }) {
  return (
    <Link
      href={banner.href}
      className="flex h-14 w-56 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-indigo-50 text-xl leading-none">
        {banner.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbImage(banner.imageUrl, 384)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          banner.icon
        )}
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-[10px] font-semibold uppercase tracking-wide text-indigo-600">
          {banner.verb}
        </span>
        <span className="block truncate text-xs font-bold text-slate-900">
          {banner.title}
        </span>
        {banner.line ? (
          <span className="block truncate text-[10px] text-slate-500">
            {banner.line}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

/**
 * Fixed-size mini banners of who joined or posted lately, drifting left to
 * right across the page. Anyone who just listed, posted or joined can find
 * themselves here; hovering pauses it.
 */
export async function RecentStrip() {
  const [banners, user] = await Promise.all([
    recentActivity(30),
    optionalRead(() => getCurrentUser(), null),
  ]);
  const showTicker = banners.length >= 4;

  return (
    <section aria-label="Recently joined and posted">
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
        {showTicker ? (
          <h2>
            <span className="inline-block rounded-full bg-gradient-to-r from-lime-500 to-emerald-600 px-3 py-1 text-sm font-black uppercase tracking-wide text-white shadow-sm">
              🟢 Just now on GoDesi
            </span>
          </h2>
        ) : null}
        {user ? (
          <Link
            href="/walloffame"
            className="order-last flex min-w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 px-3 py-2 text-center text-sm min-[360px]:text-base font-black tracking-wide text-white shadow-lg shadow-amber-200 ring-2 ring-amber-300 transition hover:brightness-110 sm:order-none sm:min-w-0 sm:px-5"
          >
            <span className="sm:hidden">
              🧱 Wall of Fame — $4 a brick, for life →
            </span>
            <span className="hidden sm:inline">
              🧱 Wall of Fame — book your bricks now: start with $4, be seen on
              the wall for life →
            </span>
          </Link>
        ) : (
          <div className="order-last flex min-w-full flex-1 gap-2 sm:order-none sm:min-w-0">
            <Link
              href="/signup"
              className="flex min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 px-3 py-2 text-center text-sm min-[360px]:text-base font-black tracking-wide text-white shadow-lg shadow-rose-200 ring-2 ring-rose-300 transition hover:from-amber-400 hover:via-rose-400 hover:to-indigo-500 sm:px-5 sm:text-base"
            >
              <span className="sm:hidden">🎉 Register free →</span>
              <span className="hidden sm:inline">
                🎉 Register now — it&apos;s free →
              </span>
            </Link>
            <Link
              href="/login"
              className="flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-xl border-2 border-rose-400 bg-white px-3 py-2 text-center text-sm min-[360px]:text-base font-semibold text-rose-600 shadow-md shadow-rose-200/40 transition hover:bg-rose-50 sm:px-4 sm:text-base"
            >
              🔑 Log in
            </Link>
          </div>
        )}
        {showTicker ? (
          <Link
            href="/people"
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            All members →
          </Link>
        ) : null}
      </div>
      {showTicker ? (
        <div className="ticker-window -mx-4 px-4 py-1 sm:mx-0 sm:px-0">
          <div
            className="ticker-track ticker-track--right flex gap-3"
            style={{
              animationDuration: `${Math.max(40, banners.length * 3)}s`,
            }}
          >
            {banners.map((banner) => (
              <Banner key={banner.key} banner={banner} />
            ))}
            {banners.map((banner) => (
              <span
                key={`repeat-${banner.key}`}
                aria-hidden
                className="contents"
              >
                <Banner banner={banner} />
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
