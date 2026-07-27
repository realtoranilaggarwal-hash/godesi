import Image from "next/image";
import Link from "next/link";
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
  { href: "/wedding", label: "Wedding", icon: "💐" },
  { href: "/religious", label: "Temples", icon: "🛕" },
  { href: "/connect", label: "Connect", icon: "🤝" },
  { href: "/news", label: "News", icon: "📰" },
];

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
    { href: "/resources", label: "Resources", icon: "🔗" },
    { href: "/advertise", label: "Advertise", icon: "📢" },
    { href: "/pricing", label: "Pricing", icon: "⭐" },
  ];

  return (
    <HeaderShell
      items={categoryItems}
      bar={
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
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

          <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-700 xl:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900"
              >
                <span aria-hidden className="mr-1">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
            <Link
              href="/pricing"
              className="rounded-lg px-2.5 py-1.5 hover:bg-slate-100"
            >
              Pricing
            </Link>
            <Link
              href="/advertise"
              className="rounded-lg px-2.5 py-1.5 hover:bg-slate-100"
            >
              Advertise
            </Link>
          </nav>

          <div className="flex items-center gap-2 text-sm font-medium">
            <MobileMenu
              links={menuLinks}
              categories={categoryItems}
              account={
                user
                  ? {
                      href: user.role === "ADMIN" ? "/admin" : "/dashboard",
                      label:
                        user.role === "ADMIN" ? "Admin panel" : "My dashboard",
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
                <div className="hidden items-center gap-2 xl:flex">
                  <Link
                    href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                    className="rounded-lg px-2 py-1 hover:text-slate-900"
                  >
                    {user.role === "ADMIN" ? "Admin" : "Dashboard"}
                  </Link>
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
              <>
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
              </>
            )}
          </div>
        </div>
      }
    />
  );
}
