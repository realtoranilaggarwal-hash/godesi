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

/**
 * Approved sponsors in round photo circles. Codes stay private: buyers ask the
 * sponsor, or post a review on its card and get the code there and by email.
 */
export function EventSponsors({
  sponsors,
  rewardOpen,
}: {
  sponsors: EventSponsorRow[];
  /** False once the event has started: reviews no longer earn a ticket code. */
  rewardOpen: boolean;
}) {
  if (!sponsors.length) return null;
  return (
    <section id="sponsors" className="scroll-mt-24 space-y-3">
      <h2 className="font-bold">🤝 Our sponsors &amp; ticket discounts</h2>
      {rewardOpen ? (
        <p className="text-sm text-slate-600">
          Want a discount code? Ask a sponsor for theirs, or post an honest
          review on their GoDesi page and you&apos;ll get the code right away by
          email.
        </p>
      ) : null}
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {sponsors.map((sponsor) => {
          const photo = sponsorPhoto(sponsor);
          const discount = rewardOpen ? sponsorDiscountLabel(sponsor) : null;
          return (
            <li
              key={sponsor.id}
              className="flex flex-col items-center rounded-2xl border border-amber-200 bg-amber-50/60 p-3 text-center"
            >
              <Link
                href={`/business/${sponsor.business.slug}?src=sponsor`}
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
              {sponsor.buyerGift ? (
                <span className="mt-1 text-xs text-amber-800">
                  🎁 {sponsor.buyerGift}
                </span>
              ) : null}
              {discount ? (
                <Link
                  href={`/business/${sponsor.business.slug}#review`}
                  className="mt-2 rounded-lg border border-dashed border-emerald-400 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-emerald-50"
                >
                  🎟️ {discount}
                  <span className="block font-semibold text-emerald-700 underline">
                    Review to get the code
                  </span>
                </Link>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
