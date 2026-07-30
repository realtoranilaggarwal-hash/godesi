import Image from "next/image";
import Link from "next/link";
import { socialLinks } from "@/lib/site";
import { FooterBanner } from "@/components/Banners";
import { LocalePicker } from "@/components/LocalePicker";
import { displayCurrency } from "@/lib/displayCurrency";

/** Five roughly equal columns, so no single list runs far past the others. */
const SECTIONS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Directory",
    links: [
      { href: "/categories", label: "Categories" },
      { href: "/search", label: "Businesses" },
      { href: "/leads", label: "Leads" },
      { href: "/events", label: "Events" },
      { href: "/venues", label: "Venues" },
      { href: "/resources", label: "Resources" },
      { href: "/news", label: "News" },
      { href: "/blog", label: "Blog" },
      { href: "/find", label: "Search everything" },
    ],
  },
  {
    title: "For business",
    links: [
      { href: "/signup", label: "List your business free" },
      { href: "/why-list", label: "Why list on Godesi?" },
      { href: "/pricing", label: "Membership plans" },
      { href: "/website", label: "Get a website for $99" },
      { href: "/advertise", label: "Advertise on Godesi" },
      { href: "/events/new", label: "Post an event" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/connect", label: "Connect" },
      { href: "/alumni", label: "Find your batchmates" },
      { href: "/buzz", label: "#godesi social wall" },
      { href: "/news/report", label: "Share news" },
      { href: "/journalists", label: "Become a local journalist" },
      { href: "/rewards", label: "Refer & earn rewards" },
      { href: "/leaderboard", label: "🏅 Top contributors" },
      { href: "/safety", label: "Trust & safety" },
    ],
  },
  {
    title: "Live & media",
    links: [
      { href: "/live-radio", label: "🎧 Listen live — desi radio" },
      { href: "/live-tv", label: "📺 Watch live — desi TV" },
      { href: "/live/submit", label: "Add your radio or TV channel" },
      { href: "/live", label: "Live visitor map" },
      { href: "/desi-elite", label: "GoDesi Elite" },
      { href: "/desi-elite/apply", label: "Apply for GoDesi Elite" },
      { href: "/desi-elite/awards", label: "🏆 GoDesi Elite Awards" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact us" },
      { href: "/faq", label: "FAQ" },
      { href: "/sitemap", label: "Sitemap" },
      { href: "/report", label: "Report an issue" },
      { href: "/terms", label: "Terms of service" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/cookies", label: "Cookie policy" },
      { href: "/refunds", label: "Refund policy" },
    ],
  },
];

export function SiteFooter() {
  const socials = socialLinks();
  /** Public Umami dashboard, shown only when a share URL is configured. */
  const statsUrl = process.env.NEXT_PUBLIC_UMAMI_SHARE_URL;

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 pt-6">
        <FooterBanner />
      </div>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-6">
        <div>
          <Link href="/" aria-label="Godesi home">
            <Image
              src="/logo-godesi.png"
              alt="Godesi"
              width={1355}
              height={400}
              className="h-9 w-auto"
            />
          </Link>
          <p className="mt-2 text-sm text-slate-600">
            The desi directory for businesses, buyer requirements, community events
            and daily news.
          </p>
          <p className="mt-3 text-sm text-slate-600">
            <Link href="/contact" className="font-semibold hover:text-slate-900">
              Contact us →
            </Link>
          </p>
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
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-slate-900">
                    {link.label}
                  </Link>
                </li>
              ))}
              {section.title === "Live & media" && statsUrl ? (
                <li>
                  <a
                    href={statsUrl}
                    target="_blank"
                    rel="noreferrer"
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
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Godesi. All rights reserved.</span>
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
