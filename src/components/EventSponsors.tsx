import Link from "next/link";
import { proxyImage } from "@/lib/proxyImage";
import {
  type EventSponsorRow,
  sponsorDiscountLabel,
  sponsorPhoto,
} from "@/lib/sponsors";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

/** Approved sponsors in round photo circles, with their ticket codes. */
export function EventSponsors({ sponsors }: { sponsors: EventSponsorRow[] }) {
  if (!sponsors.length) return null;
  return (
    <section id="sponsors" className="scroll-mt-24 space-y-3">
      <h2 className="font-bold">🤝 Our sponsors &amp; promo codes</h2>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {sponsors.map((sponsor) => {
          const photo = sponsorPhoto(sponsor);
          const discount = sponsorDiscountLabel(sponsor);
          return (
            <li
              key={sponsor.id}
              className="flex flex-col items-center rounded-2xl border border-amber-200 bg-amber-50/60 p-3 text-center"
            >
              <Link
                href={`/business/${sponsor.business.slug}`}
                className="flex flex-col items-center gap-2"
              >
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={proxyImage(photo)}
                    alt={sponsor.business.name}
                    className="h-20 w-20 rounded-full border-2 border-amber-300 bg-white object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-300 bg-white text-xl font-bold text-amber-700">
                    {initials(sponsor.business.name)}
                  </span>
                )}
                <span className="text-sm font-bold text-slate-900 hover:underline">
                  {sponsor.business.name}
                </span>
              </Link>
              <span className="text-xs text-slate-500">
                {sponsor.business.category}
              </span>
              {sponsor.offer ? (
                <span className="mt-1 text-xs font-semibold text-slate-700">
                  {sponsor.offer}
                </span>
              ) : null}
              {discount && sponsor.coupon ? (
                <span className="mt-2 rounded-lg border border-dashed border-emerald-400 bg-white px-2 py-1 text-xs">
                  Code{" "}
                  <b className="font-mono text-emerald-700">
                    {sponsor.coupon.code}
                  </b>{" "}
                  · {discount}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
