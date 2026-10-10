import Image from "next/image";
import Link from "next/link";
import type { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { effectivePlan } from "@/lib/plans";
import { getCategoryTree } from "@/lib/directory";
import { optionalRead } from "@/lib/resilient";
import { unreadCount } from "@/lib/notifications";
import { gradientFor, softFor } from "@/lib/categories";
import { Badge } from "@/components/ui";
import { HeaderShell } from "@/components/HeaderShell";
import type { StripGroup } from "@/components/CategoryStrip";
import { MobileMenu } from "@/components/MobileMenu";
import { LocalePicker } from "@/components/LocalePicker";
import { LiveMediaChips } from "@/components/LiveMediaButtons";
import { PostFab } from "@/components/PostFab";
import { displayCurrency } from "@/lib/displayCurrency";
import { LocalWeather } from "@/components/LocalWeather";
import { greetingFor, requestGeo } from "@/lib/geo";
import { emailEnabled } from "@/lib/email";

const NAV = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/search", label: "Businesses", icon: "🏪" },
  { href: "/leads", label: "Leads", icon: "📋" },
  { href: "/events", label: "Events", icon: "🎟️" },
  { href: "/gigs", label: "Gigs", icon: "🛠️" },
  { href: "/blog", label: "Blog", icon: "✍️" },
  { href: "/real-estate", label: "Real Estate", icon: "🏢" },
  { href: "/rooms", label: "Rooms", icon: "🛋️" },
  { href: "/marketplace", label: "Buy & Sell", icon: "🛍️" },
  { href: "/wedding", label: "Wedding Services", icon: "💐" },
  { href: "/religious", label: "Temples", icon: "🛕" },
  { href: "/connect", label: "Connect", icon: "🤝" },
  { href: "/clubs", label: "Clubs", icon: "🎤" },
  { href: "/people", label: "People", icon: "👥" },
  { href: "/professionals", label: "Professionals", icon: "👔" },
  { href: "/news", label: "News", icon: "📰" },
  { href: "/complaints", label: "File a complaint", icon: "⚠️" },
  { href: "/trending", label: "Trending", icon: "🔥" },
  { href: "/desi-elite", label: "GoDesi Elite", icon: "🏆" },
  { href: "/leaderboard", label: "Top contributors", icon: "🏅" },
];

/** Chips beside the search box, for pages the main nav has no room for. */
/** Header strip sections; directory categories not listed here land in "More". */
const STRIP_GROUPS: StripGroup[] = [
  { id: "explore", label: "Explore", icon: "✨" },
  { id: "home", label: "Home & family", icon: "🏠" },
  { id: "business", label: "Business & money", icon: "💼" },
  { id: "lifestyle", label: "Events, food & travel", icon: "🎉" },
  { id: "community", label: "Shopping & community", icon: "🛍️" },
  { id: "more", label: "More", icon: "➕" },
];

const STRIP_SECTION_OF: Record<string, string> = {
  "home-services": "home",
  "care-services": "home",
  "real-estate": "home",
  "rooms-roommates": "home",
  "health-medical": "home",
  "auto-services": "home",
  construction: "home",
  "business-services": "business",
  professionals: "business",
  "financial-services": "business",
  jobs: "business",
  "trade-sourcing": "business",
  "it-training": "business",
  education: "business",
  "events-wedding": "lifestyle",
  "food-catering": "lifestyle",
  "beauty-lifestyle": "lifestyle",
  travel: "lifestyle",
  "shops-retail": "community",
  "buy-sell": "community",
  "religious-services": "community",
  "community-orgs": "community",
};

/** Promoted pages beside the search box; any that don't fit stay under "More". */
const PROMO_LINKS = [
  { href: "/search", label: "Directory", icon: "🏪" },
  { href: "/leads", label: "Leads", icon: "📋" },
  { href: "/events", label: "Events", icon: "🎟️" },
  { href: "/clubs", label: "Clubs", icon: "🎤" },
  { href: "/deals", label: "Deals", icon: "🏷️" },
  { href: "/shop", label: "Shop", icon: "🛍️" },
  { href: "/gigs", label: "Gigs", icon: "🛠️" },
  { href: "/resources", label: "Resources", icon: "🔗" },
  { href: "/advertise", label: "Advertise", icon: "📢" },
];

/** Everyday pages at the end of the category line. */
const STRIP_LINKS = [
  { href: "/trending", label: "Trending hashtags", icon: "🔥" },
  { href: "/festivals", label: "Festival calendar", icon: "🪔" },
  { href: "/visa-bulletin", label: "Visa Bulletin", icon: "🛂" },
  { href: "/usd-to-inr", label: "Dollar to rupee today", icon: "💱" },
  { href: "/blog", label: "Blog", icon: "✍️" },
  { href: "/guide", label: "City guides", icon: "🗺️" },
  { href: "/people", label: "Community", icon: "👥" },
  { href: "/connect", label: "Connect", icon: "🤝" },
  { href: "/buzz", label: "#godesi social wall", icon: "🌍" },
];

/** Admins land on the full panel, moderators on the content desk. */
function staffHome(user: { role: Role }) {
  if (user.role === "ADMIN") return "/admin";
  return user.role === "MODERATOR" ? "/admin/content" : "/dashboard";
}

function staffLabel(
  user: { role: Role },
  staffText: string,
  memberText: string,
) {
  if (user.role === "ADMIN") return staffText;
  return user.role === "MODERATOR" ? "Content desk" : memberText;
}

export async function SiteHeader() {
  // The header decorates every page, including ones that need no data: if the
  // database is unreachable it renders signed-out rather than taking them down.
  const [user, categories] = await Promise.all([
    optionalRead(() => getCurrentUser(), null),
    getCategoryTree(),
  ]);
  const unread = user ? await optionalRead(() => unreadCount(user.id), 0) : 0;
  const geo = requestGeo();
  const firstName = user ? (user.name || user.email).split(/[\s@]/)[0] : null;

  const categoryItems = [
    {
      href: "/categories",
      label: "All categories",
      icon: "🧭",
      className:
        "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    },
    {
      href: "/events",
      group: "explore",
      label: "Events",
      icon: "🎟️",
      className:
        "bg-gradient-to-r from-rose-600 to-pink-500 text-white hover:opacity-90",
    },
    {
      href: "/clubs",
      group: "explore",
      label: "Clubs",
      icon: "🎤",
      className:
        "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white hover:opacity-90",
    },
    {
      href: "/gigs",
      group: "explore",
      label: "Gigs",
      icon: "🛠️",
      className:
        "bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:opacity-90",
    },
    {
      href: "/blog",
      group: "explore",
      label: "Blog",
      icon: "✍️",
      className:
        "bg-gradient-to-r from-slate-900 to-indigo-800 text-white hover:opacity-90",
    },
    {
      href: "/desi-elite",
      group: "explore",
      label: "Desi Elite",
      icon: "🏆",
      className:
        "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 hover:opacity-90",
    },
    ...categories.map((category) => ({
      group: STRIP_SECTION_OF[category.slug] ?? "more",
      href: `/categories/${category.slug}`,
      label: category.name,
      icon: category.icon,
      className: `bg-gradient-to-r ${gradientFor(category.color)} text-white opacity-90 hover:opacity-100`,
    })),
  ];
  const pickerGroups = categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    icon: category.icon,
    className: softFor(category.color),
    children: category.children.map((child) => ({
      slug: child.slug,
      name: child.name,
    })),
  }));
  const menuLinks = [
    ...NAV,
    { href: "/journalists", label: "Local journalists", icon: "🗞️" },
    { href: "/buzz", label: "#godesi wall", icon: "🌍" },
    { href: "/alumni", label: "Find batchmates", icon: "🎓" },
    { href: "/resources", label: "Resources", icon: "🔗" },
    { href: "/deals", label: "Deals", icon: "🏷️" },
    { href: "/shop", label: "Shop", icon: "🛍️" },
    { href: "/festivals", label: "Festival calendar", icon: "🪔" },
    { href: "/visa-bulletin", label: "Visa Bulletin", icon: "🛂" },
    { href: "/usd-to-inr", label: "Dollar to rupee today", icon: "💱" },
    { href: "/guide", label: "City guides", icon: "🗺️" },
    { href: "/marketing", label: "Free marketing & SEO", icon: "🌐" },
    { href: "/advertise", label: "Advertise", icon: "📢" },
    { href: "/pricing", label: "Pricing", icon: "⭐" },
    { href: "/rewards", label: "Refer & earn", icon: "🎁" },
  ];

  return (
    <>
      <PostFab signedIn={Boolean(user)} />
      <HeaderShell
        items={categoryItems}
        groups={STRIP_GROUPS}
        links={STRIP_LINKS}
        topRight={
          <>
            {firstName ? (
              <span className="truncate text-xs font-semibold text-white/85">
                {greetingFor(geo.timezone)}, {firstName} 👋
              </span>
            ) : null}
            <LocalWeather />
          </>
        }
        bar={
          <div className="relative mx-auto flex max-w-screen-2xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4">
            <Link href="/" className="shrink-0" aria-label="Godesi home">
              <Image
                src="/logo-godesi.png"
                alt="Godesi"
                width={1355}
                height={400}
                // Without this the optimizer was asked for a 3840px copy of a 120px logo.
                sizes="122px"
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

            <LiveMediaChips className="hidden lg:flex" />

            {/* Chips that don't fit wrap out of the fixed-height row instead of
              pushing the account buttons off-screen; "More" lists them all. */}
            <nav
              aria-label="Popular on GoDesi"
              className="hidden h-8 min-w-0 flex-1 flex-wrap content-start items-center gap-x-1 gap-y-4 overflow-hidden text-xs font-semibold lg:flex"
            >
              {PROMO_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1.5 text-slate-700 hover:bg-slate-200"
                >
                  <span aria-hidden className="mr-1">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
            </nav>
            <details className="relative hidden shrink-0 lg:block">
              <summary className="cursor-pointer list-none whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 [&::-webkit-details-marker]:hidden">
                More ▾
              </summary>
              <div className="absolute right-0 z-50 mt-2 grid w-96 grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-2 text-xs font-semibold shadow-lg">
                {[...PROMO_LINKS, ...STRIP_LINKS].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="truncate rounded-lg px-2 py-1.5 text-slate-700 hover:bg-slate-100"
                  >
                    <span aria-hidden className="mr-1">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </details>

            <div className="ml-auto flex shrink-0 items-center gap-1 text-sm font-medium sm:gap-2">
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
                groups={pickerGroups}
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
              <span className="max-[380px]:hidden">
                <LocalePicker currency={displayCurrency()} />
              </span>
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
                      unread
                        ? `${unread} unread notifications`
                        : "Notifications"
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
                    title="View and edit my profile"
                    className="flex shrink-0 items-center gap-1.5 rounded-full hover:bg-slate-100 lg:border lg:border-slate-200 lg:py-0.5 lg:pl-0.5 lg:pr-2.5"
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
                    <span className="hidden whitespace-nowrap text-xs font-semibold text-slate-700 lg:inline">
                      ✏️ My profile
                    </span>
                  </Link>
                  <div className="hidden items-center gap-2 sm:flex">
                    <span className="hidden 2xl:inline-flex">
                      <Badge
                        tone={
                          effectivePlan(user) === "FREE" ? "slate" : "indigo"
                        }
                      >
                        {effectivePlan(user)}
                      </Badge>
                    </span>
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="rounded-lg px-2 py-1 font-semibold hover:text-slate-900"
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
      {user && !user.emailVerifiedAt && emailEnabled() ? (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm text-amber-900">
            <span>
              📧 One step left: enter the 6-digit code we emailed to{" "}
              <span className="font-semibold">{user.email}</span>.
            </span>
            <Link
              href="/verify-email"
              className="rounded-lg bg-amber-500 px-3 py-1 font-bold text-white hover:bg-amber-600"
            >
              Enter my code
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
