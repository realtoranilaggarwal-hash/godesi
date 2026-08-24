import type { Role } from "@prisma/client";
import { can, type StaffPermission } from "@/lib/permissions";

/**
 * Who may open a desk: admins only, any staff member, or staff holding one
 * named permission. The nav shows a moderator nothing she cannot open, so a
 * click never bounces her back to the content desk.
 */
type Need = "admin" | "staff" | StaffPermission;

export type AdminSection = {
  href: string;
  label: string;
  icon: string;
  need: Need;
};

/** One desk per page — the panel used to be a single very long scroll. */
export const ADMIN_SECTIONS: AdminSection[] = [
  { href: "/admin", label: "Overview", icon: "📊", need: "admin" },
  { href: "/admin/listings", label: "Listings", icon: "🏪", need: "admin" },
  {
    href: "/admin/listings/wire",
    label: "Listing wire",
    icon: "🔗",
    need: "listings",
  },
  {
    href: "/admin/properties",
    label: "Property",
    icon: "🏢",
    need: "listings",
  },
  { href: "/admin/claims", label: "Claims", icon: "✋", need: "admin" },
  { href: "/admin/events", label: "Events", icon: "🎟️", need: "admin" },
  {
    href: "/admin/events/wire",
    label: "Event wire",
    icon: "📅",
    need: "events",
  },
  { href: "/admin/banners", label: "Banners", icon: "🖼️", need: "admin" },
  { href: "/admin/ads", label: "Ad orders", icon: "📢", need: "admin" },
  { href: "/admin/members", label: "Members", icon: "👥", need: "admin" },
  { href: "/admin/upi", label: "UPI payments", icon: "🧾", need: "admin" },
  { href: "/admin/coupons", label: "Coupons", icon: "🏷️", need: "admin" },
  { href: "/admin/news", label: "News", icon: "📰", need: "admin" },
  {
    href: "/admin/journalists",
    label: "Journalists",
    icon: "🗞️",
    need: "admin",
  },
  { href: "/admin/auto-share", label: "Auto-share", icon: "🔁", need: "admin" },
  { href: "/admin/connect", label: "Connect", icon: "🤝", need: "admin" },
  { href: "/admin/temples", label: "Temples", icon: "🛕", need: "admin" },
  { href: "/admin/resources", label: "Resources", icon: "🔗", need: "admin" },
  { href: "/admin/rewards", label: "Rewards", icon: "🎁", need: "admin" },
  { href: "/admin/reviews", label: "Reviews", icon: "⭐", need: "reviews" },
  { href: "/admin/content", label: "Content desk", icon: "✍️", need: "staff" },
  { href: "/admin/desi-elite", label: "Elite", icon: "🏆", need: "staff" },
  {
    href: "/admin/live-channels",
    label: "Radio & TV",
    icon: "🎧",
    need: "staff",
  },
  { href: "/admin/help-clips", label: "Help clips", icon: "▶️", need: "admin" },
  { href: "/admin/outreach", label: "Outreach", icon: "📣", need: "staff" },
  { href: "/admin/prospects", label: "Call list", icon: "☎️", need: "staff" },
  { href: "/admin/team", label: "Team", icon: "🔑", need: "admin" },
  { href: "/admin/handbook", label: "Handbook", icon: "📗", need: "staff" },
];

type StaffUser = { role: Role; staffPermissions: string[] };

export function mayOpen(user: StaffUser, section: AdminSection) {
  if (user.role === "ADMIN") return true;
  if (user.role !== "MODERATOR") return false;
  if (section.need === "admin") return false;
  if (section.need === "staff") return true;
  return can(user, section.need);
}

export function sectionsFor(user: StaffUser) {
  return ADMIN_SECTIONS.filter((section) => mayOpen(user, section));
}

/**
 * Where to send someone who opened a desk she is not allowed on. Moderators go
 * back to their own desk with an explanation — sending them to /dashboard used
 * to bounce them straight back here with no message at all.
 */
export function deskFallback(user: { role: Role }, desk: string) {
  if (user.role === "MODERATOR")
    return `/admin/content?denied=${encodeURIComponent(desk)}`;
  return "/dashboard";
}
