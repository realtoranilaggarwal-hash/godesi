import Image from "next/image";
import Link from "next/link";
import { TelegramJoin } from "@/components/TelegramJoin";
import { QUORA_SPACE, socialLinks } from "@/lib/site";
import { FooterBanner } from "@/components/Banners";
import { TrafficCounter } from "@/components/TrafficCounter";
import { LocalePicker } from "@/components/LocalePicker";
import { displayCurrency } from "@/lib/displayCurrency";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";
import { trafficReportUrl } from "@/lib/traffic";

/** Five roughly equal columns, so no single list runs far past the others. */
const SECTIONS: { title: string; links: { href: string; label: string }[] }[] =
  [
    {
      title: "Directory",
      links: [
        { href: "/categories", label: "Categories" },
        { href: "/search", label: "Businesses" },
        { href: "/leads", label: "Leads" },
        { href: "/events", label: "Events" },
        { href: "/clubs", label: "Clubs" },
        { href: "/deals", label: "🏷️ Deals & offers" },
        { href: "/shop", label: "🛍️ Desi shop" },
        { href: "/gigs", label: "Gigs — services $5–$100" },
        { href: "/jobs", label: "Jobs & mini jobs" },
        { href: "/travel", label: "✈️ Travel — flights & hotels" },
        { href: "/venues", label: "Venues" },
        { href: "/resources", label: "Links" },
        { href: "/news", label: "News" },
        { href: "/blog", label: "Blog" },
        { href: "/guide", label: "City guides" },
        { href: "/find", label: "Search everything" },
      ],
    },
    {
      title: "For business",
      links: [
        { href: "/claim", label: "Claim godesi.com/yourname" },
        { href: "/signup", label: "List your business free" },
        { href: "/why-godesi", label: "Why Godesi" },
        { href: "/why-list", label: "Why list on Godesi?" },
        { href: "/pricing", label: "Membership plans" },
        {
          href: "/website",
          label: `Get a website for $${WEBSITE_OFFER.priceUsd}`,
        },
        { href: "/badge", label: "🏅 “Listed on Godesi” badge" },
        { href: "/advertise", label: "Advertise on Godesi" },
        { href: "/events/new", label: "Post an event" },
        { href: "/clubs/new", label: "Start a club" },
        { href: "/dashboard/deals", label: "Post a deal" },
        { href: "/dashboard/gigs", label: "Sell a gig" },
        { href: "/jobs/new", label: "Post a job" },
        { href: "/card", label: "🪪 Digital business cards" },
        { href: "/dashboard", label: "Dashboard" },
      ],
    },
    {
      title: "Community",
      links: [
        { href: "/connect", label: "Connect" },
        { href: "/chatter", label: "💬 GoDesi Chatter" },
        { href: "/rishta", label: "💍 Rishta — marriage profiles" },
        { href: "/rishta/new", label: "Post a Rishta profile" },
        { href: "/clubs", label: "🎤 Clubs & meetups" },
        { href: "/people", label: "People on GoDesi" },
        { href: "/professionals", label: "GoDesi Professionals" },
        { href: "/alumni", label: "Find your batchmates" },
        { href: "/buzz", label: "#godesi social wall" },
        { href: QUORA_SPACE, label: "GoDesi on Quora" },
        { href: "/news/report", label: "Share news" },
        { href: "/journalists", label: "Become a local journalist" },
        { href: "/rewards", label: "Refer & earn rewards" },
        { href: "/ambassador", label: "🤝 Become an ambassador" },
      ],
    },
    {
      title: "Live, media & daily",
      links: [
        { href: "/live-radio", label: "🎧 Listen live — desi radio" },
        { href: "/live-tv", label: "📺 Watch live — desi TV" },
        { href: "/games", label: "🎮 Free games" },
        { href: "/markets", label: "📈 Markets today" },
        { href: "/live/submit", label: "Add your radio or TV channel" },
        { href: "/desi-elite", label: "GoDesi Elite" },
        { href: "/desi-elite/apply", label: "Apply for GoDesi Elite" },
        { href: "/desi-elite/awards", label: "🏆 GoDesi Elite Awards" },
        { href: "/media", label: "🎙️ GoDesi Media" },
        { href: "/media/join", label: "Join the media team" },
        { href: "/leaderboard", label: "🏅 Top contributors" },
        { href: "/trending", label: "🔥 Trending hashtags" },
        { href: "/festivals", label: "🪔 Festival calendar" },
        { href: "/visa-bulletin", label: "🛂 Visa Bulletin for India" },
        { href: "/usd-to-inr", label: "💱 Dollar to rupee today" },
        { href: "/crypto-fear-greed", label: "😱 Crypto Fear & Greed" },
        { href: "/astrology", label: "🔮 Astrology guides" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/about", label: "About us" },
        { href: "/contact", label: "Contact us" },
        { href: "/faq", label: "FAQ" },
        { href: "/sitemap", label: "Sitemap" },
        { href: "/feeds", label: "📡 RSS feeds" },
        { href: "/report", label: "Report an issue" },
        { href: "/terms", label: "Terms of service" },
        { href: "/privacy", label: "Privacy policy" },
        { href: "/cookies", label: "Cookie policy" },
        { href: "/refunds", label: "Refund policy" },
        { href: "/safety", label: "Trust & safety" },
        { href: "/complaints", label: "⚠️ How to file a complaint" },
        { href: "/news/report?topic=consumer", label: "Post a consumer alert" },
      ],
    },
  ];

export function SiteFooter() {
  const socials = socialLinks();
  const statsUrl = trafficReportUrl();

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-screen-2xl px-4 pt-6">
        <FooterBanner />
      </div>
      <div className="mx-auto grid max-w-screen-2xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-6">
        <div>
          <Link href="/" aria-label="Godesi home">
            <Image
              src="/logo-godesi.png"
              alt="Godesi"
              width={1355}
              height={400}
              sizes="122px"
              className="h-9 w-auto"
            />
          </Link>
          <p className="mt-2 text-sm text-slate-600">
            The desi directory for businesses, buyer requirements, community
            events and daily news.
          </p>
          <p className="mt-3 text-sm text-slate-600">
            <Link
              href="/contact"
              className="font-semibold hover:text-slate-900"
            >
              Contact us →
            </Link>
          </p>

          <div className="mt-3">
            <TelegramJoin inline />
          </div>
          {socials.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {socials.map((social) => (
                <a
                  key={social.key}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-sm hover:border-slate-400 hover:bg-slate-50"
                >
                  <span aria-hidden>{social.icon}</span>
                </a>
              ))}
            </div>
          ) : null}
        </div>

        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-sm font-bold text-slate-900">{section.title}</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600 [&>li]:truncate">
              {section.links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("http") ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-slate-900"
                    >
                      {link.label} ↗
                    </a>
                  ) : (
                    <Link href={link.href} className="hover:text-slate-900">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
              {section.title === "Company" && statsUrl ? (
                <li>
                  <a
                    href={statsUrl}
                    {...(statsUrl.startsWith("/")
                      ? {}
                      : { target: "_blank", rel: "noreferrer" })}
                    className="hover:text-slate-900"
                  >
                    Live traffic stats
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Godesi. All rights reserved.</span>
          <TrafficCounter />
          <LocalePicker currency={displayCurrency()} open />
          <span>
            Designed by{" "}
            <a
              href="https://socialdada.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-slate-700 hover:text-slate-900"
            >
              SocialDada.com
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
