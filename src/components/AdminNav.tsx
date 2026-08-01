"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** One desk per page — the panel used to be a single very long scroll. */
export const ADMIN_SECTIONS = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/listings", label: "Listings", icon: "🏪" },
  { href: "/admin/claims", label: "Claims", icon: "✋" },
  { href: "/admin/events", label: "Events", icon: "🎟️" },
  { href: "/admin/banners", label: "Banners", icon: "🖼️" },
  { href: "/admin/ads", label: "Ad orders", icon: "📢" },
  { href: "/admin/members", label: "Members", icon: "👥" },
  { href: "/admin/upi", label: "UPI payments", icon: "🧾" },
  { href: "/admin/coupons", label: "Coupons", icon: "🏷️" },
  { href: "/admin/news", label: "News", icon: "📰" },
  { href: "/admin/journalists", label: "Journalists", icon: "🗞️" },
  { href: "/admin/auto-share", label: "Auto-share", icon: "🔁" },
  { href: "/admin/connect", label: "Connect", icon: "🤝" },
  { href: "/admin/temples", label: "Temples", icon: "🛕" },
  { href: "/admin/resources", label: "Resources", icon: "🔗" },
  { href: "/admin/rewards", label: "Rewards", icon: "🎁" },
  { href: "/admin/content", label: "Content desk", icon: "✍️" },
  { href: "/admin/desi-elite", label: "Elite", icon: "🏆" },
  { href: "/admin/live-channels", label: "Radio & TV", icon: "🎧" },
  { href: "/admin/outreach", label: "Outreach", icon: "📣" },
  { href: "/admin/team", label: "Team", icon: "🔑" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1.5 text-sm font-semibold">
      {ADMIN_SECTIONS.map((section) => (
        <Link
          key={section.href}
          href={section.href}
          className={`rounded-full px-3 py-1.5 ${
            pathname === section.href
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          <span aria-hidden className="mr-1">
            {section.icon}
          </span>
          {section.label}
        </Link>
      ))}
    </nav>
  );
}
