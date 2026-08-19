import Link from "next/link";
import { SidebarBanners } from "@/components/Banners";

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

/**
 * The "why join" rail. It sits on one side of the sign-in form with the
 * community and ad rail on the other, so neither column runs very long.
 */
export function JoinPerks() {
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
