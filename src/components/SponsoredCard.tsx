import Link from "next/link";
import { activeBanners, SIDEBAR_SIZE } from "@/lib/banners";
import { recommendedLinks } from "@/lib/resources";
import { BannerImpression } from "@/components/BannerImpression";
import { LinkImpressions } from "@/components/LinkImpressions";
import { InArticleAd } from "@/components/InArticleAd";
import { proxyImage } from "@/lib/proxyImage";

/**
 * Fills leftover space in a card grid with whatever inventory exists, best
 * first: a booked rotating banner, then affiliate/sponsored text links, then
 * AdSense. It stretches to the cell it is dropped into, so an odd number of
 * cards never leaves a hole.
 */
export async function SponsoredCard({
  categorySlug,
  className = "",
}: {
  categorySlug?: string | null;
  className?: string;
}) {
  const [banners, links] = await Promise.all([
    activeBanners("SIDEBAR", 1),
    recommendedLinks(categorySlug ?? null),
  ]);
  const banner = banners[0];

  return (
    <aside
      aria-label="Sponsored"
      className={`flex h-full flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 ${className}`}
    >
      <div className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
          Sponsored
        </p>

        {banner ? (
          <a
            href={`/api/banners/${banner.id}/click`}
            target="_blank"
            rel="noreferrer sponsored"
            title={banner.title}
            className="block overflow-hidden rounded-xl border border-slate-200"
          >
            <BannerImpression id={banner.id} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={proxyImage(banner.imageUrl)}
              alt={banner.title}
              width={SIDEBAR_SIZE.width}
              height={SIDEBAR_SIZE.height}
              loading="lazy"
              className="h-auto w-full object-cover"
            />
          </a>
        ) : null}

        {links.length ? (
          <div>
            <LinkImpressions ids={links.map((link) => link.id)} />
            <ul className="divide-y divide-slate-100">
              {links.slice(0, 5).map((link) => (
                <li key={link.id} className="py-1.5">
                  <a
                    href={`/api/links/${link.id}/click`}
                    target="_blank"
                    rel="noreferrer sponsored nofollow"
                    className="text-sm font-semibold text-indigo-700 hover:underline"
                  >
                    {link.title}
                  </a>
                  {link.description ? (
                    <p className="text-xs text-slate-600">{link.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {banner || links.length ? null : <InArticleAd />}
      </div>

      <p className="text-xs text-slate-500">
        Your brand could sit here.{" "}
        <Link
          href="/advertise#book"
          className="font-bold text-indigo-600 underline"
        >
          Advertise on Godesi →
        </Link>
      </p>
    </aside>
  );
}
