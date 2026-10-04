import Link from "next/link";
import { recentActivity, type RecentBanner } from "@/lib/recentActivity";
import { thumbImage } from "@/lib/proxyImage";

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
  const banners = await recentActivity(30);
  if (banners.length < 4) return null;

  return (
    <section aria-label="Recently joined and posted">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
          🟢 Just now on GoDesi
        </h2>
        <Link
          href="/people"
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          All members →
        </Link>
      </div>
      <div className="ticker-window -mx-4 px-4 py-1 sm:mx-0 sm:px-0">
        <div
          className="ticker-track ticker-track--right flex gap-3"
          style={{ animationDuration: `${Math.max(40, banners.length * 3)}s` }}
        >
          {banners.map((banner) => (
            <Banner key={banner.key} banner={banner} />
          ))}
          {banners.map((banner) => (
            <span key={`repeat-${banner.key}`} aria-hidden className="contents">
              <Banner banner={banner} />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
