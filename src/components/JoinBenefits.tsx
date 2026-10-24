import Link from "next/link";
import { SidebarBanners } from "@/components/Banners";
import { isPhoneRequest } from "@/lib/device";
import { db } from "@/lib/db";
import { cachedQuery, CONTENT_TTL } from "@/lib/cache";

const PERKS = [
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
    cities: cities.filter((row) => row.city).length,
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
                <p className="text-sm font-bold text-slate-900">{perk.title}</p>
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
      <SidebarBanners />
    </div>
  );
}
