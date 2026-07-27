import Link from "next/link";
import { SITE, socialLinks } from "@/lib/site";

const SECTIONS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Directory",
    links: [
      { href: "/categories", label: "Categories" },
      { href: "/search", label: "Businesses" },
      { href: "/leads", label: "Leads" },
      { href: "/events", label: "Events" },
      { href: "/news", label: "News" },
    ],
  },
  {
    title: "For business",
    links: [
      { href: "/signup", label: "List your business free" },
      { href: "/pricing", label: "Membership plans" },
      { href: "/advertise", label: "Advertise on Godesi" },
      { href: "/events/new", label: "Post an event" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/sitemap", label: "Sitemap" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms of service" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/cookies", label: "Cookie policy" },
      { href: "/refunds", label: "Refund policy" },
    ],
  },
];

export function SiteFooter() {
  const socials = socialLinks();

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 bg-clip-text text-xl font-black text-transparent">
            Godesi
          </p>
          <p className="mt-2 text-sm text-slate-600">
            The desi directory for businesses, buyer requirements, community events
            and daily news.
          </p>
          <p className="mt-3 text-sm text-slate-600">
            <a href={`mailto:${SITE.supportEmail}`} className="hover:text-slate-900">
              {SITE.supportEmail}
            </a>
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
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Godesi. All rights reserved.</span>
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
