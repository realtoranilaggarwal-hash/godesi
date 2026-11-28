import Link from "next/link";
import { SidebarBanners } from "@/components/Banners";
import { isPhoneRequest } from "@/lib/device";
import { db } from "@/lib/db";
import { cachedQuery, CONTENT_TTL } from "@/lib/cache";
import { citySlug } from "@/lib/citySlug";
import { HASHTAG_LINKS } from "@/lib/social";

const PERKS: { icon: string; title: string; body: string; href?: string }[] = [
  {
    icon: "📻",
    title: "Free live desi radio",
    body: "Bollywood, Hindi, Punjabi and news stations, live and free.",
    href: "/live-radio",
  },
  {
    icon: "📘",
    title: "Free ebooks",
    body: "Like our palm reading guide: read your own hand, free to download.",
    href: "/astrology/palmistry",
  },
  {
    icon: "🛍️",
    title: "Marketing tools at the lowest price",
    body: "Handpicked flags, banners, business cards and QR stickers, designed for you.",
    href: "/marketing-shop",
  },
  {
    icon: "⚡",
    title: "One-click event import",
    body: "GoDesi Push brings your Sulekha or Eventbrite event over in one click.",
    href: "/events/push",
  },
  {
    icon: "📇",
    title: "Free digital business card",
    body: "Your own page at godesi.com/yourname with photos, services, hours and reviews.",
  },
  {
    icon: "📲",
    title: "QR code + WhatsApp button",
    body: "One scan opens your profile; customers message you directly, no commission.",
  },
  {
    icon: "🎯",
    title: "Buyer requirements",
    body: "See what people need in your city and reply before anyone else does.",
  },
  {
    icon: "🎟",
    title: "Events, tickets and coupons",
    body: "Sell tiered tickets with QR entry and hand out your own discount codes.",
  },
  {
    icon: "🏆",
    title: "Refer and earn points",
    body: "Points for every signup, listing and upgrade — spend them on ads and features.",
  },
  {
    icon: "⭐",
    title: "Upgrade to feature",
    body: "Paid listings sit above free ones in search and ride the featured strip.",
  },
];

const NEXT_STEPS = [
  {
    icon: "✏️",
    title: "Finish your page",
    body: "Add photos, prices and hours — a complete card gets 3× more calls.",
  },
  {
    icon: "🏷️",
    title: "Post a free deal",
    body: "A discount or special puts you in the deals strip on the home page.",
  },
  {
    icon: "📤",
    title: "Share your QR",
    body: "Print the free shop poster or send your link on WhatsApp.",
  },
];

const joinStats = cachedQuery("join-stats", CONTENT_TTL, async () => {
  const [businesses, cities, members] = await Promise.all([
    db.business.count({ where: { status: "APPROVED" } }),
    db.business.groupBy({ by: ["city"], where: { status: "APPROVED" } }),
    db.user.count(),
  ]);
  return {
    businesses,
    // groupBy counts raw spellings ("Iselin", "Iselin NJ"); slug them first.
    cities: new Set(
      cities.map((row) => (row.city ? citySlug(row.city) : "")).filter(Boolean),
    ).size,
    members,
  };
});

/**
 * The "why join" rail. It sits on one side of the sign-in form with the
 * community and ad rail on the other, so neither column runs very long.
 */
export async function JoinPerks() {
  if (isPhoneRequest()) return null;

  const stats = await joinStats();

  return (
    <div className="hidden w-[280px] shrink-0 space-y-4 xl:block">
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-black text-slate-900">Why join Godesi?</h2>
        <p className="mt-1 text-xs text-slate-500">
          Free to start — no card needed.
        </p>

        <ul className="mt-3 space-y-3">
          {PERKS.map((perk) => (
            <li key={perk.title} className="flex gap-2">
              <span className="text-lg leading-none" aria-hidden>
                {perk.icon}
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {perk.href ? (
                    <Link
                      href={perk.href}
                      className="hover:text-rose-600 hover:underline"
                    >
                      {perk.title} →
                    </Link>
                  ) : (
                    perk.title
                  )}
                </p>
                <p className="text-xs text-slate-600">{perk.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <Link
          href="/pricing"
          className="mt-4 block text-center text-xs font-semibold text-rose-600 hover:underline"
        >
          Compare free and paid plans →
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-black text-slate-900">GoDesi today</h2>
        <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-indigo-50 px-1 py-2">
            <dt className="text-[10px] font-semibold uppercase text-slate-500">
              Listings
            </dt>
            <dd className="text-base font-black text-indigo-700">
              {stats.businesses.toLocaleString()}
            </dd>
          </div>
          <div className="rounded-xl bg-emerald-50 px-1 py-2">
            <dt className="text-[10px] font-semibold uppercase text-slate-500">
              Cities
            </dt>
            <dd className="text-base font-black text-emerald-700">
              {stats.cities.toLocaleString()}
            </dd>
          </div>
          <div className="rounded-xl bg-amber-50 px-1 py-2">
            <dt className="text-[10px] font-semibold uppercase text-slate-500">
              Members
            </dt>
            <dd className="text-base font-black text-amber-700">
              {stats.members.toLocaleString()}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-black text-slate-900">After you join</h2>
        <ol className="mt-3 space-y-3">
          {NEXT_STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-2">
              <span className="text-lg leading-none" aria-hidden>
                {step.icon}
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {index + 1}. {step.title}
                </p>
                <p className="text-xs text-slate-600">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Link
        href="/website"
        className="block rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-orange-500 p-4 text-white transition hover:brightness-110"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
          GoDesi Websites
        </p>
        <p className="mt-1 text-base font-black leading-tight">
          Your own website, built for $99
        </p>
        <p className="mt-1 text-xs text-white/90">
          5 pages, preview free before you pay →
        </p>
      </Link>
    </div>
  );
}

/** The community and sponsored rail, kept on the other side of the form. */
export function JoinRail() {
  return (
    <div className="hidden shrink-0 lg:block">
      {/* Signup pages keep it slim so the rail doesn't outrun the form. */}
      <SidebarBanners slim />
    </div>
  );
}

const HIGHLIGHTS = [
  {
    icon: "📘",
    title: "Free ebooks",
    body: "Guides like our palm reading ebook, free to download.",
    href: "/astrology/palmistry",
  },
  {
    icon: "📻",
    title: "Free live radio",
    body: "Bollywood, Hindi, Punjabi and news stations.",
    href: "/live-radio",
  },
  {
    icon: "☀️",
    title: "Free daily news",
    body: "GoDesi Daily: desi news, panchang, gold and rupee rates.",
    href: "/daily",
  },
  {
    icon: "📇",
    title: "The first exclusive desi directory",
    body: "Desi businesses, pros and services near you.",
    href: "/search",
  },
];

const NEWS_TAGS = ["#godesi", "#Diwali", "#H1B", "#Bollywood"];

/** The join pitch for every screen size, phones included. */
export function JoinHighlights() {
  return (
    <section className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-indigo-50 p-4">
      <h2 className="font-black text-slate-900">Join free and get 🎁</h2>
      <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {HIGHLIGHTS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex gap-2 rounded-xl bg-white/80 p-2 hover:bg-white"
            >
              <span className="text-lg leading-none" aria-hidden>
                {item.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-slate-900">
                  {item.title} →
                </span>
                <span className="block text-xs text-slate-600">
                  {item.body}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-slate-700">
        💡 <b>Did you know?</b>{" "}
        <a
          href={HASHTAG_LINKS.X}
          target="_blank"
          rel="noreferrer"
          className="font-bold text-indigo-700 underline"
        >
          #godesi
        </a>{" "}
        is the number one hashtag on X (Twitter).
      </p>
      <p className="mt-2 text-sm text-slate-700">
        📰 <b>Read news by hashtag:</b> tap one below and{" "}
        <Link
          href="/trending"
          className="font-semibold text-indigo-700 underline"
        >
          Trending
        </Link>{" "}
        shows the news, blogs and posts that use it.
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-semibold">
        {NEWS_TAGS.map((tag) => (
          <Link
            key={tag}
            href={`/trending?tag=${encodeURIComponent(tag)}`}
            className="rounded-full bg-slate-900 px-2.5 py-1 text-white hover:bg-slate-700"
          >
            {tag}
          </Link>
        ))}
      </div>
    </section>
  );
}
