import Link from "next/link";

type BusinessLike = {
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  whatsappNumber: string | null;
  phone: string | null;
  websiteUrl: string | null;
  videoUrl: string | null;
  albumUrl: string | null;
  media: unknown[];
  address: string | null;
  mapsUrl: string | null;
  specialties: string[];
  referralOffer: string | null;
  startingPrice: number | null;
  categorySlug: string | null;
};

/** Extra hints tailored to the trade, so the checklist feels personal. */
function categoryHint(categorySlug: string | null): string | null {
  const slug = (categorySlug ?? "").toLowerCase();
  if (/fitness|yoga|gym|trainer|zumba|aerobic/.test(slug))
    return "class timings, trainer bio, and membership/drop-in prices";
  if (/restaurant|food|cater|tiffin|sweet|bakery/.test(slug))
    return "menu photos, opening hours, and today's special";
  if (/salon|spa|beauty|mehndi|henna/.test(slug))
    return "services & prices list, photos of your work";
  if (/real-estate|realtor|property/.test(slug))
    return "areas you cover, licence, and current listings";
  if (/dj|singer|band|music|performer/.test(slug))
    return "a video of you performing and your booking rate";
  if (/tutor|teacher|pandit|coach/.test(slug))
    return "subjects you teach, fees, and online/in-person";
  return null;
}

/**
 * Owner-only nudge shown at the top of their own card: what to add next so the
 * page stops looking empty and starts earning calls. Each row links straight
 * into the place where that piece is added.
 */
export function CardCompleteness({ business }: { business: BusinessLike }) {
  const items: { label: string; href: string; hint?: string }[] = [];

  if ((business.description?.trim().length ?? 0) < 160)
    items.push({
      label: "Write 2–3 lines about what you offer",
      href: "/dashboard/profile",
      hint: categoryHint(business.categorySlug) ?? undefined,
    });
  if (!business.logoUrl)
    items.push({ label: "Add your photo or logo", href: "/dashboard/profile" });
  if (!business.whatsappNumber && !business.phone)
    items.push({
      label: "Add WhatsApp/phone so clients can reach you",
      href: "/dashboard/profile",
    });
  if (!business.media.length && !business.albumUrl)
    items.push({
      label: "Add photos — cards with photos get more views",
      href: "/dashboard/profile",
    });
  if (!business.videoUrl)
    items.push({
      label: "Add a YouTube video of your work",
      href: "/dashboard/profile",
    });
  if (!business.specialties.length)
    items.push({
      label: "Tick your services so people find you in search",
      href: "/dashboard/profile",
    });
  if (!business.address && !business.mapsUrl)
    items.push({ label: "Add your address or Google Maps link", href: "/dashboard/profile" });
  if (!business.websiteUrl)
    items.push({ label: "Add your website", href: "/dashboard/profile" });
  if (!business.referralOffer)
    items.push({
      label: "Add a small offer (e.g. “10% off — mention GoDesi”)",
      href: "/dashboard/profile",
    });
  if (!business.startingPrice)
    items.push({ label: "Add a “packages from” price", href: "/dashboard/profile" });

  if (!items.length) return null;
  const shown = items.slice(0, 5);

  return (
    <section className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
      <h2 className="text-sm font-black text-amber-900">
        👋 Only you see this — complete your card
      </h2>
      <p className="mt-0.5 text-xs text-amber-800">
        Visitors see an empty page until you add these. Each takes under a
        minute.
      </p>
      <ul className="mt-3 space-y-1.5">
        {shown.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="flex items-start gap-2 rounded-xl bg-white/80 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-white"
            >
              <span aria-hidden>⬜</span>
              <span>
                {item.label}
                {item.hint ? (
                  <span className="block font-normal text-amber-700">
                    For your trade: {item.hint}
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] font-semibold text-amber-800">
        Then post something — a{" "}
        <Link href="/dashboard/deals" className="underline">
          deal
        </Link>
        ,{" "}
        <Link href="/dashboard/gigs" className="underline">
          a gig
        </Link>{" "}
        or{" "}
        <Link href="/events/new" className="underline">
          an event
        </Link>{" "}
        — it shows on your card and on the homepage.
      </p>
    </section>
  );
}
