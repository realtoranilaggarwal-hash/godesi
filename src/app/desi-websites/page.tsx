import type { Metadata } from "next";
import Link from "next/link";
import { CLASSIFIEDS, NEWSPAPERS } from "@/lib/mediaPartners";

export const metadata: Metadata = {
  title: "Best desi websites in the USA",
  description:
    "The best desi websites in the USA in one list: Indian business directories, desi classifieds, DJs, events, jobs and Indian-American newspapers.",
  alternates: { canonical: "/desi-websites" },
};

type Site = { name: string; focus: string; url: string };

const GODESI: Site[] = [
  { name: "GoDesi business directory", focus: "Find desi-owned businesses near you", url: "/search" },
  { name: "GoDesi classifieds", focus: "Free ads: buy and sell, rooms, jobs, gigs", url: "/classifieds" },
  { name: "GoDesi weddings", focus: "Desi wedding vendors and free quotes", url: "/wedding" },
  { name: "GoDesi DJs", focus: "Indian DJs, dhol and sound", url: "/dj" },
  { name: "GoDesi events", focus: "Garba, Diwali, concerts and meetups", url: "/events" },
  { name: "GoDesi news", focus: "Desi community news", url: "/news" },
];

const NETWORK: Site[] = [
  { name: "DJs.wiki", focus: "The desi DJs directory", url: "https://djs.wiki" },
  { name: "Eventringer", focus: "Every desi event near you: festivals, concerts, garba", url: "https://eventringer.com" },
  { name: "Diwali.cc", focus: "Find a Diwali, Navratri or Holi celebration", url: "https://diwali.cc" },
  { name: "Indian Business Association", focus: "Find, support and grow Indian-owned businesses", url: "https://indianbusinessassociation.com" },
  { name: "Desi Who's Who", focus: "Desi who's who in America", url: "https://desiwhoswho.com" },
  { name: "Desi Newspaper", focus: "Desi headlines, filed by the community", url: "https://desinewspaper.com" },
  { name: "IT Placement Help", focus: "IT jobs and placement help for desis in the USA", url: "https://itplacement.help" },
  { name: "IT Placement Services", focus: "Desi IT staffing and corporate training", url: "https://itplacementservices.com" },
  { name: "RealEstateYP", focus: "Find a real estate agent near you", url: "https://realestateyp.com" },
  { name: "GoDesi Cards", focus: "Every desi business, one short link", url: "https://godesi.us" },
];

function SiteList({ title, sites }: { title: string; sites: Site[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-slate-900">{title}</h2>
      <ul className="mt-3 divide-y divide-slate-100">
        {sites.map((site) => (
          <li key={site.name} className="py-2">
            {site.url.startsWith("/") ? (
              <Link href={site.url} className="font-semibold text-indigo-600 hover:underline">
                {site.name}
              </Link>
            ) : (
              <a href={site.url} target="_blank" rel="noopener" className="font-semibold text-indigo-600 hover:underline">
                {site.name}
              </a>
            )}
            <span className="text-sm text-slate-600">: {site.focus}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function DesiWebsitesPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-600 p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-white/80">Desi websites</p>
        <h1 className="mt-1 text-3xl font-black sm:text-4xl">Best desi websites in the USA</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/90">
          Useful websites for Indian and South Asian families in America, all in
          one place: business directories, classifieds, wedding vendors, DJs,
          events, jobs and Indian-American newspapers. Bookmark this page and
          share it with someone new to the country.
        </p>
      </section>
      <SiteList title="GoDesi.com" sites={GODESI} />
      <SiteList title="Desi directories, events and jobs" sites={NETWORK} />
      <SiteList title="Desi classifieds sites" sites={CLASSIFIEDS} />
      <SiteList title="Indian-American newspapers" sites={NEWSPAPERS} />
      <p className="text-sm text-slate-600">
        Run a desi website that should be here?{" "}
        <Link href="/contact" className="font-semibold text-indigo-600 hover:underline">Tell us</Link>.
      </p>
    </div>
  );
}
