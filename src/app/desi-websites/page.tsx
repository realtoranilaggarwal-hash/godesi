import type { Metadata } from "next";
import Link from "next/link";
import { SiteVoteButton } from "@/components/SiteVoteButton";
import { DESI_WEBSITE_LISTS, siteKey, siteVoteCounts, type Site } from "@/lib/desiWebsites";

export const metadata: Metadata = {
  title: "Best desi websites in the USA",
  description:
    "The best desi websites in the USA in one list: Indian business directories, desi classifieds, DJs, events, jobs and Indian-American newspapers.",
  alternates: { canonical: "/desi-websites" },
};

export const revalidate = 300;

function SiteList({
  title,
  sites,
  votes,
}: {
  title: string;
  sites: Site[];
  votes: Record<string, number>;
}) {
  const ranked = [...sites].sort(
    (a, b) => (votes[siteKey(b.url)] ?? 0) - (votes[siteKey(a.url)] ?? 0),
  );
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-slate-900">{title}</h2>
      <ul className="mt-3 divide-y divide-slate-100">
        {ranked.map((site) => (
          <li key={site.name} className="flex items-center gap-3 py-2">
            <SiteVoteButton siteKey={siteKey(site.url)} count={votes[siteKey(site.url)] ?? 0} />
            <div className="min-w-0">
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
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function DesiWebsitesPage() {
  const votes = await siteVoteCounts();
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
      <p className="text-sm text-slate-600">
        Tap ▲ on the sites you find useful. The most-voted rise to the top of each list.
      </p>
      {DESI_WEBSITE_LISTS.map((list) => (
        <SiteList key={list.title} title={list.title} sites={list.sites} votes={votes} />
      ))}
      <p className="text-sm text-slate-600">
        Run a desi website that should be here?{" "}
        <Link href="/contact" className="font-semibold text-indigo-600 hover:underline">Tell us</Link>.
      </p>
    </div>
  );
}
