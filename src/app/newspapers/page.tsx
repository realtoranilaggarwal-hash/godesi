import type { Metadata } from "next";
import Link from "next/link";
import { Card, LinkButton } from "@/components/ui";
import { metaDescription, pageTitle } from "@/lib/seo";

export const revalidate = 86400;

const NEWSPAPERS: { name: string; focus: string; url: string }[] = [
  { name: "News India Times", focus: "National Indian-American news", url: "https://newsindiatimes.com" },
  { name: "Desi Talk", focus: "New York, New Jersey, Connecticut & Chicago", url: "https://www.desitalk.com" },
  { name: "The Indian American", focus: "Community stories & features", url: "https://newsindiatimes.com" },
  { name: "Gujarat Times", focus: "Gujarati-speaking community", url: "https://newsindiatimes.com" },
  { name: "India Tribune", focus: "Chicago-based Indian-American newspaper", url: "https://www.indiatribune.com" },
  { name: "India-West", focus: "West Coast Indian-American news", url: "https://www.indiawest.com" },
  { name: "India Journal", focus: "Southern California", url: "https://www.indiajournal.com" },
  { name: "The Indian Panorama", focus: "New York & Dallas; news and classifieds", url: "https://www.theindianpanorama.news" },
  { name: "India Currents", focus: "Journalism & community issues", url: "https://indiacurrents.com" },
  { name: "India New England", focus: "New England Indian-American community", url: "https://indianewengland.com" },
  { name: "Khabar", focus: "Atlanta & the Southeast", url: "https://www.khabar.com" },
  { name: "Desh-Videsh", focus: "Florida & the broader diaspora", url: "https://www.deshvidesh.com" },
  { name: "Khaas Baat", focus: "Florida Indian community", url: "https://www.khaasbaat.com" },
  { name: "The South Asian Times", focus: "New York metropolitan area", url: "https://thesouthasiantimes.info" },
  { name: "India Herald", focus: "Houston-area Indian community", url: "https://india-herald.com" },
  { name: "India Post", focus: "News & community coverage", url: "https://www.indiapost.com" },
  { name: "Indus Business Journal", focus: "Business & professional community", url: "https://www.indusbusinessjournal.com" },
  { name: "The Asian Era", focus: "Tri-state & Indian diaspora", url: "https://www.asianeraonline.com" },
  { name: "Panjab Express", focus: "Punjabi-language & English news", url: "https://www.panjabexpress.com" },
  { name: "India Bulletin", focus: "Chicago-area South Asian community", url: "https://www.indiabulletinusa.com" },
  { name: "India Life & Style", focus: "Indian-American lifestyle", url: "https://www.indianlifeandstyle.com" },
  { name: "Gujarati Samachar", focus: "Gujarati community in the USA", url: "https://www.gujaratsamachar.com" },
  { name: "Sandesh", focus: "Gujarati-language readership", url: "https://www.sandesh.com" },
  { name: "Telugu Naadi", focus: "Telugu-speaking diaspora", url: "https://www.telugunaadi.com" },
  { name: "India Abroad", focus: "Long-running diaspora newspaper", url: "https://www.indiaabroad.com" },
  { name: "Little India", focus: "Diaspora news, features & community", url: "https://www.littleindia.com" },
];

const CLASSIFIEDS: { name: string; focus: string; url: string }[] = [
  { name: "Sulekha Classifieds", focus: "Rentals, roommates, jobs, services, used cars", url: "https://us.classifieds.sulekha.com" },
  { name: "Sulekha US", focus: "Local service providers & business leads", url: "https://us.sulekha.com" },
  { name: "ApnaUSA", focus: "Rooms, rentals, jobs, items & events", url: "https://apnausa.co" },
  { name: "eKnazar", focus: "City-based Indian community classifieds", url: "https://www.eknazar.com/ekClassifieds/" },
];

export const metadata: Metadata = {
  title: pageTitle("Indian-American newspapers & desi classifieds in the USA"),
  description: metaDescription(
    "The full list of Indian-American newspapers and desi classifieds websites in the USA — News India Times, Desi Talk, India-West, Khabar, Sulekha and more — plus where to list your desi business free.",
  ),
  alternates: { canonical: "/newspapers" },
};

export default function NewspapersPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Indian-American newspapers &amp; desi classifieds in the USA
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
          Every Indian-American newspaper and desi classifieds site we could
          find, in one place — for readers looking for their community&apos;s
          voice, and for businesses deciding where to advertise. We keep the
          list current as publications open and close; if we missed one,{" "}
          <Link href="/report" className="font-semibold text-indigo-600">
            tell us
          </Link>
          .
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          📰 Newspapers &amp; media publishers
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {NEWSPAPERS.map((n) => (
            <a
              key={n.name}
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-baseline justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-indigo-300 hover:bg-indigo-50/40"
            >
              <span className="font-semibold text-slate-900">{n.name}</span>
              <span className="text-right text-xs text-slate-500">{n.focus}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          🗂️ Desi classifieds websites
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {CLASSIFIEDS.map((n) => (
            <a
              key={n.name}
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-baseline justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-indigo-300 hover:bg-indigo-50/40"
            >
              <span className="font-semibold text-slate-900">{n.name}</span>
              <span className="text-right text-xs text-slate-500">{n.focus}</span>
            </a>
          ))}
        </div>
      </section>

      <Card className="space-y-3 border-amber-200 bg-amber-50/60">
        <h2 className="text-lg font-bold text-slate-900">
          Run a desi publication? Partner with GoDesi
        </h2>
        <p className="text-sm leading-relaxed text-slate-700">
          Your advertisers can carry a free GoDesi listing alongside their print
          ad — it keeps working after the issue date — and you earn a referral
          fee on any paid plan they take. We already carry partner papers on{" "}
          <Link href="/news" className="font-semibold text-indigo-600">
            the GoDesi news wire
          </Link>{" "}
          with full credit and links back.
        </p>
        <LinkButton href="/contact" className="bg-amber-500 text-slate-900">
          Talk to us about partnering
        </LinkButton>
      </Card>
    </div>
  );
}
