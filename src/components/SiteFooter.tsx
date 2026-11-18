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

const statsUrl = trafficReportUrl();

/** Five roughly equal columns, so no single list runs far past the others. */
const SECTIONS: { title: string; links: { href: string; label: string }[] }[] =
  [
    {
      title: "Directory",
      links: [
        { href: "/blog", label: "Blog" },
        { href: "/bollywood", label: "Bollywood news" },
        { href: "/search", label: "Cards" },
        { href: "/categories", label: "Categories" },
        { href: "/guide", label: "City guides" },
        { href: "/clubs", label: "Clubs" },
        { href: "/deals", label: "🏷️ Deals & offers" },
        { href: "/shop", label: "🛍️ Desi shop" },
        { href: "/events", label: "Events" },
        { href: "/classifieds", label: "📣 Free desi classifieds" },
        { href: "/gigs", label: "Gigs — services $5–$100" },
        { href: "/jobs", label: "Jobs & mini jobs" },
        { href: "/leads", label: "Leads" },
        { href: "/resources", label: "Links" },
        { href: "/news", label: "News" },
        { href: "/find", label: "Search everything" },
        { href: "/travel", label: "✈️ Travel — flights & hotels" },
        { href: "/venues", label: "Venues" },
      ],
    },
    {
      title: "For business",
      links: [
        { href: "/advertise", label: "Advertise on Godesi" },
        { href: "/claim", label: "Claim godesi.com/yourname" },
        { href: "/dashboard", label: "Dashboard" },
        { href: "/tools", label: "🧰 Free business tools" },
        {
          href: "/website",
          label: `Get a website for $${WEBSITE_OFFER.priceUsd}`,
        },
        { href: "/signup", label: "List your business free" },
        { href: "/badge", label: "🏅 “Listed on Godesi” badge" },
        { href: "/pricing", label: "Membership plans" },
        { href: "/advertise/proposal", label: "New Year's Eve partnership — $500 / $2,000" },
        { href: "/dashboard/deals", label: "Post a deal" },
        { href: "/listings/new?kind=MARKETPLACE", label: "Post a free classified ad" },
        { href: "/jobs/new", label: "Post a job" },
        { href: "/events/new", label: "Post an event" },
        { href: "/dashboard/gigs", label: "Sell a gig" },
        { href: "/clubs/new", label: "Start a club" },
        { href: "/walloffame", label: "🧱 Wall of Fame — $10 a brick" },
        { href: "/website/examples", label: "Website before & after examples" },
        { href: "/why-godesi", label: "Why Godesi" },
        { href: "/why-list", label: "Why list on Godesi?" },
      ],
    },
    {
      title: "Community",
      links: [
        { href: "/ambassador/dashboard", label: "📊 Ambassador dashboard" },
        { href: "/ambassador", label: "🤝 Become an ambassador" },
        { href: "/connect", label: "Connect" },
        { href: "/alumni", label: "Find your batchmates" },
        { href: "/chatter", label: "💬 GoDesi Chatter" },
        { href: QUORA_SPACE, label: "GoDesi on Quora" },
        { href: "/professionals", label: "GoDesi Professionals" },
        { href: "/buzz", label: "#godesi social wall" },
        { href: "/earn", label: "💸 Make money online" },
        { href: "/people", label: "People on GoDesi" },
        { href: "/rishta/new", label: "Post a Rishta profile" },
        { href: "/rewards", label: "Refer & earn rewards" },
        { href: "/rishta", label: "💍 Rishta — marriage profiles" },
        { href: "/news/report", label: "Share news" },
      ],
    },
    {
      title: "Live, media & daily",
      links: [
        { href: "/live/submit", label: "Add your radio or TV channel" },
        { href: "/desi-elite/apply", label: "Apply for GoDesi Elite" },
        { href: "/astrology", label: "🔮 Astrology guides" },
        { href: "/pooja", label: "🙏 Book a video pooja" },
        { href: "/crypto-fear-greed", label: "😱 Crypto Fear & Greed" },
        { href: "/usd-to-inr", label: "💱 Dollar to rupee today" },
        { href: "/festivals", label: "🪔 Festival calendar" },
        { href: "/games", label: "🎮 Free games" },
        { href: "/desi-elite", label: "GoDesi Elite" },
        { href: "/desi-elite/awards", label: "🏆 GoDesi Elite Awards" },
        { href: "/media", label: "🎙️ GoDesi Media" },
        { href: "/media/join", label: "Join the media team" },
        { href: "/live-radio", label: "🎧 Listen live — desi radio" },
        { href: "/markets", label: "📈 Markets today" },
        { href: "/leaderboard", label: "🏅 Top contributors" },
        { href: "/trending", label: "🔥 Trending hashtags" },
        { href: "/visa-bulletin", label: "🛂 Visa Bulletin for India" },
        { href: "/live-tv", label: "📺 Watch live — desi TV" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/about", label: "About us" },
        { href: "/contact", label: "Contact us" },
        { href: "/cookies", label: "Cookie policy" },
        { href: "/faq", label: "FAQ" },
        { href: "/complaints", label: "⚠️ How to file a complaint" },
        ...(statsUrl ? [{ href: statsUrl, label: "Live traffic stats" }] : []),
        { href: "/news/report?topic=consumer", label: "Post a consumer alert" },
        { href: "/privacy", label: "Privacy policy" },
        { href: "/refunds", label: "Refund policy" },
        { href: "/report", label: "Report an issue" },
        { href: "/feeds", label: "📡 RSS feeds" },
        { href: "/sitemap", label: "Sitemap" },
        { href: "/terms", label: "Terms of service" },
        { href: "/safety", label: "Trust & safety" },
      ],
    },
  ];

export function SiteFooter() {
  const socials = socialLinks();

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-screen-2xl px-4 pt-6">
        <Link
          href="/journalists"
          className="mb-4 block text-center text-xs font-semibold text-slate-600 hover:text-indigo-700"
        >
          📡 Post on Godesi — your story is syndicated to{" "}
          <span className="text-violet-700">Yahoo News</span> ·{" "}
          <span className="text-emerald-600">Feedly</span> ·{" "}
          <span className="text-sky-600">Inoreader</span> ·{" "}
          <span className="text-red-600">Flipboard</span> &amp; every RSS
          reader
        </Link>
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
