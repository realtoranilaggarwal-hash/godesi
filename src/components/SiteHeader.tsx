import Image from "next/image";
import Link from "next/link";
import type { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { effectivePlan } from "@/lib/plans";
import { getCategoryTree } from "@/lib/directory";
import { unreadCount } from "@/lib/notifications";
import { gradientFor } from "@/lib/categories";
import { Badge } from "@/components/ui";
import { HeaderShell } from "@/components/HeaderShell";
import { MobileMenu } from "@/components/MobileMenu";

const NAV = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/search", label: "Businesses", icon: "🏪" },
  { href: "/leads", label: "Leads", icon: "📋" },
  { href: "/events", label: "Events", icon: "🎟️" },
  { href: "/real-estate", label: "Real Estate", icon: "🏢" },
  { href: "/rooms", label: "Rooms", icon: "🛋️" },
  { href: "/wedding", label: "Wedding Services", icon: "💐" },
  { href: "/religious", label: "Temples", icon: "🛕" },
  { href: "/connect", label: "Connect", icon: "🤝" },
  { href: "/news", label: "News", icon: "📰" },
];

/** Chips beside the search box, for pages the main nav has no room for. */
const QUICK_LINKS = [
  { href: "/live", label: "Live", icon: "🟢" },
  { href: "/connect", label: "Connect", icon: "🤝" },
  { href: "/blog", label: "Blog", icon: "✍️" },
  { href: "/faq", label: "FAQ", icon: "❓" },
];

/**
 * Short labels for the one-line bar. Anything longer overflowed into the
 * search box on 1536–1800px screens, which made the row jump around.
 */
const BAR_NAV = [
  { href: "/search", label: "Businesses" },
  { href: "/leads", label: "Leads" },
  { href: "/events", label: "Events" },
  { href: "/real-estate", label: "Property" },
  { href: "/rooms", label: "Rooms" },
  { href: "/news", label: "News" },
];

/** Admins land on the full panel, moderators on the content desk. */
function staffHome(user: { role: Role }) {
  if (user.role === "ADMIN") return "/admin";
  return user.role === "MODERATOR" ? "/admin/content" : "/dashboard";
}

function staffLabel(user: { role: Role }, staffText: string, memberText: string) {
  if (user.role === "ADMIN") return staffText;
  return user.role === "MODERATOR" ? "Content desk" : memberText;
}

export async function SiteHeader() {
  const [user, categories] = await Promise.all([
    getCurrentUser(),
    getCategoryTree(),
  ]);
  const unread = user ? await unreadCount(user.id) : 0;

  const categoryItems = [
    ...categories.map((category) => ({
      href: `/categories/${category.slug}`,
      label: category.name,
      icon: category.icon,
      className: `bg-gradient-to-r ${gradientFor(category.color)} text-white opacity-90 hover:opacity-100`,
    })),
    {
      href: "/categories",
      label: "All categories",
      icon: "🧭",
      className:
        "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    },
  ];
  const menuLinks = [
    ...NAV,
    { href: "/blog", label: "Blog", icon: "✍️" },
    { href: "/resources", label: "Resources", icon: "🔗" },
    { href: "/advertise", label: "Advertise", icon: "📢" },
    { href: "/pricing", label: "Pricing", icon: "⭐" },
    { href: "/rewards", label: "Refer & earn", icon: "🎁" },
  ];

  return (
    <HeaderShell
      items={categoryItems}
      bar={
        <div className="relative mx-auto flex max-w-screen-2xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4">
          <Link href="/" className="shrink-0" aria-label="Godesi home">
            <Image
              src="/logo-godesi.png"
              alt="Godesi"
              width={1355}
              height={400}
              priority
              className="h-8 w-auto sm:h-9"
            />
          </Link>

          <form
            action="/find"
            role="search"
            className="hidden shrink-0 items-center gap-1 sm:flex sm:w-44 xl:w-56"
          >
            <input
              name="q"
              type="search"
              placeholder="Search Godesi…"
              aria-label="Search Godesi"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              aria-label="Search"
              className="rounded-xl bg-slate-900 px-2.5 py-1.5 text-sm text-white hover:bg-slate-700"
            >
              🔍
            </button>
          </form>

          {/* Fills the gap beside the search box. */}
          <div className="hidden shrink-0 items-center gap-1 text-xs font-semibold xl:flex">
            {QUICK_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full bg-slate-100 px-2.5 py-1.5 text-slate-700 hover:bg-slate-200"
              >
                <span aria-hidden className="mr-1">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Signed-in members get dashboard chips here instead of the nav row. */}
          <nav
            className={`hidden min-w-0 flex-1 items-center justify-end gap-0.5 overflow-hidden text-[13px] font-semibold text-slate-700 ${
              user ? "" : "2xl:flex"
            }`}
          >
            {BAR_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-lg px-2 py-1.5 hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 text-sm font-medium">
            <Link
              href="/find"
              aria-label="Search Godesi"
              className="rounded-xl border border-slate-300 px-2 py-1.5 text-lg leading-none sm:hidden"
            >
              🔍
            </Link>
            <MobileMenu
              links={menuLinks}
              categories={categoryItems}
              account={
                user
                  ? {
                      href: staffHome(user),
                      label: staffLabel(user, "Admin panel", "My dashboard"),
                    }
                  : null
              }
              signOut={logoutAction}
            />
            <Link
              href="/post"
              className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-3 py-1.5 font-semibold text-white hover:opacity-90"
            >
              + Post
            </Link>
            {user ? (
              <>
                {/* Always-visible way back to your own listings and content. */}
                <Link
                  href={staffHome(user)}
                  className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 sm:inline-flex"
                >
                  <span aria-hidden className="mr-1">
                    📊
                  </span>
                  {staffLabel(user, "Admin", "Dashboard")}
                </Link>
                {user.role === "ADMIN" ? (
                  <Link
                    href="/admin/content"
                    className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 2xl:inline-flex"
                  >
                    <span aria-hidden className="mr-1">
                      ✍️
                    </span>
                    Content desk
                  </Link>
                ) : null}
                <Link
                  href="/dashboard/notifications"
                  className="relative rounded-lg px-2 py-1 hover:text-slate-900"
                  aria-label={
                    unread ? `${unread} unread notifications` : "Notifications"
                  }
                >
                  <span aria-hidden>🔔</span>
                  {unread ? (
                    <span className="absolute -right-0.5 -top-0.5 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  ) : null}
                </Link>
                <Link
                  href="/dashboard/me"
                  aria-label="My profile"
                  className="shrink-0"
                >
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 via-rose-500 to-fuchsia-600 text-sm font-black text-white">
                      {(user.name || user.email).slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </Link>
                <div className="hidden items-center gap-2 2xl:flex">
                  <Badge
                    tone={effectivePlan(user) === "FREE" ? "slate" : "indigo"}
                  >
                    {effectivePlan(user)}
                  </Badge>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="rounded-lg px-2 py-1 hover:text-slate-900"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  href="/login"
                  className="rounded-lg px-2 py-1 hover:text-slate-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-1.5 font-semibold text-white hover:opacity-90"
                >
                  List free
                </Link>
              </div>
            )}
          </div>
        </div>
      }
    />
  );
}
