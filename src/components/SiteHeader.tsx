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
import { displayCurrency } from "@/lib/displayCurrency";
import { LocalWeather } from "@/components/LocalWeather";
import { greetingFor, requestGeo } from "@/lib/geo";
import { emailEnabled } from "@/lib/email";

const NAV = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/search", label: "Cards", icon: "🪪" },
  { href: "/leads", label: "Leads", icon: "📋" },
  { href: "/events", label: "Events", icon: "🎟️" },
  { href: "/gigs", label: "Gigs", icon: "🛠️" },
  { href: "/jobs", label: "Jobs", icon: "💼" },
  { href: "/travel", label: "Travel", icon: "✈️" },
  { href: "/blog", label: "Blog", icon: "✍️" },
  { href: "/natural-healing", label: "Natural Healing", icon: "🌿" },
  { href: "/real-estate", label: "Real Estate", icon: "🏢" },
  { href: "/rooms", label: "Rooms", icon: "🛋️" },
  { href: "/marketplace", label: "Buy & Sell", icon: "🛍️" },
  { href: "/classifieds", label: "Classifieds", icon: "📣" },
  { href: "/wedding", label: "Wedding Services", icon: "💐" },
  { href: "/religious", label: "Temples", icon: "🛕" },
  { href: "/connect", label: "Connect", icon: "🤝" },
  { href: "/chatter", label: "Chatter", icon: "💬" },
  { href: "/rishta", label: "Rishta", icon: "💍" },
  { href: "/clubs", label: "Clubs", icon: "🎤" },
  { href: "/people", label: "People", icon: "👥" },
  { href: "/professionals", label: "Professionals", icon: "👔" },
  { href: "/news", label: "News", icon: "📰" },
  { href: "/bollywood", label: "Bollywood", icon: "🎬" },
  { href: "/complaints", label: "File a complaint", icon: "⚠️" },
  { href: "/trending", label: "Trending", icon: "🔥" },
  { href: "/desi-elite", label: "GoDesi Elite", icon: "🏆" },
  { href: "/leaderboard", label: "Top contributors", icon: "🏅" },
];

/**
 * Header menu, one short word per section so most fit on one line. Sections
 * with pages open a list; ones without are plain links. Directory categories
 * not placed by `STRIP_SECTION_OF` land in "More".
 */
const STRIP_GROUPS: StripGroup[] = [
  { id: "home", label: "Home", icon: "🏠", href: "/" },
  { id: "explore", label: "Explore", icon: "✨" },
  { id: "astrology", label: "Astrology", icon: "🔮", href: "/astrology" },
  { id: "community", label: "Community", icon: "👥", href: "/people" },
  { id: "cards", label: "Cards", icon: "🪪", href: "/search" },
  {
    id: "classifieds",
    label: "Classifieds",
    icon: "📣",
    href: "/classifieds",
  },
  { id: "events", label: "Events", icon: "🎟️", href: "/events" },
  { id: "it", label: "IT", icon: "💻", href: "/categories/it-training" },
  { id: "clubs", label: "Clubs", icon: "🎤", href: "/clubs" },
  { id: "wedding", label: "Wedding", icon: "💐", href: "/wedding" },
  { id: "deals", label: "Deals", icon: "🏷️", href: "/deals" },
  { id: "shop", label: "Shop", icon: "🛍️", href: "/shop" },
  {
    id: "property",
    label: "Real Estate",
    icon: "🏢",
    href: "/real-estate",
  },
  { id: "jobs", label: "Jobs", icon: "💼", href: "/jobs" },
  { id: "travel", label: "Travel", icon: "✈️", href: "/travel" },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: "🛒",
    href: "/marketplace",
  },
  {
    id: "professionals",
    label: "Professionals",
    icon: "👔",
    href: "/professionals",
  },
  { id: "news", label: "News", icon: "📰", href: "/news" },
  { id: "business", label: "Business", icon: "📈" },
  { id: "household", label: "Household", icon: "🧰" },
  { id: "lifestyle", label: "Lifestyle", icon: "💄" },
  { id: "more", label: "More", icon: "➕" },
];

/** Pages listed under each header section, before its directory categories. */
const SECTION_LINKS: Record<string, { href: string; label: string; icon: string }[]> = {
  explore: [
    { href: "/live-radio", label: "Live Radio", icon: "🎧" },
    { href: "/live-tv", label: "Live TV", icon: "📺" },
    { href: "/resources", label: "Links", icon: "🔗" },
    { href: "/search", label: "Cards", icon: "🪪" },
    { href: "/tools", label: "Tools", icon: "🧰" },
    { href: "/earn", label: "Earn", icon: "💸" },
    { href: "/trending", label: "Trending hashtags", icon: "🔥" },
    { href: "/usd-to-inr", label: "Dollar to rupee today", icon: "💱" },
    { href: "/crypto-fear-greed", label: "Crypto Fear & Greed", icon: "😱" },
    { href: "/buzz", label: "#godesi social wall", icon: "🌍" },
  ],
  community: [
    { href: "/religious", label: "Temples", icon: "🛕" },
    { href: "/festivals", label: "Festival calendar", icon: "🪔" },
    { href: "/pooja", label: "Video pooja", icon: "🙏" },
    { href: "/natural-healing", label: "Natural Healing", icon: "🌿" },
    { href: "/complaints", label: "File a complaint", icon: "⚠️" },
    { href: "/guide", label: "City guides", icon: "🗺️" },
    { href: "/chatter", label: "Chatter", icon: "💬" },
  ],
  classifieds: [
    { href: "/leads", label: "Leads", icon: "📋" },
    { href: "/marketplace", label: "Buy & Sell", icon: "🛒" },
    { href: "/shop", label: "Shop", icon: "🛍️" },
    { href: "/deals", label: "Deals", icon: "🏷️" },
  ],
  wedding: [
    { href: "/connect", label: "Connect", icon: "🤝" },
    { href: "/chatter", label: "Chatter — are you a Gapodi?", icon: "💬" },
    { href: "/rishta", label: "Rishta", icon: "💍" },
  ],
  travel: [
    { href: "/guide", label: "City guides", icon: "🗺️" },
    { href: "/visa-bulletin", label: "Visa Bulletin", icon: "🛂" },
  ],
  home: [
    { href: "/blog", label: "Blog", icon: "✍️" },
    { href: "/tools", label: "Free business tools", icon: "🧰" },
    { href: "/pricing", label: "Pricing", icon: "⭐" },
    { href: "/advertise", label: "Advertise", icon: "📢" },
    { href: "/marketing", label: "Free marketing & SEO", icon: "🌐" },
  ],
  it: [
    {
      href: "/categories/business-services-software-companies",
      label: "Software companies",
      icon: "🖥️",
    },
    { href: "/desi-websites", label: "Desi websites", icon: "🌐" },
    { href: "/marketing", label: "Free marketing & SEO", icon: "📈" },
  ],
  property: [{ href: "/rooms", label: "Rooms", icon: "🛋️" }],
  jobs: [{ href: "/gigs", label: "Gigs", icon: "🛠️" }],
  professionals: [
    { href: "/desi-elite", label: "GoDesi Elite", icon: "🏆" },
  ],
  news: [{ href: "/bollywood", label: "Bollywood", icon: "🎬" }],
};

const ASTROLOGY_LINKS = [
  { href: "/astrology/horoscope", label: "Today's horoscope", icon: "🔮" },
  { href: "/astrology/panchang", label: "Daily Panchang", icon: "🪔" },
  { href: "/astrology/kundli-calculator", label: "Free Kundli", icon: "📜" },
  {
    href: "/astrology/kundli-matching-for-marriage",
    label: "Kundli matching for marriage",
    icon: "💞",
  },
  {
    href: "/categories/religious-services-astrologers",
    label: "Find an astrologer",
    icon: "🧑‍🏫",
  },
  {
    href: "/astrology/muhurat-for-weddings-and-griha-pravesh",
    label: "Wedding & Griha Pravesh muhurat",
    icon: "🕉️",
  },
  {
    href: "/astrology/rahu-kaal-explained",
    label: "Rahu Kaal explained",
    icon: "⛔",
  },
  { href: "/festivals", label: "Festival calendar", icon: "🎉" },
  { href: "/pooja", label: "Book a video pooja", icon: "🙏" },
  {
    href: "/blog/what-is-panchang-tithi-nakshatra-rahu-kaal-explained",
    label: "What is Panchang?",
    icon: "📖",
  },
  { href: "/astrology", label: "All astrology guides", icon: "✨" },
];

const STRIP_SECTION_OF: Record<string, string> = {
  "home-services": "household",
  "care-services": "household",
  "health-medical": "household",
  "auto-services": "household",
  construction: "household",
  "real-estate": "property",
  "rooms-roommates": "property",
  "business-services": "business",
  "financial-services": "business",
  "trade-sourcing": "business",
  "it-training": "it",
  education: "business",
  professionals: "professionals",
  jobs: "jobs",
  "events-wedding": "wedding",
  travel: "travel",
  "food-catering": "lifestyle",
  "beauty-lifestyle": "lifestyle",
  "shops-retail": "shop",
  "buy-sell": "marketplace",
  "religious-services": "community",
  "community-orgs": "community",
};

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
    ...Object.entries(SECTION_LINKS).flatMap(([group, links]) =>
      links.map((link) => ({
        ...link,
        group,
        className: "bg-slate-100 text-slate-700 hover:bg-slate-200",
      })),
    ),
    ...ASTROLOGY_LINKS.map((link) => ({
      ...link,
      group: "astrology",
      className:
        "bg-gradient-to-r from-orange-500 to-amber-400 text-white hover:opacity-90",
    })),
    ...categories.map((category) => ({
      group: STRIP_SECTION_OF[category.slug] ?? "more",
      href: `/categories/${category.slug}`,
      label: category.name,
      icon: category.icon,
      children: category.children.map((child) => ({
        href: `/categories/${child.slug}`,
        label: child.name,
      })),
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
    { href: "/rishta/new", label: "Post a Rishta profile", icon: "💍" },
    { href: "/resources", label: "Links", icon: "🔗" },
    { href: "/deals", label: "Deals", icon: "🏷️" },
    { href: "/shop", label: "Shop", icon: "🛍️" },
    { href: "/festivals", label: "Festival calendar", icon: "🪔" },
    { href: "/pooja", label: "Video pooja", icon: "🙏" },
    { href: "/visa-bulletin", label: "Visa Bulletin", icon: "🛂" },
    { href: "/usd-to-inr", label: "Dollar to rupee today", icon: "💱" },
    { href: "/crypto-fear-greed", label: "Crypto Fear & Greed", icon: "😱" },
    { href: "/guide", label: "City guides", icon: "🗺️" },
    { href: "/marketing", label: "Free marketing & SEO", icon: "🌐" },
    { href: "/advertise", label: "Advertise", icon: "📢" },
    { href: "/pricing", label: "Pricing", icon: "⭐" },
    { href: "/tools", label: "Free business tools", icon: "🧰" },
    { href: "/earn", label: "Make money online", icon: "💸" },
    { href: "/rewards", label: "Refer & earn", icon: "🎁" },
  ];

  return (
    <>
      <HeaderShell
        items={categoryItems}
        groups={STRIP_GROUPS}
        topRight={
          <>
            {user ? null : (
              <span className="flex items-center gap-2 sm:hidden">
                <Link
                  href="/signup"
                  className="whitespace-nowrap rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 px-2.5 py-1 text-xs font-black text-white"
                >
                  🎉 Register
                </Link>
                <Link
                  href="/login"
                  className="whitespace-nowrap text-xs font-semibold text-white underline"
                >
                  Log in
                </Link>
              </span>
            )}
            {firstName ? (
              <span className="truncate text-xs font-semibold text-white/85">
                {greetingFor(geo.timezone)}, {firstName} 👋
              </span>
            ) : null}
            <span className={user ? "" : "max-sm:hidden"}>
              <LocalWeather />
            </span>
          </>
        }
        bar={
          <div className="relative mx-auto flex max-w-screen-2xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4 lg:pr-16">
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
                    className="whitespace-nowrap rounded-xl border-2 border-rose-400 bg-white px-3 py-1 font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    🔑 Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="whitespace-nowrap rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 px-3 py-1.5 font-black text-white shadow-sm hover:opacity-90"
                  >
                    🎉 Register free
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
